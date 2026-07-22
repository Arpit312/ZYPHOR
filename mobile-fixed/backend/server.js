// ─── ZYPHOR MOBILE BACKEND - Shared DB with Website ─────────────────────────
// Uses SAME MongoDB + SAME JWT_SECRET as website
// Login token from web = works in app, and vice versa

const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    "http://localhost:3000",          // website dev
    "http://localhost:8081",          // Expo web
    "https://zyphor.vercel.app",      // website prod
    "*",                              // mobile app (no origin)
  ],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// ─── Database (SAME as website) ─────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false })
  .then(() => console.log("✅ MongoDB connected (shared DB with website)"))
  .catch(err => console.error("❌ MongoDB:", err));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/listings",     require("./routes/listingRoutes"));
app.use("/api/orders",       require("./routes/orderRoutes"));
app.use("/api/subscriptions",require("./routes/subscriptionRoutes"));
app.use("/api/admin",        require("./routes/adminRoutes"));
app.use("/api/ai",           require("./routes/aiRoutes"));
app.use("/api/imei",         require("./routes/imeiRoutes"));
app.use("/api/uploads",      require("./routes/uploadRoutes"));

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
  console.log(`🌐 Database: Shared with website (${process.env.MONGODB_URI?.split("@")[1] || "local"})`);
  console.log(`📱 Clients can login on web or app with SAME credentials\n`);
});
