const mongoose = require("mongoose");

// Address book entry (used by checkout). Kept in sync with website User shape:
// website may carry extra fields (userTokenId, refreshToken, resetOtp, ...) —
// never strip them; only write the fields you own via $set updates.
const AddressSchema = new mongoose.Schema({
  label:      { type: String, default: "Home", trim: true },   // Home / Work / Other
  name:       { type: String, required: true, trim: true },
  phone:      { type: String, required: true, trim: true },
  street:     { type: String, required: true, trim: true },
  city:       { type: String, default: "", trim: true },
  state:      { type: String, default: "", trim: true },
  pincode:    { type: String, required: true, trim: true },
  isDefault:  { type: Boolean, default: false },
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: { type:String, required:true, trim:true },
  email: { type:String, required:true, lowercase:true, trim:true },
  phone: { type:String, trim:true },
  passwordHash: { type:String, required:true },
  role: { type:String, enum:["customer","retailer","wholesaler","technician","admin"], default:"customer" },
  city: { type:String, trim:true },
  businessName: { type:String, trim:true },
  businessAddress: { type:String, trim:true },
  gstNumber: { type:String, trim:true },
  verifiedSeller: { type:Boolean, default:false },
  trustRating: { type:Number, default:0 },
  isActive: { type:Boolean, default:true },
  profileImage: { type:String },
  totalSales: { type:Number, default:0 },
  totalEarnings: { type:Number, default:0 },
  // Password reset — SAME field names as the website (resetOtp/resetOtpExpiry)
  // so a code requested on web works in the app and vice versa.
  resetOtp: { type:Number },
  resetOtpExpiry: { type:Date },
  // legacy mobile fields (kept so old rows still validate)
  resetPasswordCode: { type:String },
  resetPasswordExpires: { type:Date },
  // Saved addresses for checkout
  addresses: { type:[AddressSchema], default:[] },
  // AI usage quota tracking (month-rolled counter)
  aiCallsUsed: { type:Number, default:0 },
  aiCallsMonth: { type:String, default:"" }, // "2026-11"
  subscription: {
    plan: { type:String, enum:["free","basic","pro","enterprise"], default:"free" },
    status: { type:String, enum:["active","inactive","expired","cancelled"], default:"inactive" },
    startDate: Date, endDate: Date, billingCycle: String,
  },
}, { timestamps:true });
// Compound unique: same email can have different roles (customer, retailer, etc.)
UserSchema.index({ email: 1, role: 1 }, { unique: true });
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
