import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Null means Admin
  senderRole: { type: String, default: "customer" },
  senderName: { type: String },
  senderEmail: { type: String },
  subject: { type: String, trim: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  category: { 
    type: String, 
    enum: ["inquiry", "issue", "payout", "general", "complaint", "order_query"], 
    default: "general" 
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed"],
    default: "open"
  },
  adminReply: { type: String },
  adminRepliedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
