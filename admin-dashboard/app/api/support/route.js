import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const query = {};
    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;
    if (priority && priority !== "all") query.priority = priority;

    if (search) {
      query.$or = [
        { subject: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
        { senderName: new RegExp(search, "i") },
        { senderEmail: new RegExp(search, "i") }
      ];
    }

    const tickets = await Message.find(query)
      .sort({ createdAt: -1 })
      .populate("sender", "name email role businessName phone")
      .lean();

    const allTickets = await Message.find().select("status priority category").lean();
    const stats = {
      total: allTickets.length,
      open: allTickets.filter(t => t.status === "open").length,
      inProgress: allTickets.filter(t => t.status === "in_progress").length,
      resolved: allTickets.filter(t => t.status === "resolved").length,
      urgent: allTickets.filter(t => t.priority === "urgent" || t.priority === "high").length,
    };

    return NextResponse.json({
      success: true,
      tickets: tickets.map(t => ({
        ...t,
        _id: t._id.toString(),
        sender: t.sender ? {
          ...t.sender,
          _id: t.sender._id.toString()
        } : null
      })),
      stats
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { ticketId, status, priority, adminReply } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required" }, { status: 400 });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;
    if (adminReply !== undefined) {
      updateFields.adminReply = adminReply;
      updateFields.adminRepliedAt = new Date();
      updateFields.isRead = true;
      if (!status) updateFields.status = "resolved";
    }

    const updated = await Message.findByIdAndUpdate(
      ticketId,
      { $set: updateFields },
      { new: true }
    ).populate("sender", "name email role");

    if (!updated) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    // Audit log
    try {
      await AuditLog.create({
        role: "admin",
        action: adminReply ? "SUPPORT_REPLY" : "SUPPORT_STATUS_CHANGE",
        entity: "Message",
        entityId: ticketId,
        details: adminReply 
          ? `Admin answered ticket "${updated.subject}". Status set to ${updated.status}.`
          : `Admin changed status of ticket "${updated.subject}" to ${updated.status}.`,
        status: "SUCCESS"
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully",
      ticket: updated
    });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { receiverId, subject, content, category = "general", priority = "medium" } = body;

    if (!subject || !content) {
      return NextResponse.json({ success: false, error: "Subject and content are required" }, { status: 400 });
    }

    let adminUser = await User.findOne({ role: "admin" });

    const newTicket = await Message.create({
      sender: adminUser ? adminUser._id : undefined,
      senderName: adminUser ? adminUser.name : "ZYPHOR Admin Support",
      senderEmail: adminUser ? adminUser.email : "support@zyphor.in",
      senderRole: "admin",
      receiver: receiverId || undefined,
      subject,
      content,
      category,
      priority,
      status: "open",
      isRead: false
    });

    return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 });
  } catch (error) {
    console.error("Error creating support message:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
