import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { name, email, role, action } = await req.json();

    const userName = name || email?.split("@")[0] || "Partner";
    const userRole = role || "customer";

    const systemPrompt = `You are ZYPHOR's AI Legal & Compliance Agent.
Your job is to generate a personalized, legally sound Terms of Service & Privacy Agreement for a user on ZYPHOR (India's AI-Verified Smartphone Marketplace).

Platform Monetization & Revenue Rules (MUST BE INCLUDED IN AGREEMENT):
1. Marketplace Transactions: Zyphor deducts a 3% platform commission + 18% GST on all device sales.
2. Repair Services: Technicians pay a 15% platform service cut on all doorstep repair bookings.
3. Wholesale & Retail Subscriptions: 3 months free onboarding, followed by monthly subscription tier.
4. Escrow & Safety: Buyer payments are held in Escrow until item delivery and IMEI condition verification.
5. Anti-Theft Policy: Seller warrants that devices are NOT stolen and have clear CEIR blacklist status.

Generate output ONLY as valid JSON in this exact structure:
{
  "title": "ZYPHOR ${userRole.toUpperCase()} AGREEMENT & PRIVACY POLICY",
  "preparedFor": "${userName}",
  "role": "${userRole}",
  "monetizationSummary": "Zyphor charges a 3% transaction fee + 18% GST on device sales and 15% on repair services.",
  "clauses": [
    {
      "heading": "1. Platform Fees & Revenue Model",
      "content": "You acknowledge and agree that Zyphor deducts a 3% platform fee plus 18% GST on completed transactions..."
    },
    {
      "heading": "2. Escrow Protection & Payouts",
      "content": "All buyer payments are secured in Escrow. Payouts are released within 24 hours of successful delivery..."
    },
    {
      "heading": "3. Anti-Theft & IMEI Declaration",
      "content": "You certify that all listed devices are legally owned, non-stolen, and free of government CEIR blacklists..."
    },
    {
      "heading": "4. Privacy & Data Handling",
      "content": "Zyphor encrypts user credentials and personal data under Indian IT Act compliance..."
    }
  ]
}`;

    const userPrompt = `Generate personalized agreement for:
Name: ${userName}
Email: ${email || "user@zyphor.in"}
Role: ${userRole}
Action: ${action || "login"}`;

    const aiRes = await callGemini({ system: systemPrompt, content: userPrompt });

    if (aiRes.ok) {
      const parsed = parseModelJSON(aiRes.text);
      if (parsed) {
        return NextResponse.json({ success: true, agreement: parsed });
      }
    }

    // High quality fallback if AI is delayed or offline
    const fallbackAgreement = {
      title: `ZYPHOR ${userRole.toUpperCase()} AGREEMENT & PRIVACY POLICY`,
      preparedFor: userName,
      role: userRole,
      monetizationSummary: "Zyphor charges a 3% transaction fee + 18% GST on sales and 15% cut on repairs.",
      clauses: [
        {
          heading: "1. Platform Fees & Revenue Model",
          content: `As a ${userRole}, you agree to Zyphor's standard revenue policy. A 3% platform fee (+18% GST) applies to device sales, and a 15% service fee applies to technician repair jobs.`
        },
        {
          heading: "2. Escrow Protection & Payouts",
          content: "Buyer payments are safely held in Escrow and released to the seller upon delivery verification."
        },
        {
          heading: "3. Device Ownership & IMEI Verification",
          content: "Sellers warrant that devices are legally owned and free from theft or CEIR government blacklists."
        },
        {
          heading: "4. Privacy & Data Security",
          content: "Your account data is encrypted and strictly protected under Indian privacy laws."
        }
      ]
    };

    return NextResponse.json({ success: true, agreement: fallbackAgreement });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
