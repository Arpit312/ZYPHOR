import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { getSessionUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { action, partId, partData } = await req.json();

    await connectDB();

    if (action === "addPart") {
      const newPart = await Listing.create({
        title: partData.title,
        brand: partData.brand,
        model: partData.model || "Universal",
        partCategory: partData.partCategory || "other",
        price: Number(partData.price) || 999,
        originalPrice: Number(partData.originalPrice) || Number(partData.price) * 1.3,
        listingType: "part",
        status: "active",
        images: [partData.image || "/placeholder-device.svg"],
        conditionGrade: "New",
        description: partData.description || `Original verified ${partData.partCategory} for ${partData.brand} ${partData.model}`,
        seller: session.id,
        verification: { trustScore: 95, isVerified: true }
      });
      return NextResponse.json({ success: true, part: newPart });
    }

    if (action === "deletePart") {
      await Listing.findByIdAndDelete(partId);
      return NextResponse.json({ success: true, message: "Part removed from catalog." });
    }

    if (action === "updateStock") {
      const updated = await Listing.findByIdAndUpdate(
        partId,
        { price: Number(partData.price) },
        { new: true }
      );
      return NextResponse.json({ success: true, part: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to process parts management request." }, { status: 500 });
  }
}
