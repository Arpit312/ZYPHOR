const router = require("express").Router();
const Order = require("../models/Order");
const Listing = require("../models/Listing");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { calculateBill, generateInvoiceNumber } = require("../services/billing");

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ $or:[{buyer:req.user.id},{seller:req.user.id}] })
      .sort({createdAt:-1})
      .populate("listing","title brand model price images storage ram conditionGrade")
      .populate("buyer","name email phone")
      .populate("seller","name businessName city phone")
      .lean();
    res.json({ orders });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const { listingId, items, paymentMethod, deliveryAddress } = req.body;

    // Support multiple cart checkout
    if (Array.isArray(items) && items.length > 0) {
      const createdOrders = [];
      for (const it of items) {
        const id = it.listingId || it.id || it._id;
        const listing = await Listing.findById(id).populate("seller","gstNumber");
        if (listing && listing.status === "active") {
          const bill = calculateBill(listing.price, listing.seller?.gstNumber);
          bill.billNumber = generateInvoiceNumber("ZYP");
          const order = await Order.create({
            buyer: req.user.id,
            seller: listing.seller?._id || req.user.id,
            listing: listing._id,
            amount: listing.price,
            bill,
            paymentMethod: paymentMethod || "upi",
            deliveryAddress: deliveryAddress || "India"
          });
          listing.status = "sold";
          await listing.save();
          if (listing.seller?._id) {
            await User.findByIdAndUpdate(listing.seller._id, { $inc:{totalSales:1, totalEarnings:bill.sellerReceives} });
          }
          createdOrders.push(order);
        }
      }
      return res.status(201).json({ success: true, orders: createdOrders, order: createdOrders[0], bill: createdOrders[0]?.bill });
    }

    // Single item checkout
    const listing = await Listing.findById(listingId).populate("seller","gstNumber");
    if (!listing || listing.status !== "active") return res.status(404).json({ error: "Listing not available." });
    if (listing.seller && listing.seller._id.toString() === req.user.id) return res.status(400).json({ error: "Cannot buy your own listing." });

    const bill = calculateBill(listing.price, listing.seller?.gstNumber);
    bill.billNumber = generateInvoiceNumber("ZYP");

    const order = await Order.create({
      buyer: req.user.id,
      seller: listing.seller?._id || req.user.id,
      listing: listing._id,
      amount: listing.price,
      bill,
      paymentMethod: paymentMethod || "upi",
      deliveryAddress: deliveryAddress || "India"
    });

    listing.status = "sold";
    await listing.save();
    if (listing.seller?._id) {
      await User.findByIdAndUpdate(listing.seller._id, { $inc:{totalSales:1, totalEarnings:bill.sellerReceives} });
    }

    res.status(201).json({ success: true, order, bill });
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
