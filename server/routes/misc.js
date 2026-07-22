import express from "express";

const router = express.Router();

// Subscriptions
router.get("/subscriptions", (req, res) => {
  res.json({ success: true, activePlan: "Pro Dealer", validUntil: "2026-12-31" });
});

router.post("/subscriptions", (req, res) => {
  res.json({ success: true, message: "Subscription upgraded successfully!" });
});

// Messages
router.get("/messages", (req, res) => {
  res.json({ success: true, data: [] });
});

router.post("/messages", (req, res) => {
  res.json({ success: true, message: "Message sent" });
});

// Repair
router.post("/repair", (req, res) => {
  res.json({ success: true, bookingId: "REP-" + Math.floor(1000 + Math.random() * 9000), status: "Booked" });
});

// Uploads
router.post("/uploads", (req, res) => {
  res.json({ success: true, url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" });
});

export default router;
