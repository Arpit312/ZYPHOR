import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    const mongoose = require("mongoose");
    const dummySeller = new mongoose.Types.ObjectId();

    const newListing = await Listing.create({
      ...data,
      seller: dummySeller, 
      verification: {
        isVerified: true,
        trustScore: 100,
        checksPassed: ["imei", "battery", "display", "admin_added"]
      }
    });

    return NextResponse.json({ success: true, listing: newListing }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
