import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { checkRateLimit } from "@/lib/rateLimit";

const DEFAULT_CATALOG = [
  { id: "demo-iphone-13", brand: "Apple", model: "iPhone 13 (128GB)", price: 45000, trustScore: 94 },
  { id: "demo-oneplus-11r", brand: "OnePlus", model: "OnePlus 11R 5G", price: 24500, trustScore: 90 },
  { id: "demo-redmi-note13", brand: "Xiaomi", model: "Redmi Note 13 5G", price: 14999, trustScore: 88 },
  { id: "demo-samsung-s22", brand: "Samsung", model: "Galaxy S22 5G", price: 32000, trustScore: 92 }
];

export async function POST(req) {
  try {
    const rateCheck = checkRateLimit(req, { limit: 10, windowMs: 24 * 60 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Daily limit reached for AI Advisor (10 requests/day). Please try again tomorrow!" }, { status: 429 });
    }

    const { message, language } = await req.json();

    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const selectedLanguage = language || "Hinglish";

    const systemPrompt = `You are ZYPHOR's AI Advisor — a high-speed smartphone recommendation agent for Indian buyers.

Rules:
1. Respond STRICTLY in selected language: "${selectedLanguage}".
2. Recommend TOP 3 matching items from catalog array.
3. Keep whyItFits explanation to 1 short sentence in ${selectedLanguage}.
4. Output ONLY valid JSON array in this structure:
[
  {
    "id": "<id>",
    "brand": "<brand>",
    "model": "<model>",
    "price": <number>,
    "trustScore": <number>,
    "matchScore": 95,
    "whyItFits": "<1 short sentence in ${selectedLanguage}>",
    "tradeoff": "<1 short tradeoff in ${selectedLanguage}>"
  }
]`;

    let catalogSummary = [];
    try {
      await connectDB();
      const dbListings = await Listing.find({ status: "active" }).sort({ "verification.trustScore": -1 }).limit(10).lean();
      if (dbListings.length > 0) {
        catalogSummary = dbListings.map((l) => ({
          id: l._id.toString(),
          brand: l.brand,
          model: l.model,
          price: l.price,
          trustScore: l.verification?.trustScore || 90
        }));
      }
    } catch {
      // Fallback
    }

    if (catalogSummary.length === 0) {
      catalogSummary = DEFAULT_CATALOG;
    }

    const userContent = `CATALOG: ${JSON.stringify(catalogSummary)}
LANG: ${selectedLanguage}
REQUEST: "${message}"`;

    const resultObj = await callGemini({ system: systemPrompt, content: userContent });
    let recs = [];

    if (resultObj.ok) {
      recs = parseModelJSON(resultObj.text);
    }

    // High-speed instant fallback if AI JSON parse needed backup
    if (!Array.isArray(recs) || recs.length === 0) {
      recs = catalogSummary.slice(0, 3).map((item) => ({
        id: item.id,
        brand: item.brand,
        model: item.model,
        price: item.price,
        trustScore: item.trustScore || 90,
        matchScore: 92,
        whyItFits: selectedLanguage === "Hindi"
          ? "यह फ़ोन आपके बजट और आवश्यकताओं के लिए बेहतरीन विकल्प है।"
          : selectedLanguage === "English"
          ? "This phone is a great value match for your budget and requirements."
          : "Yeh phone aapke budget aur zarurat ke liye ekdum mast option hai.",
        tradeoff: selectedLanguage === "Hindi" ? "सीमित स्टॉक उपलब्ध।" : "Limited stock available."
      }));
    }

    return NextResponse.json({ recommendations: recs, catalog: catalogSummary });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to process AI recommendation." }, { status: 500 });
  }
}
