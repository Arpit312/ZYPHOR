import mongoose from "mongoose";

const StoreLocationSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  city:        { type: String, required: true },
  pincode:     { type: String, required: true },
  address:     { type: String, required: true },
  phone:       { type: String },
  timing:      { type: String, default: "10:00 AM - 9:00 PM" },
  storeType:   { type: String, enum: ["official_store", "partner_kiosk", "tech_hub"], default: "official_store" },
  rating:      { type: Number, default: 4.8 },
  latitude:    { type: Number },
  longitude:   { type: Number },
  isOperational:{ type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.StoreLocation || mongoose.model("StoreLocation", StoreLocationSchema);
