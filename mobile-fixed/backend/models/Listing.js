const mongoose = require("mongoose");
const VerSchema = new mongoose.Schema({
  status: { type:String, enum:["not_verified","needs_review","verified","failed"], default:"not_verified" },
  trustScore: { type:Number, default:0 },
  aiSummary: { type:String, default:"" },
  flags: [String],
}, { _id:false });
const ListingSchema = new mongoose.Schema({
  seller: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  listingType: { type:String, enum:["device","part"], default:"device" },
  category: { type:String, default:"Smartphone" },
  brand: { type:String, required:true, trim:true },
  model: { type:String, required:true, trim:true },
  title: { type:String, trim:true },
  description: { type:String, default:"" },
  price: { type:Number, required:true },
  originalPrice: Number,
  conditionGrade: { type:String, enum:["Superb","Good","Fair"], default:"Good" },
  imei: { type:String, trim:true },
  storage: String, ram: String, city: String,
  images: [String], tags: [String],
  emiEligible: { type:Boolean, default:true },
  status: { type:String, enum:["draft","active","sold","blocked"], default:"active" },
  verification: { type:VerSchema, default:() => ({}) },
  views: { type:Number, default:0 },
}, { timestamps:true });
module.exports = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
