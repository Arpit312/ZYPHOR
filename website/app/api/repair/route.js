import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RepairTicket from "@/models/RepairTicket";
import { getSessionUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const isTech = user.role === "technician";
    const isAdmin = user.role === "admin";

    let query = {};
    if (isTech) {
      // Technicians see jobs assigned to them, or open unassigned tickets
      query = { $or: [{ assignedTechnician: user.id }, { assignedTechnician: null }] };
    } else if (!isAdmin) {
      // Customers see their own tickets
      query = { user: user.id };
    }

    const tickets = await RepairTicket.find(query)
      .populate("user", "name email phone city")
      .populate("assignedTechnician", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ticketId, status, claimJob } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "Missing ticketId" }, { status: 400 });
    }

    const update = {};
    if (status) update.status = status;
    if (claimJob && user.role === "technician") update.assignedTechnician = user.id;

    const ticket = await RepairTicket.findByIdAndUpdate(ticketId, update, { new: true });
    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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
