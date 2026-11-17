import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const query = {};
    if (status && status !== "all") query.status = status;
    if (type && type !== "all") query.listingType = type;
    if (search) {
      query.$or = [
        { brand: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
        { title: new RegExp(search, "i") }
      ];
    }

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .populate("seller", "name email role businessName")
      .lean();

    return NextResponse.json({
      success: true,
      listings: listings.map(l => ({ ...l, _id: l._id.toString() })),
      count: listings.length
    });
  } catch (error) {
    console.error("Error fetching products in admin:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // Find real Admin user from the shared database
    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      adminUser = await User.findOne();
    }

    const title = data.title || `${data.brand} ${data.model}${data.storage ? ` (${data.storage})` : ""}`;

    const newListing = await Listing.create({
      seller: adminUser ? adminUser._id : undefined,
      listingType: data.listingType || "device",
      category: data.category || (data.listingType === "part" ? "Parts" : "Smartphone"),
      partCategory: data.partCategory || "other",
      brand: data.brand?.trim(),
      model: data.model?.trim(),
      title: title.trim(),
      description: data.description || `Official verified ${data.brand} ${data.model} listed via ZYPHOR Admin.`,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      conditionGrade: data.conditionGrade || "Good",
      conditionClaim: data.conditionClaim || "Admin inspected & verified authentic",
      imei: data.imei || undefined,
      storage: data.storage || "128GB",
      ram: data.ram || "8GB",
      city: data.city || "Pan India",
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ["/placeholder-device.svg"],
      tags: Array.isArray(data.tags) ? data.tags : [],
      emiEligible: data.emiEligible !== false,
      status: data.status || "active",
      verification: {
        status: "verified",
        trustScore: 98,
        components: {
          physicalCondition: 96,
          functionalCondition: 98,
          documentAuthenticity: 100,
          sellerReliability: 100,
          priceFairness: 96,
        },
        aiSummary: "Verified directly by ZYPHOR Master QC Team",
        flags: []
      }
    });

    return NextResponse.json({ success: true, listing: newListing }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
