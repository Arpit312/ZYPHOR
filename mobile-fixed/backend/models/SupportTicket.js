const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  from:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true, trim: true },
  staff:   { type: Boolean, default: false },
}, { timestamps: true });

const SupportTicketSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject:  { type: String, required: true, trim: true, maxlength: 120 },
  message:  { type: String, required: true, trim: true, maxlength: 2000 },
  status:   { type: String, enum: ["open", "answered", "closed"], default: "open" },
  replies:  { type: [ReplySchema], default: [] },
}, { timestamps: true });

SupportTicketSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
