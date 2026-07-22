import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, items: [] });

    await connectDB();
    const cart = await Cart.findOne({ user: user._id }).populate("items.listing").lean();
    return NextResponse.json({ success: true, items: cart?.items || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { listingId } = await req.json();
    if (!listingId) return NextResponse.json({ success: false, message: "Listing ID required" }, { status: 400 });

    await connectDB();
    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = await Cart.create({ user: user._id, items: [{ listing: listingId }] });
    } else {
      const exists = cart.items.some((i) => i.listing.toString() === listingId);
      if (!exists) {
        cart.items.push({ listing: listingId });
        await cart.save();
      }
    }

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
