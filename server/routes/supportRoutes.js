const router = require("express").Router();
const auth = require("../middleware/auth");
const SupportTicket = require("../models/SupportTicket");
const { notify } = require("../services/notify");

// GET /api/support — own tickets (admins see all)
router.get("/", auth, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user.id };
    const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 })
      .populate("user", "name email role").populate("replies.from", "name role").lean();
    res.json({ success: true, tickets });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/support — open a ticket
router.post("/", auth, async (req, res) => {
  try {
    const { subject, message } = req.body || {};
    if (!subject?.trim() || !message?.trim())
      return res.status(400).json({ error: "Subject and message are required." });
    const t = await SupportTicket.create({
      user: req.user.id,
      subject: String(subject).trim().slice(0, 120),
      message: String(message).trim().slice(0, 2000),
      status: "open",
      replies: [{ from: req.user.id, message: String(message).trim().slice(0, 2000), staff: false }],
    });
    res.status(201).json({ success: true, ticket: t });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/support/:id/reply — user adds a message to their own ticket
router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message?.trim()) return res.status(400).json({ error: "Message required." });
    const t = await SupportTicket.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Ticket not found." });
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && t.user.toString() !== req.user.id)
      return res.status(403).json({ error: "Not your ticket." });
    t.replies.push({ from: req.user.id, message: String(message).trim().slice(0, 2000), staff: isAdmin });
    t.status = isAdmin ? "answered" : "open";
    await t.save();
    if (!isAdmin) await notify(req.user.id, "Support reply", `New staff reply on "${t.subject}".`, "support", JSON.stringify({ screen: "Support" }));
    res.json({ success: true, ticket: t });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
