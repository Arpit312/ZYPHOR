import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await User.findByIdAndUpdate(id, { $set: body }, { new: true }).select("-passwordHash");
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
      await AuditLog.create({
        role: "admin",
        action: "USER_GOVERNANCE_UPDATE",
        entity: "User",
        entityId: id,
        details: `Updated user ${updated.name} (${updated.email}). Role: ${updated.role}, Verified: ${updated.verifiedSeller}, Active: ${updated.isActive}`,
        status: "SUCCESS"
      });
    } catch (_) {}

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
