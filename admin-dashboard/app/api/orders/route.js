import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import AuditLog from "@/models/AuditLog";
import "@/models/User";
import "@/models/Listing";

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("buyer", "name email phone")
      .populate("seller", "name email businessName")
      .populate("listing", "brand model title price images")
      .lean();

    return NextResponse.json({
      success: true,
      orders: orders.map(o => ({ ...o, _id: o._id.toString() }))
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { orderId, orderStatus, escrowStatus } = await req.json();
    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (escrowStatus) updates.escrowStatus = escrowStatus;

    const updated = await Order.findByIdAndUpdate(orderId, { $set: updates }, { new: true });

    try {
      await AuditLog.create({
        role: "admin",
        action: "ORDER_STATUS_UPDATE",
        entity: "Order",
        entityId: orderId,
        details: `Updated order ${updated?.bill?.billNumber || orderId}: orderStatus=${updated?.orderStatus}, escrowStatus=${updated?.escrowStatus}`,
        status: "SUCCESS"
      });
    } catch (_) {}

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
