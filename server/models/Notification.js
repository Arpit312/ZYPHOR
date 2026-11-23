const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  body:  { type: String, default: "", trim: true },
  type:  { type: String, enum: ["order", "repair", "listing", "subscription", "support", "system"], default: "system" },
  link:  { type: String, default: "" },   // e.g. { screen: "OrderDetail", id } JSON
  read:  { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
