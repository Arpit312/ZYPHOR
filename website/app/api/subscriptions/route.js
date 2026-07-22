import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { getSessionUser } from "@/lib/auth";
import { SUBSCRIPTION_PLANS, generateInvoiceNumber } from "@/lib/billing";

// GET - get current subscription
export async function GET(req) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const sub = await Subscription.findOne({ user: session.id, status: "active" }).lean();
  return NextResponse.json({ subscription: sub });
}

// POST - create/activate subscription
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { plan, billingCycle, razorpayPaymentId, razorpayOrderId } = await req.json();
    if (!plan || !["basic","pro","enterprise"].includes(plan))
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

    const cycle = billingCycle === "yearly" ? "yearly" : "monthly";
    const planData = SUBSCRIPTION_PLANS[plan];
    const amount = planData[cycle];

    const now = new Date();
    const endDate = new Date(now);
    if (cycle === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);

    await connectDB();

    // Deactivate old subs
    await Subscription.updateMany({ user: session.id, status: "active" }, { status: "cancelled" });

    const sub = await Subscription.create({
      user: session.id, plan, status: "active", billingCycle: cycle,
      startDate: now, endDate, amount,
      razorpayOrderId, razorpayPaymentId,
      invoiceNumber: generateInvoiceNumber("ZYP-SUB"),
      planDetails: { maxListings: planData.maxListings, aiCallsPerMonth: planData.aiCallsPerMonth, label: planData.label },
    });

    // Update user subscription
    await User.findByIdAndUpdate(session.id, {
      "subscription.plan": plan,
      "subscription.status": "active",
      "subscription.startDate": now,
      "subscription.endDate": endDate,
      "subscription.billingCycle": cycle,
    });

    return NextResponse.json({ subscription: sub, message: "Subscription activated!" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
