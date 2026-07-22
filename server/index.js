import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();
try { dotenv.config({ path: "../website/.env.local" }); } catch (e) {}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB().then(() => console.log("MongoDB Connected in Express Server")).catch(err => console.error(err));

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "ZYPHOR API Server is 100% operational!", timestamp: new Date() });
});

// Import Routers
import catalogRoutes from "./routes/catalog.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import ordersRoutes from "./routes/orders.js";
import miscRoutes from "./routes/misc.js";

// Mount Routers
app.use("/api/catalog", catalogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api", miscRoutes);

// Catch-all Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
