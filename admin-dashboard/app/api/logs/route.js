import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const limit = Number(searchParams.get("limit") || 100);

    const query = {};
    if (role && role !== "all") query.role = role;
    if (action && action !== "all") query.action = action;
    if (search) {
      query.$or = [
        { userName: new RegExp(search, "i") },
        { userEmail: new RegExp(search, "i") },
        { action: new RegExp(search, "i") },
        { details: new RegExp(search, "i") },
        { entity: new RegExp(search, "i") },
      ];
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Summary counts by role (100% real counts)
    const allLogs = await AuditLog.find().select("role").lean();
    const roleStats = {
      admin: allLogs.filter(l => l.role === "admin").length,
      retailer: allLogs.filter(l => l.role === "retailer").length,
      wholesaler: allLogs.filter(l => l.role === "wholesaler").length,
      technician: allLogs.filter(l => l.role === "technician").length,
      customer: allLogs.filter(l => l.role === "customer").length,
    };

    return NextResponse.json({
      success: true,
      logs: logs.map(l => ({ ...l, _id: l._id.toString() })),
      total: logs.length,
      roleStats
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.action || !body.role) {
      return NextResponse.json({ success: false, error: "action and role are required" }, { status: 400 });
    }

    const newLog = await AuditLog.create({
      userId: body.userId,
      userName: body.userName || "Admin User",
      userEmail: body.userEmail,
      role: body.role,
      action: body.action,
      entity: body.entity || "General",
      entityId: body.entityId,
      details: body.details || "",
      ipAddress: body.ipAddress || req.headers.get("x-forwarded-for") || "127.0.0.1",
      status: body.status || "SUCCESS"
    });

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
