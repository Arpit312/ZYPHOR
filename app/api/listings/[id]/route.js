import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { getSessionUser } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const listing = await Listing.findById(id)
      .populate("seller", "name businessName city verifiedSeller phone email")
      .lean();
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    await Listing.findByIdAndUpdate(id, { $inc: { views: 1 } });
    return NextResponse.json({ listing });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const listing = await Listing.findOne({ _id: id, seller: session.id });
    if (!listing) return NextResponse.json({ error: "Listing not found or unauthorized." }, { status: 404 });
    const body = await req.json();
    Object.assign(listing, body);
    await listing.save();
    return NextResponse.json({ listing });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const listing = await Listing.findOneAndDelete({ _id: id, seller: session.id });
    if (!listing) return NextResponse.json({ error: "Not found or unauthorized." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
