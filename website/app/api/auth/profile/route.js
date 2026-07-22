import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(req) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const user = await User.findByIdAndUpdate(session.id, { $set: body }, { new: true }).select("-passwordHash").lean();
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
