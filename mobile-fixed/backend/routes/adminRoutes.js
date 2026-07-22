const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Order = require("../models/Order");
const Subscription = require("../models/Subscription");

const adminOnly = [auth, (req,res,next) => { if(req.user?.role!=="admin") return res.status(403).json({error:"Forbidden"}); next(); }];

router.get("/stats", adminOnly, async (req, res) => {
  try {
    const [totalUsers, activeListings, totalOrders, activeSubs] = await Promise.all([
      User.countDocuments(), Listing.countDocuments({status:"active"}), Order.countDocuments(), Subscription.countDocuments({status:"active"})
    ]);
    const orders = await Order.find({orderStatus:"delivered"}).lean();
    const platformRevenue = orders.reduce((s,o) => s+(o.bill?.platformFee||0),0);
    const gstCollected = orders.reduce((s,o) => s+(o.bill?.gstOnFee||0),0);
    res.json({ totalUsers, activeListings, totalOrders, activeSubs, platformRevenue, gstCollected });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/users", adminOnly, async (req, res) => {
  try {
    const { role, q, page=1 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) filter.$or = [{ name: new RegExp(q,"i") }, { email: new RegExp(q,"i") }];
    const users = await User.find(filter).sort({createdAt:-1}).skip((page-1)*20).limit(20).select("-passwordHash").lean();
    const total = await User.countDocuments(filter);
    res.json({ users, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/users/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true}).select("-passwordHash").lean();
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
