import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { checkRateLimit } from "@/lib/rateLimit";

const DEFAULT_CATALOG = [
  { id: "demo-redmi-note13", brand: "Xiaomi", model: "Redmi Note 13 5G", price: 14999, trustScore: 88 },
  { id: "demo-realme-11", brand: "Realme", model: "Realme 11 Pro 5G", price: 18999, trustScore: 87 },
  { id: "demo-oneplus-nord", brand: "OnePlus", model: "OnePlus Nord CE 3 Lite", price: 17499, trustScore: 89 },
  { id: "demo-samsung-m34", brand: "Samsung", model: "Galaxy M34 5G", price: 16999, trustScore: 86 },
  { id: "demo-iphone-13", brand: "Apple", model: "iPhone 13 (128GB)", price: 45000, trustScore: 94 },
  { id: "demo-oneplus-11r", brand: "OnePlus", model: "OnePlus 11R 5G", price: 24500, trustScore: 90 }
];

function extractMaxBudget(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Match e.g. "under 20k", "20k", "15k"
  const kMatch = lower.match(/(?:under|below|around|within|max|budget)?\s*₹?\s*(\d+)\s*k\b/i);
  if (kMatch) return parseInt(kMatch[1], 10) * 1000;

  // Match e.g. "under 20000", "₹20,000", "20,000"
  const numMatch = lower.match(/(?:under|below|around|within|max|budget)?\s*₹?\s*(\d{1,2})[,\s]?(\d{3})\b/i);
  if (numMatch) return parseInt(numMatch[1] + numMatch[2], 10);

  // Match e.g. "under 15000"
  const plainNumMatch = lower.match(/(?:under|below|budget)\s*₹?\s*(\d{4,6})\b/i);
  if (plainNumMatch) return parseInt(plainNumMatch[1], 10);

  return null;
}

export async function POST(req) {
  try {
    const rateCheck = checkRateLimit(req, { limit: 10, windowMs: 24 * 60 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Daily limit reached for AI Advisor (10 requests/day). Please try again tomorrow!" }, { status: 429 });
    }

    const { message, language } = await req.json();

    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const selectedLanguage = language || "Hinglish";
    const maxBudget = extractMaxBudget(message);

    const systemPrompt = `You are ZYPHOR's AI Advisor — a high-speed smartphone recommendation agent for Indian buyers.

STRICT PRICE RULE:
${maxBudget ? `User budget limit is strictly ₹${maxBudget.toLocaleString("en-IN")}. NEVER recommend any phone whose price is greater than ₹${maxBudget}. ALL recommendations MUST have price <= ${maxBudget}.` : "Recommend best matching phones within reasonable budget."}

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
    let fullCatalog = [];

    try {
      await connectDB();
      const filter = { status: "active" };
      if (maxBudget) {
        filter.price = { $lte: maxBudget };
      }

      let dbListings = await Listing.find(filter).sort({ price: -1, "verification.trustScore": -1 }).limit(12).lean();

      // If budget query yielded no results, fetch nearest available listings
      if (dbListings.length === 0 && maxBudget) {
        dbListings = await Listing.find({ status: "active" }).sort({ price: 1 }).limit(12).lean();
      }

      if (dbListings.length > 0) {
        fullCatalog = dbListings;
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
      fullCatalog = DEFAULT_CATALOG;
      catalogSummary = maxBudget ? DEFAULT_CATALOG.filter(item => item.price <= maxBudget) : DEFAULT_CATALOG;
      if (catalogSummary.length === 0) catalogSummary = DEFAULT_CATALOG;
    }

    const userContent = `CATALOG: ${JSON.stringify(catalogSummary)}
BUDGET LIMIT: ${maxBudget ? `MAX ₹${maxBudget}` : "No strict limit"}
LANG: ${selectedLanguage}
REQUEST: "${message}"`;

    const resultObj = await callGemini({ system: systemPrompt, content: userContent });
    let recs = [];

    if (resultObj.ok) {
      recs = parseModelJSON(resultObj.text);
    }

    // Filter AI recommendations server-side to guarantee price <= maxBudget
    if (Array.isArray(recs) && maxBudget) {
      recs = recs.filter((item) => Number(item.price) <= maxBudget);
    }

    // High-speed instant fallback if AI JSON parse needed backup
    if (!Array.isArray(recs) || recs.length === 0) {
      let filtered = catalogSummary;
      if (maxBudget) {
        filtered = catalogSummary.filter((item) => Number(item.price) <= maxBudget);
      }
      if (filtered.length === 0) filtered = catalogSummary;

      recs = filtered.slice(0, 3).map((item) => ({
        id: item.id,
        brand: item.brand,
        model: item.model,
        price: item.price,
        trustScore: item.trustScore || 90,
        matchScore: 92,
        whyItFits: selectedLanguage === "Hindi"
          ? `यह फ़ोन ₹${item.price.toLocaleString("en-IN")} के बजट में आपके लिए सबसे सही है।`
          : selectedLanguage === "English"
          ? `This phone is a great value match under ₹${(maxBudget || item.price).toLocaleString("en-IN")}.`
          : `Yeh phone ₹${item.price.toLocaleString("en-IN")} ke budget mein aapke liye best option hai.`,
        tradeoff: selectedLanguage === "Hindi" ? "सीमित स्टॉक उपलब्ध।" : "Limited stock available."
      }));
    }

    return NextResponse.json({ recommendations: recs, catalog: fullCatalog.length > 0 ? fullCatalog : DEFAULT_CATALOG });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to process AI recommendation." }, { status: 500 });
  }
}
