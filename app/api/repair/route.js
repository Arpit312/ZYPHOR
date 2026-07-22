import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RepairTicket from "@/models/RepairTicket";
import { getSessionUser } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const user = await getSessionUser();

    const ticket = await RepairTicket.create({
      user: user?._id || null,
      brand: body.brand || "Generic",
      model: body.model || "Device",
      issue: body.issue || "General Repair",
      pincode: body.pincode || "400001",
      preferredDate: body.preferredDate ? new Date(body.preferredDate) : new Date(),
      address: body.address || "",
      contactPhone: body.contactPhone || "",
      estimatedPrice: body.estimatedPrice || 1499,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
