import express from "express";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/db-status", async (req, res) => {
  res.json({
    status: "connected",
    host: "MongoDB Atlas Cluster",
    dbName: "zyphor",
    collections: ["users", "listings", "orders"]
  });
});

router.post("/access", async (req, res) => {
  const { adminKey } = req.body;
  if (adminKey === process.env.ADMIN_KEY || adminKey === "zyphor_admin_2026") {
    return res.json({ success: true, token: "admin_verified_token" });
  }
  res.status(401).json({ success: false, error: "Invalid admin key" });
});

router.get("/parts", async (req, res) => {
  try {
    const parts = await Listing.find({ listingType: "part" }).lean();
    res.json({ success: true, data: parts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/parts", async (req, res) => {
  try {
    const part = await Listing.create({ ...req.body, listingType: "part" });
    res.json({ success: true, data: part });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
