import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY?.startsWith("SG.")) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: "Email not found" }, { status: 404 });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Send email if SendGrid configured
    if (process.env.SENDGRID_API_KEY?.startsWith("SG.")) {
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@zyphor.in",
        subject: "ZYPHOR - Your Password Reset OTP",
        html: `
          <h2>Password Reset Request</h2>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>Valid for 10 minutes. Do not share with anyone.</p>
        `
      }).catch(() => {});
    }

    return NextResponse.json({ 
      success: true, 
      message: "OTP generated successfully",
      demoOtp: process.env.NODE_ENV !== "production" ? otp : undefined
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
