import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Null means Admin
  senderRole: { type: String },
  subject: { type: String, trim: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  category: { type: String, enum: ["inquiry", "issue", "payout", "general"], default: "general" }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
