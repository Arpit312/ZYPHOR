const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Order = require("../models/Order");
const Subscription = require("../models/Subscription");

const adminOnly = [auth, (req, res, next) => { if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" }); next(); }];

// Escape user input before using it inside a RegExp (prevents ReDoS / crashes)
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ROLES = ["customer", "retailer", "wholesaler", "technician", "admin"];

router.get("/stats", adminOnly, async (req, res) => {
  try {
    const [totalUsers, activeListings, totalOrders, activeSubs] = await Promise.all([
      User.countDocuments(), Listing.countDocuments({ status: "active" }), Order.countDocuments(), Subscription.countDocuments({ status: "active" })
    ]);
    const orders = await Order.find({ orderStatus: "delivered" }).lean();
    const platformRevenue = orders.reduce((s, o) => s + (o.bill?.platformFee || 0), 0);
    const gstCollected = orders.reduce((s, o) => s + (o.bill?.gstOnFee || 0), 0);
    res.json({ totalUsers, activeListings, totalOrders, activeSubs, platformRevenue, gstCollected });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/users", adminOnly, async (req, res) => {
  try {
    const { role, q, page = 1 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      const rx = new RegExp(esc(q), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * 20).limit(20).select("-passwordHash").lean();
    const total = await User.countDocuments(filter);
    res.json({ users, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/users/:id — whitelist only (mass-assignment protection), $set so other fields are never stripped
const ADMIN_FIELDS = ["name", "phone", "city", "businessName", "businessAddress", "gstNumber", "isActive", "verifiedSeller", "trustRating", "isAccessGranted", "profileImage"];
router.patch("/users/:id", adminOnly, async (req, res) => {
  try {
    const update = {};
    for (const k of ADMIN_FIELDS) if (req.body[k] !== undefined) update[k] = req.body[k];
    if (req.body.role !== undefined) {
      if (!ROLES.includes(req.body.role)) return res.status(400).json({ error: "Invalid role." });
      update.role = req.body.role;
    }
    if (req.body.subscriptionStatus !== undefined) update["subscription.status"] = req.body.subscriptionStatus;
    if (req.body.subscriptionPlan !== undefined) update["subscription.plan"] = req.body.subscriptionPlan;
    if (Object.keys(update).length === 0) return res.status(400).json({ error: "No valid fields to update." });
    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true }).select("-passwordHash").lean();
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
