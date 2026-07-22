import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Listing from "@/models/Listing";
import { getSessionUser } from "@/lib/auth";
import { calculateBill, generateInvoiceNumber } from "@/lib/billing";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const orders = await Order.find({ $or: [{ buyer: session.id }, { seller: session.id }] })
    .sort({ createdAt: -1 })
    .populate("listing","title brand model price images")
    .populate("buyer","name email")
    .populate("seller","name businessName")
    .lean();
  return NextResponse.json({ orders });
}

export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Please log in to buy." }, { status: 401 });
    
    let body = {};
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    } else {
      try {
        const text = await req.text();
        body = Object.fromEntries(new URLSearchParams(text));
      } catch {
        body = {};
      }
    }
    const { listingId, paymentMethod, deliveryAddress } = body;
    await connectDB();

    const listing = await Listing.findById(listingId).populate("seller","gstNumber");
    if (!listing || listing.status !== "active")
      return NextResponse.json({ error: "Listing not available." }, { status: 404 });
    if (listing.seller._id.toString() === session.id)
      return NextResponse.json({ error: "You cannot buy your own listing." }, { status: 400 });

    // Calculate bill with platform fee + GST
    const bill = calculateBill(listing.price, listing.seller?.gstNumber);
    bill.billNumber = generateInvoiceNumber("ZYP");

    const order = await Order.create({
      buyer: session.id, seller: listing.seller._id, listing: listing._id,
      amount: listing.price, bill,
      paymentMethod: paymentMethod || "upi",
      deliveryAddress,
      escrowStatus: "held", orderStatus: "placed",
    });

    listing.status = "sold";
    await listing.save();

    // Update seller earnings
    const User = (await import("@/models/User")).default;
    await User.findByIdAndUpdate(listing.seller._id, {
      $inc: { totalSales: 1, totalEarnings: bill.sellerReceives }
    });

    return NextResponse.json({ order, bill }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
