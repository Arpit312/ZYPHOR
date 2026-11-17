const router = require("express").Router();
const RepairTicket = require("../models/RepairTicket");
const auth = require("../middleware/auth");

// Create repair booking (doorstep)
router.post("/", auth.optional, async (req, res) => {
  try {
    const { brand, model, issue, preferredDate, pincode, address, contactPhone, estimatedPrice } = req.body;
    
    if (!brand || !model || !issue || !pincode) {
      return res.status(400).json({ error: "Brand, model, issue and pincode are required." });
    }

    const ticket = await RepairTicket.create({
      user: req.user?.id || null,
      brand,
      model,
      issue,
      preferredDate: preferredDate ? new Date(preferredDate) : new Date(Date.now() + 86400000),
      pincode,
      address: address || "",
      contactPhone: contactPhone || "",
      estimatedPrice: Number(estimatedPrice || 999),
      status: "pending"
    });

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's repair tickets
router.get("/", auth, async (req, res) => {
  try {
    const tickets = await RepairTicket.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
