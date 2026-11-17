const mongoose = require("mongoose");

const LoginSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  userName: { 
    type: String, 
    required: true,
    trim: true 
  },
  userEmail: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true 
  },
  role: { 
    type: String, 
    enum: ["admin", "retailer", "wholesaler", "technician", "customer"], 
    required: true 
  },
  ipAddress: { 
    type: String, 
    default: "127.0.0.1" 
  },
  device: { 
    type: String, 
    default: "Zyphor Mobile App (Expo/RN)" 
  },
  userAgent: { 
    type: String, 
    default: "" 
  },
  location: { 
    type: String, 
    default: "India (Mobile Client)" 
  },
  status: { 
    type: String, 
    enum: ["ACTIVE", "EXPIRED", "REVOKED"], 
    default: "ACTIVE" 
  },
  loginAt: { 
    type: Date, 
    default: Date.now 
  },
  lastActiveAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date 
  }
}, { timestamps: true });

LoginSessionSchema.index({ role: 1, status: 1 });
LoginSessionSchema.index({ userEmail: 1 });
LoginSessionSchema.index({ loginAt: -1 });

module.exports = mongoose.models.LoginSession || mongoose.model("LoginSession", LoginSessionSchema);
