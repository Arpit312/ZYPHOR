const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
}, { timestamps: true });

// One wishlist entry per user+listing
WishlistSchema.index({ user: 1, listing: 1 }, { unique: true });
WishlistSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
