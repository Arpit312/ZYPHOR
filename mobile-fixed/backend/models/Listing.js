const mongoose = require("mongoose");

// Mirrors website/models/Listing.js so shared-DB writes never strip website fields.
const VerSchema = new mongoose.Schema({
  status: { type:String, enum:["not_verified","needs_review","verified","failed"], default:"not_verified" },
  trustScore: { type:Number, default:0 },
  components: {
    physicalCondition:    { type:Number, default:0 },
    functionalCondition:  { type:Number, default:0 },
    documentAuthenticity: { type:Number, default:0 },
    sellerReliability:    { type:Number, default:0 },
    priceFairness:        { type:Number, default:0 },
  },
  aiSummary: { type:String, default:"" },
  flags: [String],
}, { _id:false });

const ReviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  rating:  { type:Number, min:1, max:5, required:true },
  comment: { type:String, default:"", trim:true, maxlength:500 },
}, { timestamps:true });

const ListingSchema = new mongoose.Schema({
  seller: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  listingType: { type:String, enum:["device","part"], default:"device" },
  category: { type:String, default:"Smartphone" },
  partCategory: { type:String, default:"other" },          // website parity
  brand: { type:String, required:true, trim:true },
  model: { type:String, required:true, trim:true },
  title: { type:String, trim:true },
  description: { type:String, default:"" },
  price: { type:Number, required:true },
  originalPrice: Number,
  // Union of website enum (Superb/Good/Fair) + app UI grades (Pristine/Excellent)
  conditionGrade: { type:String, enum:["Pristine","Superb","Excellent","Good","Fair"], default:"Good" },
  conditionClaim: { type:String, default:"" },              // website parity
  imei: { type:String, trim:true },
  storage: { type:String, trim:true },
  ram: { type:String, trim:true },
  city: { type:String, trim:true },
  images: [String],
  tags: [String],
  emiEligible: { type:Boolean, default:true },
  status: { type:String, enum:["draft","active","inactive","sold","blocked"], default:"active" },
  verification: { type:VerSchema, default:() => ({}) },
  platformFeePercent: { type:Number, default:3 },           // website parity
  serviceTax:         { type:Number, default:18 },          // website parity
  views: { type:Number, default:0 },
  reviews: { type:[ReviewSchema], default:[] },
  averageRating: { type:Number, default:0 },
  reviewCount: { type:Number, default:0 },
}, { timestamps:true });

ListingSchema.index({ brand: 1, model: 1 });
ListingSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
