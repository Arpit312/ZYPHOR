import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StoreLocation from "@/models/StoreLocation";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    let filter = { isOperational: true };
    if (query) {
      const regex = new RegExp(query, "i");
      filter.$or = [{ city: regex }, { name: regex }, { pincode: regex }, { address: regex }];
    }

    const stores = await StoreLocation.find(filter).sort({ rating: -1 }).lean();
    return NextResponse.json({ success: true, stores });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
