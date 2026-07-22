const PLATFORM_FEE = 3;
const GST = 18;

function calculateBill(price, sellerGST=null) {
  const platformFee = Math.round(price * (PLATFORM_FEE/100));
  const gstOnFee = Math.round(platformFee * (GST/100));
  return { listingPrice:price, platformFee, gstOnFee, totalDeduction:platformFee+gstOnFee, sellerReceives:price-platformFee-gstOnFee, buyerPays:price, platformFeePercent:PLATFORM_FEE, gstPercent:GST, gstNumber:sellerGST||null };
}

function generateInvoiceNumber(prefix="ZYP") {
  const now = new Date();
  return `${prefix}-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}-${Math.floor(10000+Math.random()*90000)}`;
}

const SUBSCRIPTION_PLANS = {
  basic: { monthly:299, yearly:2990, label:"Basic", maxListings:10, aiCallsPerMonth:50, features:["10 active listings","50 AI calls/month","Basic analytics"] },
  pro: { monthly:799, yearly:7990, label:"Pro", maxListings:50, aiCallsPerMonth:200, features:["50 active listings","200 AI calls/month","Advanced analytics","Featured badge"] },
  enterprise: { monthly:1999, yearly:19990, label:"Enterprise", maxListings:999, aiCallsPerMonth:999, features:["Unlimited listings","Unlimited AI calls","Full analytics","API access"] },
};

module.exports = { calculateBill, generateInvoiceNumber, SUBSCRIPTION_PLANS, PLATFORM_FEE, GST };
