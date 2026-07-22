import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();
    
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check OTP
    if (user.resetOtp !== parseInt(otp) || new Date() > user.resetOtpExpiry) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    // Login automatically
    const token = signToken({ 
      id: user._id.toString(), 
      role: user.role, 
      email: user.email 
    });

    return NextResponse.json({ 
      success: true, 
      token,
      message: "Password reset successful" 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
