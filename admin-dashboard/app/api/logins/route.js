import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import LoginSession from "@/models/LoginSession";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const query = {};
    if (role && role !== "all") query.role = role;
    if (status && status !== "all") query.status = status;

    const [sessions, allSessions] = await Promise.all([
      LoginSession.find(query).sort({ loginAt: -1 }).limit(200).lean(),
      LoginSession.find().select("role status").lean()
    ]);

    const roleStats = {
      admin: allSessions.filter(s => s.role === "admin" && s.status === "ACTIVE").length,
      retailer: allSessions.filter(s => s.role === "retailer" && s.status === "ACTIVE").length,
      wholesaler: allSessions.filter(s => s.role === "wholesaler" && s.status === "ACTIVE").length,
      technician: allSessions.filter(s => s.role === "technician" && s.status === "ACTIVE").length,
      customer: allSessions.filter(s => s.role === "customer" && s.status === "ACTIVE").length,
      totalActive: allSessions.filter(s => s.status === "ACTIVE").length,
      totalRecorded: allSessions.length
    };

    const serializedSessions = sessions.map(s => ({
      ...s,
      _id: s._id.toString(),
      userId: s.userId ? s.userId.toString() : null,
      loginAt: s.loginAt ? s.loginAt.toISOString() : new Date().toISOString(),
      lastActiveAt: s.lastActiveAt ? s.lastActiveAt.toISOString() : new Date().toISOString(),
      createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      sessions: serializedSessions,
      roleStats
    });
  } catch (error) {
    console.error("GET /api/logins error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, userEmail, userName, role, ipAddress, device, userAgent, location } = body;

    if (!userEmail || !role) {
      return NextResponse.json({ success: false, error: "userEmail and role are required" }, { status: 400 });
    }

    let finalUserId = userId;
    let finalUserName = userName;

    if (!finalUserId) {
      const u = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (u) {
        finalUserId = u._id;
        finalUserName = u.name;
      }
    }

    const session = await LoginSession.create({
      userId: finalUserId,
      userName: finalUserName || userEmail.split("@")[0],
      userEmail: userEmail.toLowerCase().trim(),
      role,
      ipAddress: ipAddress || "127.0.0.1",
      device: device || "Web Browser",
      userAgent: userAgent || "",
      location: location || "India (Cloud)",
      status: "ACTIVE",
      loginAt: new Date(),
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Also record an Audit Log entry for the login
    await AuditLog.create({
      userId: finalUserId,
      userName: finalUserName || userEmail.split("@")[0],
      userEmail: userEmail.toLowerCase().trim(),
      role,
      action: "LOGIN",
      entity: "Auth",
      entityId: session._id.toString(),
      details: `Successful authenticated login session established from ${device || "Web Browser"} (${ipAddress || "127.0.0.1"})`,
      ipAddress: ipAddress || "127.0.0.1",
      status: "SUCCESS"
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("POST /api/logins error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { sessionId, role, action } = await req.json();

    if (action === "revoke_role" && role) {
      // Revoke all active sessions for this role
      await LoginSession.updateMany(
        { role, status: "ACTIVE" },
        { $set: { status: "REVOKED", lastActiveAt: new Date() } }
      );
      return NextResponse.json({ success: true, message: `All active ${role} sessions revoked.` });
    }

    if (sessionId) {
      const updated = await LoginSession.findByIdAndUpdate(
        sessionId,
        { status: "REVOKED", lastActiveAt: new Date() },
        { new: true }
      );
      return NextResponse.json({ success: true, session: updated });
    }

    return NextResponse.json({ success: false, error: "Missing sessionId or action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/logins error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
