const mongoose = require("mongoose");
const SubSchema = new mongoose.Schema({
  user: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  plan: { type:String, enum:["basic","pro","enterprise"], required:true },
  status: { type:String, enum:["active","inactive","expired","cancelled"], default:"active" },
  billingCycle: { type:String, enum:["monthly","yearly"], default:"monthly" },
  startDate: Date, endDate: Date,
  amount: Number,
  razorpayPaymentId: String,
  planDetails: { maxListings: Number, aiCallsPerMonth: Number, label: String },
}, { timestamps:true });
module.exports = mongoose.models.Subscription || mongoose.model("Subscription", SubSchema);
