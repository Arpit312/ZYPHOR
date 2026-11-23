const router = require("express").Router();
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");

// GET /api/notifications — newest first + unread count
router.get("/", auth, async (req, res) => {
  try {
    const [items, unread] = await Promise.all([
      Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100).lean(),
      Notification.countDocuments({ user: req.user.id, read: false }),
    ]);
    res.json({ notifications: items, unread });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, { $set: { read: true } }, { new: true }
    ).lean();
    if (!n) return res.status(404).json({ error: "Notification not found." });
    res.json({ notification: n });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications/read-all
router.post("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/notifications/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const n = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!n) return res.status(404).json({ error: "Notification not found." });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
