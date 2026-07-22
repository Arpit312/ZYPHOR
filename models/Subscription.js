import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan:    { type: String, enum: ["basic","pro","enterprise"], required: true },
  status:  { type: String, enum: ["active","inactive","expired","cancelled"], default: "active" },
  billingCycle:     { type: String, enum: ["monthly","yearly"], default: "monthly" },
  startDate:        { type: Date, required: true },
  endDate:          { type: Date, required: true },
  amount:           { type: Number, required: true }, // amount paid
  razorpayOrderId:  { type: String },
  razorpayPaymentId:{ type: String },
  invoiceNumber:    { type: String },
  // Plan details snapshot
  planDetails: {
    maxListings: Number,
    aiCallsPerMonth: Number,
    label: String,
  }
}, { timestamps: true });

// Plan config
SubscriptionSchema.statics.PLANS = {
  basic: {
    monthly: 299,
    yearly: 2990,
    maxListings: 10,
    aiCallsPerMonth: 50,
    label: "Basic",
    features: [
      "10 active listings",
      "50 AI advisor calls/month",
      "Basic analytics",
      "Email support",
    ]
  },
  pro: {
    monthly: 799,
    yearly: 7990,
    maxListings: 50,
    aiCallsPerMonth: 200,
    label: "Pro",
    features: [
      "50 active listings",
      "200 AI advisor calls/month",
      "Advanced analytics",
      "Priority support",
      "Featured listings badge",
      "IMEI bulk check",
    ]
  },
  enterprise: {
    monthly: 1999,
    yearly: 19990,
    maxListings: 999,
    aiCallsPerMonth: 999,
    label: "Enterprise",
    features: [
      "Unlimited listings",
      "Unlimited AI calls",
      "Full analytics dashboard",
      "Dedicated account manager",
      "API access",
      "Custom branding",
      "GST invoice",
    ]
  }
};

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
