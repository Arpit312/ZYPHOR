const router = require("express").Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/", auth.optional, async (req, res) => {
  try {
    const { type, q, brand, city, minPrice, maxPrice, sort="newest", limit=24, seller, tag } = req.query;
    const filter = { status: "active" };
    if (type) filter.listingType = type;
    if (brand) filter.brand = new RegExp(`^${brand}$`,"i");
    if (city) filter.city = new RegExp(`^${city}$`,"i");
    if (seller) filter.seller = seller;
    if (tag) filter.tags = tag; // matches listings whose tags array contains this value (e.g. part category)
    if (minPrice||maxPrice) { filter.price={}; if(minPrice) filter.price.$gte=Number(minPrice); if(maxPrice) filter.price.$lte=Number(maxPrice); }
    if (q) filter.$or = [{ brand:new RegExp(q,"i") },{ model:new RegExp(q,"i") },{ title:new RegExp(q,"i") }];
    const sortMap = { newest:{createdAt:-1}, price_low:{price:1}, price_high:{price:-1}, trust:{"verification.trustScore":-1} };
    const listings = await Listing.find(filter).sort(sortMap[sort]||sortMap.newest).limit(Math.min(Number(limit),60)).populate("seller","name businessName city verifiedSeller").lean();
    res.json({ listings, count: listings.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const l = await Listing.findById(req.params.id).populate("seller","name businessName city verifiedSeller phone").lean();
    if (!l) return res.status(404).json({ error: "Listing not found." });
    res.json({ listing: l });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const needsSub = ["retailer","wholesaler","technician"].includes(user?.role);
    if (needsSub && user?.subscription?.status !== "active")
      return res.status(403).json({ error: "Subscription required to list.", needsSubscription: true });
    const b = req.body;
    const listing = await Listing.create({ seller: req.user.id, ...b, price: Number(b.price) });
    res.status(201).json({ listing });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const l = await Listing.findOne({ _id: req.params.id, seller: req.user.id });
    if (!l) return res.status(404).json({ error: "Listing not found or unauthorized." });
    Object.assign(l, req.body);
    await l.save();
    res.json({ listing: l });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const l = await Listing.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
    if (!l) return res.status(404).json({ error: "Listing not found." });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
