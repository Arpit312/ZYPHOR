import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String, default: "System / Anonymous" },
  userEmail: { type: String },
  role: { 
    type: String, 
    enum: ["admin", "retailer", "wholesaler", "technician", "customer", "system"], 
    default: "customer" 
  },
  action: { type: String, required: true },
  entity: { type: String, default: "General" },
  entityId: { type: String },
  details: { type: String, default: "" },
  ipAddress: { type: String, default: "127.0.0.1" },
  status: { type: String, enum: ["SUCCESS", "FAILED", "WARNING"], default: "SUCCESS" },
}, { timestamps: true });

AuditLogSchema.index({ role: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
