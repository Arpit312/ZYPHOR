import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, signToken, ROLES, ROLES_NEEDING_SUBSCRIPTION } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { name, email, password, role, city, phone, businessName, gstNumber } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: "Name, email, password required." }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const safeRole = ROLES.includes(role) ? role : "customer";
    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash, role: safeRole,
      city, phone, gstNumber,
      businessName: ["retailer","wholesaler","technician"].includes(safeRole) ? businessName : undefined,
      subscription: { plan: "free", status: "inactive" },
    });

    const token = signToken({ id: user._id.toString(), role: user.role, name: user.name, email: user.email });

    const cookieStore = await cookies();
    cookieStore.set("zyphor_session", token, {
      httpOnly: true, sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/", maxAge: 60 * 60 * 24 * 7,
    });

    const needsSub = ROLES_NEEDING_SUBSCRIPTION.includes(safeRole);
    return NextResponse.json({
      token,
      user: { id: user._id, name, email: user.email, role: safeRole, subscription: user.subscription },
      needsSubscription: needsSub,
      message: needsSub
        ? `Welcome! Please choose a subscription plan to start selling.`
        : `Welcome to ZYPHOR!`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Signup failed." }, { status: 500 });
  }
}
