// ─── ZYPHOR MOBILE BACKEND - Shared DB with Website ─────────────────────────
// Uses SAME MongoDB + SAME JWT_SECRET as website
// Login token from web = works in app, and vice versa

const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const mongoose = require("mongoose");
const path    = require("path");
require("dotenv").config({ path: "./.env" });

const app = express();
app.set("trust proxy", 1); // so req.ip is correct behind Render/Vercel proxies

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: allow known website origins + non-browser clients (the mobile app sends
// no Origin header). Never combine "*" with credentials:true — browsers reject it.
const ALLOWED_ORIGINS = [
  "http://localhost:3000",            // website dev
  "http://localhost:8081",            // Expo web
  "https://zyphor.vercel.app",        // website prod
  "https://zyphor-wxe3.vercel.app",   // website prod (actual deploy)
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(null, false); // silently disallow unknown origins
  },
  credentials: true,
}));

// Simple in-memory rate limiter on auth endpoints (brute-force protection, no extra dep)
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 30;
const rateBuckets = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of rateBuckets) {
    if (now - b.start > RATE_WINDOW_MS) rateBuckets.delete(k);
  }
}, RATE_WINDOW_MS).unref();
app.use("/api/auth", (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > RATE_MAX) {
    return res.status(429).json({ error: "Too many attempts. Please try again after 15 minutes." });
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Serve locally-uploaded files (fallback when Cloudinary is not configured)
// so mobile clients can load them via absolute URLs.
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// ─── Database (SAME as website) ─────────────────────────────────────────────
const DB_URI = process.env.MONGODB_URI ||
  "mongodb://zyphorapp_db_user:Arpit%40123@ac-3grfudt-shard-00-00.oqakvy3.mongodb.net:27017,ac-3grfudt-shard-00-01.oqakvy3.mongodb.net:27017,ac-3grfudt-shard-00-02.oqakvy3.mongodb.net:27017/zyphor?ssl=true&replicaSet=atlas-xczv29-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(DB_URI, { bufferCommands: false })
  .then(() => console.log("✅ MongoDB connected (shared DB with website)"))
  .catch(err => console.error("❌ MongoDB:", err.message));

// ─── Root & Health ──────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({
  message: "ZYPHOR Live API is 100% operational!",
  timestamp: new Date().toISOString(),
  db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
}));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/listings",     require("./routes/listingRoutes"));
app.use("/api/orders",       require("./routes/orderRoutes"));
app.use("/api/subscriptions",require("./routes/subscriptionRoutes"));
app.use("/api/admin",        require("./routes/adminRoutes"));
app.use("/api/ai",           require("./routes/aiRoutes"));
app.use("/api/imei",         require("./routes/imeiRoutes"));
app.use("/api/uploads",      require("./routes/uploadRoutes"));
app.use("/api/repair",       require("./routes/repairRoutes"));
app.use("/api/wishlist",     require("./routes/wishlistRoutes"));
app.use("/api/notifications",require("./routes/notificationRoutes"));
app.use("/api/support",      require("./routes/supportRoutes"));

// ─── Health ──────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({
  status: "OK",
  platform: "ZYPHOR Mobile API",
  db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  version: "2.0.0",
}));

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 ZYPHOR Mobile API running on port ${PORT}`);
  console.log(`🌐 Database: shared with website (MONGODB_URI ${process.env.MONGODB_URI ? "configured" : "MISSING"})`);
  console.log(`📱 Clients can login on web or app with SAME credentials\n`);
});
