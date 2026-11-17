import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const plan = searchParams.get("plan");
    const status = searchParams.get("status");

    const query = {};
    if (plan && plan !== "all") query.plan = plan;
    if (status && status !== "all") query.status = status;

    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email phone role businessName subscription")
      .lean();

    // Calculate aggregated metrics
    const totalActive = subscriptions.filter(s => s.status === "active").length;
    const totalRevenue = subscriptions.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const planCounts = {
      basic: subscriptions.filter(s => s.plan === "basic").length,
      pro: subscriptions.filter(s => s.plan === "pro").length,
      enterprise: subscriptions.filter(s => s.plan === "enterprise").length,
    };

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(s => ({
        ...s,
        _id: s._id.toString(),
        userId: s.user?._id?.toString()
      })),
      stats: {
        totalSubscriptions: subscriptions.length,
        totalActive,
        totalRevenue,
        planCounts
      }
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { subscriptionId, status, extendDays } = body;

    if (!subscriptionId) {
      return NextResponse.json({ success: false, error: "subscriptionId is required" }, { status: 400 });
    }

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) {
      return NextResponse.json({ success: false, error: "Subscription not found" }, { status: 404 });
    }

    if (status) {
      sub.status = status;
    }

    if (extendDays && Number(extendDays) > 0) {
      const currentEnd = new Date(sub.endDate || Date.now());
      currentEnd.setDate(currentEnd.getDate() + Number(extendDays));
      sub.endDate = currentEnd;
    }

    await sub.save();

    // Synchronize with User model
    if (sub.user) {
      await User.findByIdAndUpdate(sub.user, {
        "subscription.status": sub.status,
        "subscription.plan": sub.plan,
        "subscription.endDate": sub.endDate,
        "subscription.startDate": sub.startDate,
      });
    }

    // Record Audit Log
    try {
      await AuditLog.create({
        role: "admin",
        action: "SUBSCRIPTION_STATUS_CHANGE",
        entity: "Subscription",
        entityId: subscriptionId,
        details: `Modified subscription for plan ${sub.plan}. Status set to ${sub.status}. End date: ${sub.endDate}`,
        status: "SUCCESS"
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
      subscription: sub
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, plan, billingCycle = "monthly", durationMonths = 1 } = body;

    if (!userId || !plan) {
      return NextResponse.json({ success: false, error: "userId and plan are required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const planPrices = {
      basic: billingCycle === "yearly" ? 2990 : 299,
      pro: billingCycle === "yearly" ? 7990 : 799,
      enterprise: billingCycle === "yearly" ? 19990 : 1999,
    };

    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + Number(durationMonths || 1));
    } else {
      endDate.setMonth(endDate.getMonth() + Number(durationMonths || 1));
    }

    const newSub = await Subscription.create({
      user: user._id,
      plan: plan,
      status: "active",
      billingCycle: billingCycle,
      startDate: startDate,
      endDate: endDate,
      amount: planPrices[plan] || 299,
      invoiceNumber: `INV-SUB-${Date.now().toString().slice(-6)}`,
      planDetails: {
        label: plan.toUpperCase(),
        maxListings: plan === "enterprise" ? 999 : plan === "pro" ? 50 : 10,
        aiCallsPerMonth: plan === "enterprise" ? 999 : plan === "pro" ? 200 : 50,
      }
    });

    // Sync to User
    user.subscription = {
      plan: plan,
      status: "active",
      startDate: startDate,
      endDate: endDate,
      billingCycle: billingCycle,
    };
    await user.save();

    // Log Action
    try {
      await AuditLog.create({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        role: "admin",
        action: "SUBSCRIPTION_GRANTED",
        entity: "Subscription",
        entityId: newSub._id.toString(),
        details: `Granted ${plan} subscription (${billingCycle}) to ${user.email}`,
        status: "SUCCESS"
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${plan} subscription for ${user.name}`,
      subscription: newSub
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
