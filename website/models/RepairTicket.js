import mongoose from "mongoose";
import "@/models/User";

const RepairTicketSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ticketNumber:    { type: String },
  brand:           { type: String, required: true },
  model:           { type: String, required: true },
  issue:           { type: String, required: true },
  preferredDate:   { type: Date },
  pincode:         { type: String, required: true },
  address:         { type: String },
  contactPhone:    { type: String },
  estimatedPrice:  { type: Number, default: 0 },
  status:          { type: String, enum: ["pending", "assigned", "in_repair", "completed", "cancelled"], default: "pending" },
  assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

RepairTicketSchema.pre("save", function(next) {
  if (!this.ticketNumber) {
    const random = Math.floor(Math.random() * 90000) + 10000;
    this.ticketNumber = `REP-${Date.now().toString().slice(-4)}-${random}`;
  }
  next();
});

export default mongoose.models.RepairTicket || mongoose.model("RepairTicket", RepairTicketSchema);
