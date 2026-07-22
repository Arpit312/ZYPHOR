import mongoose from "mongoose";
import "@/models/User";

const VerificationSchema = new mongoose.Schema({
  status: { type: String, enum: ["not_verified","needs_review","verified","failed"], default: "not_verified" },
  trustScore: { type: Number, default: 0 },
  components: {
    physicalCondition:    { type: Number, default: 0 },
    functionalCondition:  { type: Number, default: 0 },
    documentAuthenticity: { type: Number, default: 0 },
    sellerReliability:    { type: Number, default: 0 },
    priceFairness:        { type: Number, default: 0 },
  },
  aiSummary: { type: String, default: "" },
  flags: [{ type: String }],
}, { _id: false });

const ListingSchema = new mongoose.Schema({
  seller:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listingType:   { type: String, enum: ["device","part"], default: "device" },
  category:      { type: String, default: "Smartphone" },
  brand:         { type: String, required: true, trim: true },
  model:         { type: String, required: true, trim: true },
  title:         { type: String, trim: true },
  description:   { type: String, default: "" },
  price:         { type: Number, required: true },
  originalPrice: { type: Number },
  conditionGrade:{ type: String, enum: ["Superb","Good","Fair"], default: "Good" },
  conditionClaim:{ type: String, default: "" },
  imei:          { type: String, trim: true },
  storage:       { type: String, trim: true },
  ram:           { type: String, trim: true },
  city:          { type: String, trim: true },
  images:        [{ type: String }],
  tags:          [{ type: String }],
  emiEligible:   { type: Boolean, default: true },
  status:        { type: String, enum: ["draft","active","sold","blocked"], default: "active" },
  verification:  { type: VerificationSchema, default: () => ({}) },
  // Platform fee tracking
  platformFeePercent: { type: Number, default: 3 }, // 3%
  serviceTax:         { type: Number, default: 18 }, // GST 18%
  views:              { type: Number, default: 0 },
}, { timestamps: true });

ListingSchema.index({ brand: "text", model: "text", title: "text", description: "text" });

// Calculate platform fee breakdown
ListingSchema.methods.getFeeBreakdown = function() {
  const price = this.price;
  const platformFee = Math.round(price * (this.platformFeePercent / 100));
  const gst = Math.round(platformFee * (this.serviceTax / 100));
  const totalDeduction = platformFee + gst;
  const sellerReceives = price - totalDeduction;

  return {
    listingPrice: price,
    platformFee,
    gstOnFee: gst,
    totalDeduction,
    sellerReceives,
    platformFeePercent: this.platformFeePercent,
    gstPercent: this.serviceTax,
  };
};

export default mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
