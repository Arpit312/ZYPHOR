// ─── PLATFORM FEE & GST BILLING UTILITY ─────────────────────────────────────
// Platform charges 3% commission + 18% GST on that commission

export const PLATFORM_FEE_PERCENT = 3;
export const GST_PERCENT = 18;

/**
 * Calculate complete fee breakdown for a sale
 * @param {number} listingPrice
 * @param {string} sellerGST - optional GST number of seller
 */
export function calculateBill(listingPrice, sellerGST = null) {
  const platformFee     = Math.round(listingPrice * (PLATFORM_FEE_PERCENT / 100));
  const gstOnFee        = Math.round(platformFee  * (GST_PERCENT / 100));
  const totalDeduction  = platformFee + gstOnFee;
  const sellerReceives  = listingPrice - totalDeduction;
  const buyerPays       = listingPrice;

  return {
    listingPrice,
    platformFee,
    gstOnFee,
    totalDeduction,
    sellerReceives,
    buyerPays,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    gstPercent: GST_PERCENT,
    gstNumber: sellerGST || null,
  };
}

/** Generate a readable invoice number */
export function generateInvoiceNumber(prefix = "ZYP") {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${y}${m}-${rand}`;
}

/** Subscription plan pricing */
export const SUBSCRIPTION_PLANS = {
  basic: {
    monthly: 299,
    yearly: 2990,
    label: "Basic",
    maxListings: 10,
    aiCallsPerMonth: 50,
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
    label: "Pro",
    maxListings: 50,
    aiCallsPerMonth: 200,
    features: [
      "50 active listings",
      "200 AI advisor calls/month",
      "Advanced analytics",
      "Priority support",
      "Featured listings badge",
    ]
  },
  enterprise: {
    monthly: 1999,
    yearly: 19990,
    label: "Enterprise",
    maxListings: 999,
    aiCallsPerMonth: 999,
    features: [
      "Unlimited listings",
      "Unlimited AI calls",
      "Full analytics",
      "Dedicated account manager",
      "API access",
      "GST invoices",
    ]
  }
};

export const ROLES_NEEDING_SUBSCRIPTION = ["retailer", "wholesaler", "technician"];
export const CUSTOMER_FREE = true;
