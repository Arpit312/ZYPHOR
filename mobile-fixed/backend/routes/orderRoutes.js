const router = require("express").Router();
const Order = require("../models/Order");
const Listing = require("../models/Listing");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { calculateBill, generateInvoiceNumber } = require("../services/billing");

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ $or:[{buyer:req.user.id},{seller:req.user.id}] })
      .sort({createdAt:-1}).populate("listing","title brand model price images").populate("buyer","name email").populate("seller","name businessName").lean();
    res.json({ orders });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const { listingId, paymentMethod, deliveryAddress } = req.body;
    const listing = await Listing.findById(listingId).populate("seller","gstNumber");
    if (!listing || listing.status !== "active") return res.status(404).json({ error: "Listing not available." });
    if (listing.seller._id.toString() === req.user.id) return res.status(400).json({ error: "Cannot buy your own listing." });
    const bill = calculateBill(listing.price, listing.seller?.gstNumber);
    bill.billNumber = generateInvoiceNumber("ZYP");
    const order = await Order.create({ buyer:req.user.id, seller:listing.seller._id, listing:listing._id, amount:listing.price, bill, paymentMethod:paymentMethod||"upi", deliveryAddress });
    listing.status = "sold"; await listing.save();
    await User.findByIdAndUpdate(listing.seller._id, { $inc:{totalSales:1, totalEarnings:bill.sellerReceives} });
    res.status(201).json({ order, bill });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/:id/status", auth, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, $or: [{buyer:req.user.id},{seller:req.user.id}] },
      { orderStatus: req.body.orderStatus }, { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json({ order });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
