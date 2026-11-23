const router = require("express").Router();
const auth = require("../middleware/auth");
const Wishlist = require("../models/Wishlist");
const Listing = require("../models/Listing");

const listFor = async (userId) => {
  const items = await Wishlist.find({ user: userId }).sort({ createdAt: -1 }).populate("listing").lean();
  return items.filter((i) => i.listing).map((i) => i.listing);
};

// GET /api/wishlist
router.get("/", auth, async (req, res) => {
  try {
    res.json({ wishlist: await listFor(req.user.id) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/wishlist/ids — quick "is wishlisted" check
router.get("/ids", auth, async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user.id }).select("listing").lean();
    res.json({ ids: items.map((i) => i.listing.toString()) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/wishlist { listingId }
router.post("/", auth, async (req, res) => {
  try {
    const { listingId } = req.body || {};
    if (!listingId) return res.status(400).json({ error: "listingId required." });
    const l = await Listing.findById(listingId);
    if (!l) return res.status(404).json({ error: "Listing not found." });
    try {
      await Wishlist.create({ user: req.user.id, listing: listingId });
    } catch (e) {
      if (e.code !== 11000) throw e; // duplicate = already wishlisted, fine
    }
    res.status(201).json({ wishlist: await listFor(req.user.id), added: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/wishlist/:listingId
router.delete("/:listingId", auth, async (req, res) => {
  try {
    await Wishlist.deleteOne({ user: req.user.id, listing: req.params.listingId });
    res.json({ wishlist: await listFor(req.user.id), removed: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
