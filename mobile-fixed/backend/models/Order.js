const mongoose = require("mongoose");

// Mirrors website/models/Order.js (bill.gstNumber, razorpayOrderId, cancellationReason)
// plus a statusHistory timeline used by the app's order-tracking screen.
const BillSchema = new mongoose.Schema({
  billNumber: String, listingPrice: Number, platformFee: Number,
  gstOnFee: Number, totalDeduction: Number, sellerReceives: Number,
  buyerPays: Number, platformFeePercent: Number, gstPercent: Number,
  gstNumber: String,                 // website parity
  generatedAt: { type:Date, default:Date.now }, // website parity
}, { _id:false });

const StatusHistorySchema = new mongoose.Schema({
  status: { type:String, required:true },
  at: { type:Date, default:Date.now },
  by: { type:mongoose.Schema.Types.ObjectId, ref:"User" },
  note: { type:String, default:"" },
}, { _id:false });

const OrderSchema = new mongoose.Schema({
  buyer: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  seller: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  listing: { type:mongoose.Schema.Types.ObjectId, ref:"Listing", required:true },
  amount: { type:Number, required:true },
  bill: BillSchema,
  escrowStatus: { type:String, enum:["held","released","refunded"], default:"held" },
  orderStatus: { type:String, enum:["placed","confirmed","shipped","delivered","cancelled","disputed"], default:"placed" },
  paymentMethod: { type:String, enum:["upi","card","netbanking","cod","wallet"], default:"upi" },
  paymentId: String,
  razorpayOrderId: String,           // website parity
  deliveryAddress: String,
  deliveredAt: Date,
  cancellationReason: String,        // website parity
  statusHistory: { type:[StatusHistorySchema], default:() => ([{ status:"placed" }]) },
}, { timestamps:true });

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
