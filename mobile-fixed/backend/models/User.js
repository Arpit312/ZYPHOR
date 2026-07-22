const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: { type:String, required:true, trim:true },
  email: { type:String, required:true, unique:true, lowercase:true, trim:true },
  phone: { type:String, trim:true },
  passwordHash: { type:String, required:true },
  role: { type:String, enum:["customer","retailer","wholesaler","technician","admin"], default:"customer" },
  city: { type:String, trim:true },
  businessName: { type:String, trim:true },
  gstNumber: { type:String, trim:true },
  verifiedSeller: { type:Boolean, default:false },
  trustRating: { type:Number, default:0 },
  isActive: { type:Boolean, default:true },
  profileImage: { type:String },
  totalSales: { type:Number, default:0 },
  totalEarnings: { type:Number, default:0 },
  resetPasswordCode: { type:String },
  resetPasswordExpires: { type:Date },
  subscription: {
    plan: { type:String, enum:["free","basic","pro","enterprise"], default:"free" },
    status: { type:String, enum:["active","inactive","expired","cancelled"], default:"inactive" },
    startDate: Date, endDate: Date, billingCycle: String,
  },
}, { timestamps:true });
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
