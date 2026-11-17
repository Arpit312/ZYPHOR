import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const query = {};
    if (role && role !== "all") query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { businessName: new RegExp(search, "i") }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select("-passwordHash").lean();
    return NextResponse.json({ success: true, users: users.map(u => ({ ...u, _id: u._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
