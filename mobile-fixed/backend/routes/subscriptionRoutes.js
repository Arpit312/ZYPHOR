const router = require("express").Router();
const auth = require("../middleware/auth");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { SUBSCRIPTION_PLANS } = require("../services/billing");

router.get("/", auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user.id, status: "active" }).lean();
    res.json({ subscription: sub, plans: SUBSCRIPTION_PLANS });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const { plan, billingCycle, razorpayPaymentId } = req.body;
    if (!plan || !SUBSCRIPTION_PLANS[plan]) return res.status(400).json({ error: "Invalid plan." });
    const cycle = billingCycle === "yearly" ? "yearly" : "monthly";
    const planData = SUBSCRIPTION_PLANS[plan];
    const amount = planData[cycle];
    const now = new Date();
    const endDate = new Date(now);
    if (cycle==="yearly") endDate.setFullYear(endDate.getFullYear()+1); else endDate.setMonth(endDate.getMonth()+1);
    await Subscription.updateMany({ user: req.user.id, status: "active" }, { status: "cancelled" });
    const sub = await Subscription.create({ user: req.user.id, plan, status: "active", billingCycle: cycle, startDate: now, endDate, amount, razorpayPaymentId, planDetails: planData });
    await User.findByIdAndUpdate(req.user.id, { "subscription.plan": plan, "subscription.status": "active", "subscription.startDate": now, "subscription.endDate": endDate });
    res.status(201).json({ subscription: sub, message: `${planData.label} plan activated!` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
