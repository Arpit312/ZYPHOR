import mongoose from "mongoose";
import "./User.js";
import "./Listing.js";

const CartItemSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const CartSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [CartItemSchema]
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
