import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
  billNumber:      { type: String },
  listingPrice:    { type: Number, required: true },
  platformFee:     { type: Number, required: true }, // e.g. 3% of price
  gstOnFee:        { type: Number, required: true }, // 18% on platform fee
  totalDeduction:  { type: Number, required: true }, // platformFee + gstOnFee
  sellerReceives:  { type: Number, required: true }, // listingPrice - totalDeduction
  buyerPays:       { type: Number, required: true },  // listingPrice (buyer pays full)
  platformFeePercent: { type: Number, default: 3 },
  gstPercent:      { type: Number, default: 18 },
  gstNumber:       { type: String },                 // seller's GST (if available)
  generatedAt:     { type: Date, default: Date.now },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  buyer:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },

  amount:  { type: Number, required: true },
  bill:    { type: BillSchema },

  escrowStatus: { type: String, enum: ["held","released","refunded"], default: "held" },
  orderStatus: {
    type: String,
    enum: ["placed","confirmed","shipped","delivered","cancelled","disputed"],
    default: "placed"
  },

  // Payment tracking
  paymentMethod:  { type: String, enum: ["upi","card","netbanking","cod","wallet"], default: "upi" },
  paymentId:      { type: String },
  razorpayOrderId:{ type: String },

  // Delivery
  deliveryAddress:{ type: String },
  deliveredAt:    { type: Date },
  cancellationReason: { type: String },
}, { timestamps: true });

// Auto-generate bill number
OrderSchema.pre("save", function(next) {
  if (!this.bill?.billNumber) {
    const now = new Date();
    const prefix = `ZYP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}`;
    const random = Math.floor(Math.random() * 90000) + 10000;
    if (this.bill) this.bill.billNumber = `${prefix}-${random}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
