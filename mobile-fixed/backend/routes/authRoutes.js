const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "zyphor_dev_secret_change_me_in_production";

const sign = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role, name: user.name, email: user.email },
  JWT_SECRET, { expiresIn: "7d" }
);

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required." });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });
    if (!user.isActive) return res.status(403).json({ error: "Account deactivated." });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });
    const token = sign(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, subscription: user.subscription, profileImage: user.profileImage } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, city, phone, businessName, gstNumber } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email, password required." });
    if (password.length < 8) return res.status(400).json({ error: "Password must be 8+ characters." });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered." });
    const safeRole = ["customer","retailer","wholesaler","technician"].includes(role) ? role : "customer";
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: safeRole, city, phone, businessName, gstNumber, subscription: { plan:"free", status:"inactive" } });
    const token = sign(user);
    const needsSub = ["retailer","wholesaler","technician"].includes(safeRole);
    res.status(201).json({ token, user: { id: user._id, name, email: user.email, role: safeRole }, needsSubscription: needsSub });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash").lean();
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/auth/profile
router.patch("/profile", require("../middleware/auth"), async (req, res) => {
  try {
    const { name, city, phone, businessName, gstNumber } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, city, phone, businessName, gstNumber }, { new: true }).select("-passwordHash").lean();
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/forgot-password
// NOTE: Actual email/SMS delivery is NOT wired up yet — see MANUAL_WORK notes.
// This generates and stores a real 6-digit code with 15-min expiry in the DB.
// In development it's echoed back in the response so you can test end-to-end
// without an email provider. In production, remove the devCode field and wire
// a real provider (e.g. Resend, SendGrid, Twilio) to actually deliver the code.
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with a generic message (don't reveal whether email exists)
    const genericMsg = "If this email is registered, a reset code has been sent.";
    if (!user) return res.json({ message: genericMsg });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    // TODO(manual work): send `code` via real email/SMS provider here.
    console.log(`[ZYPHOR] Password reset code for ${user.email}: ${code}`);

    const payload = { message: genericMsg };
    if (process.env.NODE_ENV !== "production") payload.devCode = code; // dev/testing convenience only
    res.json(payload);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: "Email, code and new password required." });
    if (newPassword.length < 8) return res.status(400).json({ error: "Password must be 8+ characters." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires)
      return res.status(400).json({ error: "Invalid or expired code. Please request a new one." });
    if (user.resetPasswordExpires < new Date())
      return res.status(400).json({ error: "Code expired. Please request a new one." });
    if (user.resetPasswordCode !== String(code))
      return res.status(400).json({ error: "Incorrect code." });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
