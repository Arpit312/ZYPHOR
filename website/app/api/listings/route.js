import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import User from "@/models/User"; // Required for populate("seller")
import { getSessionUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const listingType = searchParams.get("type");
    const q = searchParams.get("q");
    const brand = searchParams.get("brand");
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 60);
    const seller = searchParams.get("seller");

    const filter = { status: "active" };
    if (listingType) filter.listingType = listingType;
    if (brand) filter.brand = new RegExp(`^${brand}$`, "i");
    if (city) filter.city = new RegExp(`^${city}$`, "i");
    if (seller) filter.seller = seller;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) filter.$or = [{ brand: new RegExp(q,"i") }, { model: new RegExp(q,"i") }, { title: new RegExp(q,"i") }];

    const sortMap = { newest:{createdAt:-1}, price_low:{price:1}, price_high:{price:-1}, trust:{"verification.trustScore":-1} };
    const listings = await Listing.find(filter).sort(sortMap[sort]||sortMap.newest).limit(limit)
      .populate("seller","name businessName city verifiedSeller").lean();

    return NextResponse.json({ listings, count: listings.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Please log in to create a listing." }, { status: 401 });

    const body = await req.json();
    await connectDB();

    // Check subscription for seller roles
    const User = (await import("@/models/User")).default;
    const user = await User.findById(session.id);
    const needsSub = ["retailer","wholesaler","technician"].includes(user?.role);
    if (needsSub && user?.subscription?.status !== "active") {
      return NextResponse.json({ error: "Active subscription required to list items. Please subscribe.", needsSubscription: true }, { status: 403 });
    }

    const listing = await Listing.create({
      seller: session.id,
      listingType: body.listingType || "device",
      category: body.category || "Smartphone",
      brand: body.brand, model: body.model, title: body.title,
      description: body.description, price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      conditionGrade: body.conditionGrade || "Good", conditionClaim: body.conditionClaim,
      imei: body.imei, storage: body.storage, ram: body.ram, city: body.city,
      images: body.images || [], tags: body.tags || [],
      emiEligible: body.emiEligible !== false,
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
