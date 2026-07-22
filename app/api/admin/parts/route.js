import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin, safeJson } from "@/lib/adminAuth";
import Listing from "@/models/Listing";

export async function POST(req) {
  // 1. Verify Admin Session
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    // 2. Connect MongoDB
    await connectDB();

    const { action, partId, partData } = await safeJson(req);

    // 3. ADD NEW SPARE PART
    if (action === "addPart") {
      if (!partData?.title || !partData?.brand || !partData?.model) {
        return NextResponse.json({ error: "Part title, brand and model are required." }, { status: 400 });
      }

      const newPart = await Listing.create({
        title: partData.title.trim(),
        brand: partData.brand.trim(),
        model: partData.model.trim() || "Universal",
        partCategory: partData.partCategory || "other",
        category: "Parts",
        price: Number(partData.price) || 999,
        originalPrice: Number(partData.originalPrice) || Math.round(Number(partData.price) * 1.3),
        listingType: "part",
        status: "active",
        images: [partData.image?.trim() || "/placeholder-device.svg"],
        conditionGrade: "Superb",
        description: partData.description?.trim() || `Original verified ${partData.partCategory} replacement part for ${partData.brand} ${partData.model}.`,
        seller: auth.session.id,
        verification: { trustScore: 95, status: "verified" }
      });

      return NextResponse.json({
        success: true,
        message: "Spare part saved to MongoDB catalog successfully!",
        part: { ...newPart.toObject(), _id: newPart._id.toString() }
      });
    }

    // 4. DELETE SPARE PART
    if (action === "deletePart" && partId) {
      const deleted = await Listing.findByIdAndDelete(partId).lean();
      if (!deleted) {
        return NextResponse.json({ error: "Part not found in MongoDB." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Spare part permanently removed from MongoDB catalog."
      });
    }

    // 5. UPDATE PART PRICE
    if (action === "updateStock" && partId) {
      if (!partData?.price) {
        return NextResponse.json({ error: "New price is required for stock update." }, { status: 400 });
      }
      const updated = await Listing.findByIdAndUpdate(
        partId,
        { price: Number(partData.price) },
        { new: true, runValidators: true }
      ).lean();
      if (!updated) {
        return NextResponse.json({ error: "Part not found in MongoDB." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Spare part price updated in MongoDB.",
        part: { ...updated, _id: updated._id.toString() }
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  } catch (err) {
    console.error("[Admin Parts API Error]", err);
    return NextResponse.json({
      error: `MongoDB Operation Failed: ${err.message}`
    }, { status: 500 });
  }
}
