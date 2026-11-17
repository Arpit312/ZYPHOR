import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import AuditLog from "@/models/AuditLog";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const listing = await Listing.findById(id).populate("seller", "name email role businessName").lean();
    if (!listing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, listing: { ...listing, _id: listing._id.toString() } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.price) body.price = Number(body.price);
    if (body.originalPrice) body.originalPrice = Number(body.originalPrice);

    const updated = await Listing.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      await AuditLog.create({
        role: "admin",
        action: "PRODUCT_UPDATE",
        entity: "Listing",
        entityId: id,
        details: `Updated product ${updated.brand} ${updated.model}. Fields modified: ${Object.keys(body).join(", ")}`,
        status: "SUCCESS"
      });
    } catch (_) {}

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}

export async function PUT(req, context) {
  return PATCH(req, context);
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      await AuditLog.create({
        role: "admin",
        action: "PRODUCT_DELETE",
        entity: "Listing",
        entityId: id,
        details: `Deleted product ${deleted.brand} ${deleted.model} (₹${deleted.price})`,
        status: "WARNING"
      });
    } catch (_) {}

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
