const router = require("express").Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const auth = require("../middleware/auth");
const { SUBSCRIPTION_PLANS } = require("../services/billing");
const { notify } = require("../services/notify");

// Escape user input before using it inside a RegExp (prevents ReDoS / crashes)
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SELLER_FIELDS = "name businessName city verifiedSeller trustRating phone createdAt totalSales";

// Mass-assignment protection: only these fields may be written from the client.
// `seller`, `status`, `verification`, `views`, `reviews` are server-controlled.
const ALLOWED_CREATE = ["listingType","category","partCategory","brand","model","title","description","price","originalPrice","conditionGrade","conditionClaim","imei","storage","ram","city","images","tags","emiEligible"];
const ALLOWED_UPDATE = ["listingType","category","partCategory","brand","model","title","description","price","originalPrice","conditionGrade","conditionClaim","storage","ram","city","images","tags","emiEligible","status"];
const SELLER_STATUSES = ["active","inactive","draft"];
const GRADES = ["Pristine","Superb","Excellent","Good","Fair"];

const cleanImages = (arr) =>
  Array.isArray(arr) ? arr.filter((u) => typeof u === "string" && /^https?:\/\//.test(u)).slice(0, 10) : [];

// GET /api/listings — public search/filter
router.get("/", auth.optional, async (req, res) => {
  try {
    const { type, q, brand, city, minPrice, maxPrice, sort = "newest", limit = 24, seller, tag } = req.query;
    const filter = { status: "active" };
    if (type) filter.listingType = type;
    if (brand) filter.brand = new RegExp(`^${esc(brand)}$`, "i");
    if (city) filter.city = new RegExp(esc(city), "i");
    if (seller) filter.seller = seller;
    if (tag) filter.tags = tag; // matches listings whose tags array contains this value
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) {
      const rx = new RegExp(esc(q), "i");
      filter.$or = [{ brand: rx }, { model: rx }, { title: rx }, { description: rx }];
    }
    const sortMap = {
      newest: { createdAt: -1 }, price_low: { price: 1 }, price_high: { price: -1 },
      trust: { "verification.trustScore": -1 }, views: { views: -1 },
    };
    const listings = await Listing.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .limit(Math.min(Number(limit) || 24, 60))
      .populate("seller", SELLER_FIELDS)
      .lean();
    res.json({ listings, count: listings.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/listings/seller/:id — public seller storefront (MUST be before /:id)
router.get("/seller/:id", async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select(SELLER_FIELDS).lean();
    if (!seller) return res.status(404).json({ error: "Seller not found." });
    const listings = await Listing.find({ seller: req.params.id, status: "active" })
      .sort({ createdAt: -1 }).limit(60).lean();
    res.json({ seller: { ...seller, id: seller._id }, listings, count: listings.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/listings/:id — detail (+ fire-and-forget view counter, + reviews)
router.get("/:id", async (req, res) => {
  try {
    const l = await Listing.findById(req.params.id)
      .populate("seller", SELLER_FIELDS)
      .populate("reviews.user", "name")
      .lean();
    if (!l) return res.status(404).json({ error: "Listing not found." });
    Listing.updateOne({ _id: l._id }, { $inc: { views: 1 } }).catch(() => {});
    res.json({ listing: l });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/listings — create (seller always taken from JWT, never from body)
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    const needsSub = ["retailer", "wholesaler", "technician"].includes(user.role);
    if (needsSub && user.subscription?.status !== "active")
      return res.status(403).json({ error: "Subscription required to list.", needsSubscription: true });

    // Enforce per-plan active-listing cap
    if (needsSub) {
      const activeSub = await Subscription.findOne({ user: user._id, status: "active" }).lean();
      const plan = activeSub?.plan || user.subscription?.plan;
      const cap = SUBSCRIPTION_PLANS[plan]?.maxListings ?? 0;
      if (cap < 999) {
        const activeCount = await Listing.countDocuments({ seller: user._id, status: "active" });
        if (activeCount >= cap)
          return res.status(403).json({ error: `Your ${plan} plan allows ${cap} active listings. Upgrade to list more.`, needsSubscription: true });
      }
    }

    const b = req.body || {};
    const price = Number(b.price);
    if (!String(b.brand || "").trim() || !String(b.model || "").trim() || !isFinite(price) || price < 1)
      return res.status(400).json({ error: "Brand, model and a valid price (min ₹1) are required." });

    const doc = { seller: req.user.id };
    for (const k of ALLOWED_CREATE) if (b[k] !== undefined) doc[k] = b[k];
    doc.price = price;
    doc.images = cleanImages(b.images);
    if (doc.listingType && !["device", "part"].includes(doc.listingType)) doc.listingType = "device";
    if (doc.conditionGrade && !GRADES.includes(doc.conditionGrade)) doc.conditionGrade = "Good";
    if (!doc.title) doc.title = `${doc.brand} ${doc.model}`.trim();
    doc.status = "active";

    const listing = await Listing.create(doc);
    await notify(user._id, "Listing published", `${doc.title} is now live in the marketplace.`, "listing");
    res.status(201).json({ listing });
  } catch (err) {
    if (err?.name === "ValidationError")
      return res.status(400).json({ error: Object.values(err.errors)[0]?.message || "Invalid listing data." });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/listings/:id — owner only, whitelisted fields via $set (never strips website fields)
router.patch("/:id", auth, async (req, res) => {
  try {
    const l = await Listing.findOne({ _id: req.params.id, seller: req.user.id }).lean();
    if (!l) return res.status(404).json({ error: "Listing not found or unauthorized." });
    const b = req.body || {};
    const update = {};
    for (const k of ALLOWED_UPDATE) if (b[k] !== undefined) update[k] = b[k];
    if (update.price !== undefined) {
      const p = Number(update.price);
      if (!isFinite(p) || p < 1) return res.status(400).json({ error: "Invalid price." });
      update.price = p;
    }
    if (update.images !== undefined) update.images = cleanImages(update.images);
    if (update.conditionGrade !== undefined && !GRADES.includes(update.conditionGrade))
      return res.status(400).json({ error: "Invalid condition grade." });
    if (update.status !== undefined) {
      if (!SELLER_STATUSES.includes(update.status))
        return res.status(400).json({ error: "You cannot set this status." });
      if (l.status === "sold" && update.status === "active") delete update.status; // sold stays sold
    }
    const updated = await Listing.findOneAndUpdate(
      { _id: l._id, seller: req.user.id }, { $set: update }, { new: true, runValidators: true }
    ).lean();
    res.json({ listing: updated });
  } catch (err) {
    if (err?.name === "ValidationError")
      return res.status(400).json({ error: Object.values(err.errors)[0]?.message || "Invalid update." });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/listings/:id — owner only
router.delete("/:id", auth, async (req, res) => {
  try {
    const l = await Listing.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
    if (!l) return res.status(404).json({ error: "Listing not found." });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/listings/:id/reviews — one review per user per listing
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    const r = Number(rating);
    if (!isFinite(r) || r < 1 || r > 5) return res.status(400).json({ error: "Rating must be between 1 and 5." });
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found." });
    if (listing.reviews.some((rv) => rv.user.toString() === req.user.id))
      return res.status(409).json({ error: "You already reviewed this listing." });
    listing.reviews.push({ user: req.user.id, rating: r, comment: String(comment || "").slice(0, 500) });
    listing.reviewCount = listing.reviews.length;
    listing.averageRating = Math.round((listing.reviews.reduce((s, rv) => s + rv.rating, 0) / listing.reviewCount) * 10) / 10;
    await listing.save();
    await notify(listing.seller, "New review", `${r}★ review on ${listing.title || listing.model}`, "listing");
    const out = await Listing.findById(listing._id).populate("reviews.user", "name").lean();
    res.status(201).json({ listing: out });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
