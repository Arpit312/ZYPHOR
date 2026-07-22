import express from "express";
import Listing from "../models/Listing.js";

const router = express.Router();

router.get("/menu", async (req, res) => {
  try {
    const cats = await Listing.aggregate([
      { $match: { status: "active", listingType: "device" } },
      { $group: { _id: "$brand", count: { $sum: 1 } } }
    ]);
    
    // For now, hardcode the main category "smartphones"
    res.json({
      menu: [
        {
          name: "Smartphones",
          slug: "smartphones",
          count: cats.reduce((acc, c) => acc + c.count, 0),
          brands: cats.map(c => ({ name: c._id, slug: c._id.toLowerCase(), count: c.count }))
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q = "", limit = 5 } = req.query;
    if (!q) return res.json({ results: [] });
    const results = await Listing.find({
      status: "active",
      $or: [
        { brand: { $regex: q, $options: "i" } },
        { model: { $regex: q, $options: "i" } },
        { title: { $regex: q, $options: "i" } }
      ]
    }).limit(Number(limit)).lean();
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all listings (store)
router.get("/listings", async (req, res) => {
  try {
    const { brand, condition, sort, q } = req.query;
    const query = { status: "active", listingType: "device" };
    if (brand && brand !== "All") query.brand = brand;
    if (condition && condition !== "All") query.conditionGrade = condition;
    if (q) {
      query.$or = [
        { brand: { $regex: q, $options: "i" } },
        { model: { $regex: q, $options: "i" } },
        { title: { $regex: q, $options: "i" } }
      ];
    }
    let sortOpt = { createdAt: -1 };
    if (sort === "price_low") sortOpt = { price: 1 };
    if (sort === "price_high") sortOpt = { price: -1 };
    if (sort === "trust") sortOpt = { "verification.trustScore": -1 };
    
    const listings = await Listing.find(query).sort(sortOpt).lean();
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single listing
router.get("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
