const router = require("express").Router();
const RepairTicket = require("../models/RepairTicket");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { notify } = require("../services/notify");

// Technician/admin status flow
const TECH_TRANSITIONS = { pending: ["assigned", "cancelled"], assigned: ["in_repair", "cancelled"], in_repair: ["completed", "cancelled"], completed: [], cancelled: [] };

// POST /api/repair — book doorstep repair (login optional, but linked when present)
router.post("/", auth.optional, async (req, res) => {
  try {
    const { brand, model, issue, preferredDate, pincode, address, contactPhone, estimatedPrice } = req.body || {};
    if (!brand || !model || !issue || !pincode)
      return res.status(400).json({ error: "Brand, model, issue and pincode are required." });

    const ticket = await RepairTicket.create({
      user: req.user?.id || null,
      brand: String(brand).trim(),
      model: String(model).trim(),
      issue: String(issue).trim().slice(0, 1000),
      preferredDate: preferredDate ? new Date(preferredDate) : new Date(Date.now() + 86400000),
      pincode: String(pincode).trim(),
      address: String(address || "").trim(),
      contactPhone: String(contactPhone || "").trim(),
      estimatedPrice: Number(estimatedPrice || 999),
      status: "pending",
      statusHistory: [{ status: "pending", note: "Booking received" }],
    });

    if (req.user?.id)
      await notify(req.user.id, "Repair booked", `Ticket ${ticket.ticketNumber} for ${brand} ${model} — a technician will be assigned soon.`, "repair", JSON.stringify({ screen: "RepairTickets" }));

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    if (err?.name === "ValidationError") return res.status(400).json({ error: Object.values(err.errors)[0]?.message });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/repair — own tickets (technicians/admins see all)
router.get("/", auth, async (req, res) => {
  try {
    const filter = (req.user.role === "technician" || req.user.role === "admin") ? {} : { user: req.user.id };
    const tickets = await RepairTicket.find(filter).sort({ createdAt: -1 })
      .populate("user", "name phone email").populate("assignedTechnician", "name phone").lean();
    res.json({ success: true, tickets });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/repair/:id — owner or staff
router.get("/:id", auth, async (req, res) => {
  try {
    const t = await RepairTicket.findById(req.params.id)
      .populate("user", "name phone email").populate("assignedTechnician", "name phone").lean();
    if (!t) return res.status(404).json({ error: "Ticket not found." });
    const staff = req.user.role === "technician" || req.user.role === "admin";
    if (!staff && t.user && t.user._id.toString() !== req.user.id)
      return res.status(403).json({ error: "Not your ticket." });
    res.json({ success: true, ticket: t });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/repair/:id/status — staff transition, or owner cancels a pending ticket
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const t = await RepairTicket.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Ticket not found." });
    const staff = req.user.role === "technician" || req.user.role === "admin";
    const isOwner = t.user && t.user.toString() === req.user.id;
    const next = String(req.body?.orderStatus || req.body?.status || "");

    if (staff) {
      const allowed = TECH_TRANSITIONS[t.status] || [];
      if (!allowed.includes(next)) return res.status(400).json({ error: `Cannot move '${t.status}' to '${next}'.` });
      if (next === "assigned" && !t.assignedTechnician) t.assignedTechnician = req.user.id;
    } else if (isOwner && next === "cancelled" && t.status === "pending") {
      // owner may cancel only while still pending
    } else {
      return res.status(403).json({ error: "Not allowed to update this ticket." });
    }

    t.status = next;
    t.statusHistory = t.statusHistory || [];
    t.statusHistory.push({ status: next, by: req.user.id, note: String(req.body?.note || "") });
    await t.save();

    if (t.user)
      await notify(t.user, `Repair ${next}`, `Ticket ${t.ticketNumber} is now '${next}'.`, "repair", JSON.stringify({ screen: "RepairTickets" }));

    res.json({ success: true, ticket: t });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
