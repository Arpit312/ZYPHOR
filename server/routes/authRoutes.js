const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const LoginSession = require("../models/LoginSession");
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_jwt_key_123_zyphor";

const ROLES = ["customer", "retailer", "wholesaler", "technician", "admin"];
const ROLES_NEEDING_SUB = ["retailer", "wholesaler", "technician"];

const sign = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role, name: user.name, email: user.email },
  JWT_SECRET, { expiresIn: "7d" }
);

// Public shape of the user (same fields for login / signup / me / profile)
const publicUser = (u) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
  role: u.role,
  city: u.city,
  phone: u.phone,
  businessName: u.businessName,
  gstNumber: u.gstNumber,
  verifiedSeller: u.verifiedSeller,
  trustRating: u.trustRating,
  isActive: u.isActive,
  profileImage: u.profileImage,
  addresses: u.addresses || [],
  subscription: u.subscription,
  needsSubscription: ROLES_NEEDING_SUB.includes(u.role) && u.subscription?.status !== "active",
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required." });
    // If role is provided, find user with that specific role; otherwise find any user with that email
    const query = { email: email.toLowerCase() };
    if (role && ROLES.includes(role)) query.role = role;
    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ error: "Invalid credentials." });
    if (!user.isActive) return res.status(403).json({ error: "Account deactivated." });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });
    const token = sign(user);

    // Track mobile login session in MongoDB Atlas
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    LoginSession.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      ipAddress: clientIp,
      device: "Zyphor Mobile App (Expo/RN)",
      userAgent: req.headers["user-agent"] || "Zyphor App Client",
      location: "India (Mobile)",
      status: "ACTIVE",
      loginAt: new Date(),
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).catch(e => console.warn("[Mobile LoginSession Warn]:", e.message));

    res.json({ token, user: publicUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, city, phone, businessName, gstNumber } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email, password required." });
    if (password.length < 8) return res.status(400).json({ error: "Password must be 8+ characters." });
    const safeRole = ["customer", "retailer", "wholesaler", "technician"].includes(role) ? role : "customer";
    const existing = await User.findOne({ email: email.toLowerCase(), role: safeRole });
    if (existing) return res.status(409).json({ error: "Email already registered for this role." });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash, role: safeRole, city, phone, businessName, gstNumber,
      subscription: { plan: "free", status: "inactive" },
    });
    const token = sign(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// In-memory OTP store (phone -> { otp, expiresAt })
const otpStore = new Map();

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body || {};
    const cleaned = String(phone || "").replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }
    const otp = "123456";
    otpStore.set(cleaned, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    console.log(`[AUTH OTP] Sent code ${otp} to +91 ${cleaned}`);
    res.json({
      success: true,
      message: `Verification code sent to +91 ${cleaned}`,
      demoCode: "123456",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp, role } = req.body || {};
    const cleaned = String(phone || "").replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      return res.status(400).json({ error: "Invalid mobile number." });
    }
    if (!otp) {
      return res.status(400).json({ error: "Please enter the verification code." });
    }

    const stored = otpStore.get(cleaned);
    const isValid = String(otp).trim() === "123456" || (stored && stored.otp === String(otp).trim() && Date.now() < stored.expiresAt);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid verification code. Please use 123456." });
    }

    const safeRole = ["customer", "retailer", "wholesaler", "technician"].includes(role) ? role : "customer";
    let user = await User.findOne({ phone: cleaned });
    if (!user) {
      const randomPwd = await bcrypt.hash(`zyphor_${cleaned}_secret`, 10);
      user = await User.create({
        name: `Member ${cleaned.slice(-4)}`,
        email: `${cleaned}@zyphor.store`,
        phone: cleaned,
        passwordHash: randomPwd,
        role: safeRole,
        isActive: true,
        verifiedSeller: false,
        trustRating: 5.0,
        subscription: { plan: "free", status: "inactive" },
      });
    }

    const token = sign(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — normalize _id → id so the app always reads user.id
router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const u = await User.findById(req.user.id).select("-passwordHash").lean();
    if (!u) return res.status(404).json({ error: "User not found." });
    const { _id, ...rest } = u;
    res.json({ user: { id: _id.toString(), ...rest } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/auth/profile — whitelist: only provided, allowed fields are written ($set, never strips other fields)
const PROFILE_FIELDS = ["name", "city", "phone", "businessName", "gstNumber", "profileImage"];
router.patch("/profile", require("../middleware/auth"), async (req, res) => {
  try {
    const update = {};
    for (const k of PROFILE_FIELDS) if (req.body[k] !== undefined) update[k] = req.body[k];
    if (Object.keys(update).length === 0) return res.status(400).json({ error: "No valid fields to update." });
    const u = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true, runValidators: true })
      .select("-passwordHash").lean();
    const { _id, ...rest } = u;
    res.json({ user: { id: _id.toString(), ...rest } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- Saved addresses (mobile convenience; stored on the user document) ----
// GET /api/auth/addresses
router.get("/addresses", require("../middleware/auth"), async (req, res) => {
  try {
    const u = await User.findById(req.user.id).select("addresses").lean();
    res.json({ addresses: u?.addresses || [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/addresses — add (first address becomes default)
router.post("/addresses", require("../middleware/auth"), async (req, res) => {
  try {
    const { label, name, phone, street, city, state, pincode, isDefault } = req.body || {};
    if (!name || !phone || !street || !city || !pincode)
      return res.status(400).json({ error: "name, phone, street, city and pincode are required." });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    user.addresses.push({ label: label || "Home", name, phone, street, city, state: state || "", pincode, isDefault: !!isDefault || user.addresses.length === 0 });
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/auth/addresses/:addrId
router.patch("/addresses/:addrId", require("../middleware/auth"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ error: "Address not found." });
    const FIELDS = ["label", "name", "phone", "street", "city", "state", "pincode", "isDefault"];
    for (const k of FIELDS) if (req.body[k] !== undefined) addr[k] = req.body[k];
    if (addr.isDefault) user.addresses.forEach((a) => { if (a._id.toString() !== addr._id.toString()) a.isDefault = false; });
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/auth/addresses/:addrId
router.delete("/addresses/:addrId", require("../middleware/auth"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addrId);
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/forgot-password
// Website-parity fields: resetOtp (Number) + resetOtpExpiry, so a code requested on the
// website works in the app and vice versa. Role is optional and scopes the lookup.
// NOTE: Actual email/SMS delivery is NOT wired up yet — see MANUAL_WORK notes.
// In development the code is echoed back (devCode) so you can test end-to-end without
// an email provider. In production, remove devCode and wire a real provider.
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    const query = { email: email.toLowerCase() };
    if (role && ROLES.includes(role)) query.role = role;
    const user = await User.findOne(query);

    // Always respond with a generic message (don't reveal whether email exists)
    const genericMsg = "If this email is registered, a reset code has been sent.";
    if (!user) return res.json({ message: genericMsg });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit Number (website parity)
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    // clear legacy fields if present
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // TODO(manual work): send `otp` via real email/SMS provider here.
    console.log(`[ZYPHOR] Password reset OTP generated (email: ${user.email}, role: ${user.role})`);

    // Auto-deliver via Resend API if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: [user.email],
            subject: "ZYPHOR - Password Reset Code",
            html: `<h3>ZYPHOR Security</h3><p>Your password reset code is: <strong style="font-size:18px;letter-spacing:2px;">${otp}</strong></p><p>Valid for 15 minutes.</p>`,
          }),
        });
      } catch (emailErr) {
        console.error("[ZYPHOR] Email send error:", emailErr?.message);
      }
    }

    const payload = { message: genericMsg };
    if (process.env.NODE_ENV !== "production") payload.devCode = String(otp); // dev/testing convenience only
    res.json(payload);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/reset-password — verifies resetOtp (Number) + resetOtpExpiry
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword, role } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: "Email, code and new password required." });
    if (newPassword.length < 8) return res.status(400).json({ error: "Password must be 8+ characters." });

    const query = { email: email.toLowerCase() };
    if (role && ROLES.includes(role)) query.role = role;
    const user = await User.findOne(query);
    if (!user || !user.resetOtp || !user.resetOtpExpiry)
      return res.status(400).json({ error: "Invalid or expired code. Please request a new one." });
    if (user.resetOtpExpiry < new Date())
      return res.status(400).json({ error: "Code expired. Please request a new one." });
    if (Number(user.resetOtp) !== Number(code))
      return res.status(400).json({ error: "Incorrect code." });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
