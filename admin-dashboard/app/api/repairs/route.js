import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RepairTicket from "@/models/RepairTicket";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { ticketNumber: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
        { pincode: new RegExp(search, "i") },
        { address: new RegExp(search, "i") },
        { issue: new RegExp(search, "i") }
      ];
    }

    const tickets = await RepairTicket.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email phone")
      .populate("assignedTechnician", "name email phone businessName trustRating")
      .lean();

    // Fetch technicians list so admin can assign them
    const technicians = await User.find({ role: "technician" })
      .select("name email phone trustRating city")
      .lean();

    const allTickets = await RepairTicket.find().select("status estimatedPrice").lean();
    const stats = {
      total: allTickets.length,
      pending: allTickets.filter(t => t.status === "pending").length,
      assigned: allTickets.filter(t => t.status === "assigned").length,
      inRepair: allTickets.filter(t => t.status === "in_repair").length,
      completed: allTickets.filter(t => t.status === "completed").length,
      totalEstimatedValue: allTickets.reduce((sum, t) => sum + (Number(t.estimatedPrice) || 0), 0)
    };

    return NextResponse.json({
      success: true,
      tickets: tickets.map(t => ({
        ...t,
        _id: t._id.toString(),
        user: t.user ? { ...t.user, _id: t.user._id.toString() } : null,
        assignedTechnician: t.assignedTechnician ? { ...t.assignedTechnician, _id: t.assignedTechnician._id.toString() } : null,
      })),
      technicians: technicians.map(tech => ({ ...tech, _id: tech._id.toString() })),
      stats
    });
  } catch (error) {
    console.error("Error fetching repair tickets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { ticketId, status, assignedTechnician, estimatedPrice, adminNotes } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required" }, { status: 400 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTechnician !== undefined) updateData.assignedTechnician = assignedTechnician || null;
    if (estimatedPrice !== undefined) updateData.estimatedPrice = Number(estimatedPrice);
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updated = await RepairTicket.findByIdAndUpdate(
      ticketId,
      { $set: updateData },
      { new: true }
    )
    .populate("user", "name email phone")
    .populate("assignedTechnician", "name email phone");

    if (!updated) {
      return NextResponse.json({ success: false, error: "Repair ticket not found" }, { status: 404 });
    }

    // Audit log
    try {
      await AuditLog.create({
        role: "admin",
        action: assignedTechnician ? "REPAIR_ASSIGN" : "REPAIR_STATUS_UPDATE",
        entity: "RepairTicket",
        entityId: ticketId,
        details: `Updated repair ticket ${updated.ticketNumber || ticketId}. Status: ${updated.status}. Technician: ${updated.assignedTechnician?.name || "Unassigned"}.`,
        status: "SUCCESS"
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Repair ticket updated successfully",
      ticket: updated
    });
  } catch (error) {
    console.error("Error updating repair ticket:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
