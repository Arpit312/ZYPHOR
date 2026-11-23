const router = require("express").Router();
const crypto = require("crypto");
const auth = require("../middleware/auth");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { SUBSCRIPTION_PLANS } = require("../services/billing");
const { notify } = require("../services/notify");

// Payment gateway configured? (placeholders like "<your_key>" count as NOT configured)
const RAZORPAY_CONFIGURED = !!(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.includes("<") && !process.env.RAZORPAY_KEY_SECRET.includes("<")
);

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// GET /api/subscriptions — current subscription + plans
router.get("/", auth, async (req, res) => {
  try {
    let sub = await Subscription.findOne({ user: req.user.id, status: "active" }).lean();
    if (sub && sub.endDate && new Date(sub.endDate) < new Date()) {
      await Subscription.updateOne({ _id: sub._id }, { $set: { status: "expired" } });
      await User.updateOne({ _id: req.user.id }, { $set: { "subscription.status": "expired" } });
      sub = null;
    }
    res.json({
      subscription: sub,
      plans: SUBSCRIPTION_PLANS,
      paymentGatewayConfigured: RAZORPAY_CONFIGURED,
      paymentRequired: RAZORPAY_CONFIGURED && process.env.NODE_ENV === "production",
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/subscriptions — activate a plan.
// Production + Razorpay configured → verified payment REQUIRED.
// Dev without gateway → direct activation (flagged devActivated in response).
router.post("/", auth, async (req, res) => {
  try {
    const { plan, billingCycle, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};
    if (!plan || !SUBSCRIPTION_PLANS[plan]) return res.status(400).json({ error: "Invalid plan." });

    if (RAZORPAY_CONFIGURED) {
      if (process.env.NODE_ENV === "production") {
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)
          return res.status(400).json({ error: "Payment verification required. Complete the Razorpay payment first.", paymentRequired: true });
        if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature))
          return res.status(400).json({ error: "Payment signature verification failed." });
      } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
        if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature))
          return res.status(400).json({ error: "Payment signature verification failed." });
      }
    } else if (process.env.NODE_ENV === "production") {
      return res.status(400).json({ error: "Payments are not configured on this server. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.", paymentRequired: true });
    }

    const cycle = billingCycle === "yearly" ? "yearly" : "monthly";
    const planData = SUBSCRIPTION_PLANS[plan];
    const amount = planData[cycle];
    const now = new Date();
    const endDate = new Date(now);
    if (cycle === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);

    await Subscription.updateMany({ user: req.user.id, status: "active" }, { $set: { status: "cancelled" } });
    const sub = await Subscription.create({
      user: req.user.id, plan, status: "active", billingCycle: cycle,
      startDate: now, endDate, amount,
      razorpayOrderId, razorpayPaymentId,
      planDetails: { maxListings: planData.maxListings, aiCallsPerMonth: planData.aiCallsPerMonth, label: planData.label },
    });
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        "subscription.plan": plan, "subscription.status": "active",
        "subscription.startDate": now, "subscription.endDate": endDate, "subscription.billingCycle": cycle,
      },
    });
    await notify(req.user.id, "Subscription active", `${planData.label} plan is active until ${endDate.toLocaleDateString("en-IN")}.`, "subscription");
    res.status(201).json({ subscription: sub, message: `${planData.label} plan activated!`, devActivated: !RAZORPAY_CONFIGURED });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
