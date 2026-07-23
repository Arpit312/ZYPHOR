import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  plan: { type: String, enum: ["free", "basic", "pro", "enterprise"], default: "free" },
  status: { type: String, enum: ["active", "inactive", "expired", "cancelled"], default: "inactive" },
  startDate: Date,
  endDate: Date,
  billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
  razorpaySubscriptionId: String,
  razorpayOrderId: String,
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:         { type: String, trim: true },
  passwordHash:  { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "retailer", "wholesaler", "technician", "admin"],
    default: "customer"
  },
  city:          { type: String, trim: true },
  businessName:  { type: String, trim: true },
  gstNumber:     { type: String, trim: true },
  verifiedSeller:{ type: Boolean, default: false },
  trustRating:   { type: Number, default: 0 },
  subscription:  { type: SubscriptionSchema, default: () => ({}) },
  resetOtp: { type: Number },
  resetOtpExpiry: { type: Date },
  // Cross-platform token (same account works on web + app)
  refreshToken:  { type: String },
  isActive:      { type: Boolean, default: true },
  profileImage:  { type: String },
  totalSales:    { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
}, { timestamps: true });

// Subscription plan limits
UserSchema.statics.PLANS = {
  free:       { price: 0,    listings: 0,   aiCalls: 5,    label: "Free" },
  basic:      { price: 299,  listings: 10,  aiCalls: 50,   label: "Basic" },
  pro:        { price: 799,  listings: 50,  aiCalls: 200,  label: "Pro" },
  enterprise: { price: 1999, listings: 999, aiCalls: 999,  label: "Enterprise" },
};

// Who needs subscription to sell
UserSchema.statics.ROLES_NEEDING_SUB = ["retailer", "wholesaler", "technician"];

export default mongoose.models.User || mongoose.model("User", UserSchema);
