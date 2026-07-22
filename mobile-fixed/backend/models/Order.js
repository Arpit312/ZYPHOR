const mongoose = require("mongoose");
const BillSchema = new mongoose.Schema({
  billNumber: String, listingPrice: Number, platformFee: Number,
  gstOnFee: Number, totalDeduction: Number, sellerReceives: Number,
  buyerPays: Number, platformFeePercent: Number, gstPercent: Number,
}, { _id:false });
const OrderSchema = new mongoose.Schema({
  buyer: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  seller: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  listing: { type:mongoose.Schema.Types.ObjectId, ref:"Listing", required:true },
  amount: { type:Number, required:true },
  bill: BillSchema,
  escrowStatus: { type:String, enum:["held","released","refunded"], default:"held" },
  orderStatus: { type:String, enum:["placed","confirmed","shipped","delivered","cancelled","disputed"], default:"placed" },
  paymentMethod: { type:String, default:"upi" },
  paymentId: String,
  deliveryAddress: String,
  deliveredAt: Date,
}, { timestamps:true });
module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
