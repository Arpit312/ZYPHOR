// ─────────────────────────────────────────────────────────────────────────
// ZYPHOR CATALOG ENGINE
// 100% derived from real Listing documents in MongoDB — zero dummy/seed data.
// Category → Brand → Model → Listings, Cashify-style, fully dynamic.
// ─────────────────────────────────────────────────────────────────────────
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import "@/models/User";

export function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PAGE_SIZE = 12;

/** All active categories, derived from Listing.category field */
export async function getCategories() {
  await connectDB();
  const rows = await Listing.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: "$category", count: { $sum: 1 }, sample: { $first: "$images" } } },
    { $sort: { count: -1 } },
  ]);
  return rows
    .filter(r => r._id)
    .map(r => ({ name: r._id, slug: slugify(r._id), count: r.count, image: r.sample?.[0] || null }));
}

export async function getCategoryBySlug(slug) {
  const cats = await getCategories();
  return cats.find(c => c.slug === slug) || null;
}

/** Brands within a category */
export async function getBrands(categorySlug) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return { category: null, brands: [] };
  await connectDB();
  const rows = await Listing.aggregate([
    { $match: { status: "active", category: category.name } },
    { $group: { _id: "$brand", count: { $sum: 1 }, minPrice: { $min: "$price" }, sample: { $first: "$images" } } },
    { $sort: { count: -1 } },
  ]);
  const brands = rows.filter(r => r._id).map(r => ({
    name: r._id, slug: slugify(r._id), count: r.count, minPrice: r.minPrice, image: r.sample?.[0] || null,
  }));
  return { category, brands };
}

export async function getBrandBySlug(categorySlug, brandSlug) {
  const { category, brands } = await getBrands(categorySlug);
  const brand = brands.find(b => b.slug === brandSlug) || null;
  return { category, brand };
}

/** Models within brand+category */
export async function getModels(categorySlug, brandSlug) {
  const { category, brand } = await getBrandBySlug(categorySlug, brandSlug);
  if (!category || !brand) return { category, brand, models: [] };
  await connectDB();
  const rows = await Listing.aggregate([
    { $match: { status: "active", category: category.name, brand: brand.name } },
    { $group: {
        _id: "$model", count: { $sum: 1 },
        minPrice: { $min: "$price" }, maxPrice: { $max: "$price" },
        sample: { $first: "$images" }, avgTrust: { $avg: "$verification.trustScore" },
    } },
    { $sort: { count: -1 } },
  ]);
  const models = rows.filter(r => r._id).map(r => ({
    name: r._id, slug: slugify(r._id), count: r.count,
    minPrice: r.minPrice, maxPrice: r.maxPrice,
    image: r.sample?.[0] || null, avgTrust: Math.round(r.avgTrust || 0),
  }));
  return { category, brand, models };
}

export async function getModelBySlug(categorySlug, brandSlug, modelSlug) {
  const { category, brand, models } = await getModels(categorySlug, brandSlug);
  const model = models.find(m => m.slug === modelSlug) || null;
  return { category, brand, model };
}

/** Paginated + filterable listings for one model (final catalog leaf) */
export async function getListingsForModel(categorySlug, brandSlug, modelSlug, filters = {}) {
  const { category, brand, model } = await getModelBySlug(categorySlug, brandSlug, modelSlug);
  if (!category || !brand || !model)
    return { category, brand, model, listings: [], total: 0, page: 1, totalPages: 0, facets: null };

  await connectDB();
  const q = { status: "active", category: category.name, brand: brand.name, model: model.name };
  if (filters.condition) q.conditionGrade = filters.condition;
  if (filters.storage)   q.storage = filters.storage;
  if (filters.ram)        q.ram = filters.ram;
  if (filters.minPrice || filters.maxPrice) {
    q.price = {};
    if (filters.minPrice) q.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) q.price.$lte = Number(filters.maxPrice);
  }

  const sortMap = {
    price_low: { price: 1 }, price_high: { price: -1 },
    trust: { "verification.trustScore": -1 }, newest: { createdAt: -1 },
  };
  const sort  = sortMap[filters.sort] || sortMap.newest;
  const page  = Math.max(1, Number(filters.page) || 1);

  const [listings, total, facetRows] = await Promise.all([
    Listing.find(q).sort(sort).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE)
      .populate("seller", "name businessName city verifiedSeller").lean(),
    Listing.countDocuments(q),
    Listing.aggregate([
      { $match: { status: "active", category: category.name, brand: brand.name, model: model.name } },
      { $group: {
          _id: null,
          storages: { $addToSet: "$storage" }, rams: { $addToSet: "$ram" },
          conditions: { $addToSet: "$conditionGrade" },
          minPrice: { $min: "$price" }, maxPrice: { $max: "$price" },
      } },
    ]),
  ]);

  const f = facetRows[0] || {};
  const facets = {
    storages: (f.storages || []).filter(Boolean).sort(),
    rams: (f.rams || []).filter(Boolean).sort(),
    conditions: (f.conditions || []).filter(Boolean),
    minPrice: f.minPrice || 0,
    maxPrice: f.maxPrice || 0,
  };

  return { category, brand, model, listings, total, page, totalPages: Math.ceil(total / PAGE_SIZE), facets };
}

/** Mega-menu data: every category with a handful of top brands */
export async function getMegaMenu() {
  const categories = await getCategories();
  const menu = await Promise.all(categories.map(async (c) => {
    const { brands } = await getBrands(c.slug);
    return { ...c, brands: brands.slice(0, 8) };
  }));
  return menu;
}

/** Live search suggestions — grouped by brand+model, jumps straight to model page */
export async function searchSuggestions(q) {
  if (!q || q.trim().length < 2) return [];
  await connectDB();
  const regex = new RegExp(q.trim(), "i");
  const rows = await Listing.aggregate([
    { $match: { status: "active", $or: [{ brand: regex }, { model: regex }, { title: regex }] } },
    { $group: { _id: { brand: "$brand", model: "$model", category: "$category" }, count: { $sum: 1 }, minPrice: { $min: "$price" } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);
  return rows.map(r => ({
    label: `${r._id.brand} ${r._id.model}`,
    category: r._id.category,
    categorySlug: slugify(r._id.category),
    brandSlug: slugify(r._id.brand),
    modelSlug: slugify(r._id.model),
    minPrice: r.minPrice,
    count: r.count,
  }));
}

export { PAGE_SIZE };
