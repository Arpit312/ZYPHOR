import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Rate limit: 5 attempts per minute
    if (!rateLimit(email, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again in 1 minute." },
        { status: 429 }
      );
    }

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    if (!user.isActive)
      return NextResponse.json({ error: "Account deactivated. Contact support." }, { status: 403 });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    // ONE token - works for both web (cookie) AND mobile (Bearer)
    const token = signToken({
      id: user._id.toString(), role: user.role, name: user.name, email: user.email,
    });

    // Set cookie for web
    const cookieStore = await cookies();
    cookieStore.set("zyphor_session", token, {
      httpOnly: true, sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/", maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      token,  // mobile app uses this
      user: { id: user._id, name: user.name, email: user.email, role: user.role,
              city: user.city, businessName: user.businessName,
              subscription: user.subscription, profileImage: user.profileImage },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Login failed." }, { status: 500 });
  }
}
