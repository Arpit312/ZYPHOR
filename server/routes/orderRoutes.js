const router = require("express").Router();
const Order = require("../models/Order");
const Listing = require("../models/Listing");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { calculateBill, generateInvoiceNumber } = require("../services/billing");
const { notify } = require("../services/notify");

// Role-based status transition rules. Nobody can set arbitrary statuses.
const TRANSITIONS = {
  seller: { placed: ["confirmed", "cancelled"], confirmed: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [], disputed: ["cancelled"] },
  buyer:  { placed: ["cancelled"], confirmed: [], shipped: ["delivered"], delivered: ["disputed"], cancelled: [], disputed: [] },
  admin:  { placed: ["confirmed", "cancelled"], confirmed: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [], disputed: ["cancelled"] },
};
const POPULATE = [
  { path: "listing", select: "title brand model price images storage ram conditionGrade status listingType" },
  { path: "buyer", select: "name email phone" },
  { path: "seller", select: "name businessName city phone" },
];

async function createOrderFromListing(listing, buyerId, paymentMethod, deliveryAddress) {
  const bill = calculateBill(listing.price, listing.seller?.gstNumber);
  bill.billNumber = generateInvoiceNumber("ZYP");
  const order = await Order.create({
    buyer: buyerId,
    seller: listing.seller?._id || listing.seller,
    listing: listing._id,
    amount: listing.price,
    bill,
    paymentMethod: paymentMethod || "upi",
    deliveryAddress: deliveryAddress || "India",
    statusHistory: [{ status: "placed", by: buyerId, note: "Order placed, payment held in escrow" }],
  });
  listing.status = "sold";
  await listing.save();
  if (listing.seller?._id) {
    await User.findByIdAndUpdate(listing.seller._id, { $inc: { totalSales: 1, totalEarnings: bill.sellerReceives } });
  }
  const title = listing.title || `${listing.brand} ${listing.model}`;
  await notify(buyerId, "Order placed", `${title} — invoice ${bill.billNumber}. Payment held in escrow.`, "order", JSON.stringify({ screen: "OrderDetail", id: order._id.toString() }));
  await notify(listing.seller?._id || listing.seller, "New order received", `${title} sold to a buyer. Invoice ${bill.billNumber}.`, "order", JSON.stringify({ screen: "OrderDetail", id: order._id.toString() }));
  return order;
}

// GET /api/orders — buyer or seller of each order
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ $or: [{ buyer: req.user.id }, { seller: req.user.id }] })
      .sort({ createdAt: -1 }).populate(POPULATE).lean();
    res.json({ orders });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders/:id — participant only
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id, $or: [{ buyer: req.user.id }, { seller: req.user.id }],
    }).populate(POPULATE).populate("statusHistory.by", "name role").lean();
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json({ order });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders — single listingId OR cart items[]
router.post("/", auth, async (req, res) => {
  try {
    const { listingId, items, paymentMethod, deliveryAddress } = req.body || {};
    const pm = ["upi", "card", "netbanking", "cod", "wallet"].includes(paymentMethod) ? paymentMethod : "upi";
    const addr = String(deliveryAddress || "").trim() || "India";

    // Multi-item (cart) checkout
    if (Array.isArray(items) && items.length > 0) {
      if (items.length > 20) return res.status(400).json({ error: "Too many items in one order." });
      const createdOrders = [];
      const skipped = [];
      for (const it of items) {
        const id = it.listingId || it.id || it._id;
        if (!id) continue;
        const listing = await Listing.findById(id).populate("seller", "gstNumber");
        if (!listing || listing.status !== "active") { skipped.push(id); continue; }
        if (listing.seller && listing.seller._id.toString() === req.user.id) { skipped.push(id); continue; } // no self-buy
        createdOrders.push(await createOrderFromListing(listing, req.user.id, pm, addr));
      }
      if (!createdOrders.length)
        return res.status(400).json({ error: "None of the cart items are available anymore.", skipped });
      return res.status(201).json({ success: true, orders: createdOrders, order: createdOrders[0], bill: createdOrders[0]?.bill, skipped });
    }

    // Single-item checkout
    if (!listingId) return res.status(400).json({ error: "listingId or items required." });
    const listing = await Listing.findById(listingId).populate("seller", "gstNumber");
    if (!listing || listing.status !== "active") return res.status(404).json({ error: "Listing not available." });
    if (listing.seller && listing.seller._id.toString() === req.user.id)
      return res.status(400).json({ error: "Cannot buy your own listing." });

    const order = await createOrderFromListing(listing, req.user.id, pm, addr);
    res.status(201).json({ success: true, order, bill: order.bill });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/orders/:id/status — validated transitions + timeline + side effects
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });
    const isBuyer = order.buyer.toString() === req.user.id;
    const isSeller = order.seller.toString() === req.user.id;
    if (!isBuyer && !isSeller && req.user.role !== "admin")
      return res.status(403).json({ error: "Not a participant of this order." });

    const role = req.user.role === "admin" && !isBuyer && !isSeller ? "admin" : isSeller ? "seller" : "buyer";
    const next = String(req.body?.orderStatus || "");
    const allowed = TRANSITIONS[role][order.orderStatus] || [];
    if (!allowed.includes(next))
      return res.status(400).json({ error: `Cannot move order from '${order.orderStatus}' to '${next}' as ${role}.` });

    order.orderStatus = next;
    order.statusHistory.push({ status: next, by: req.user.id, note: String(req.body?.note || "") });

    if (next === "delivered") {
      order.escrowStatus = "released"; // buyer/seller confirmed receipt → release escrow
      order.deliveredAt = new Date();
    }
    if (next === "cancelled") {
      order.escrowStatus = "refunded";
      order.cancellationReason = String(req.body?.note || "Cancelled");
      // make the listing buyable again
      await Listing.updateOne({ _id: order.listing, status: "sold" }, { $set: { status: "active" } });
    }
    await order.save();

    const title = `Order ${order.bill?.billNumber || order._id.toString().slice(-6)}`;
    await notify(order.buyer.toString() === req.user.id ? order.seller : order.buyer,
      `Order ${next}`, `${title} is now '${next}'.`, "order", JSON.stringify({ screen: "OrderDetail", id: order._id.toString() }));

    const out = await Order.findById(order._id).populate(POPULATE).populate("statusHistory.by", "name role").lean();
    res.json({ order: out });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
