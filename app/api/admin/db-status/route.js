import { NextResponse } from "next/server";
import { connectDB, getDBStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const status = getDBStatus();
    return NextResponse.json({
      success: true,
      db: status,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      db: { state: "error", error: err.message },
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
