import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    const rateCheck = checkRateLimit(req, { limit: 10, windowMs: 24 * 60 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Daily limit reached for AI Advisor (10 requests/day). Please try again tomorrow!" }, { status: 429 });
    }

    const { message, language } = await req.json();

    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const selectedLanguage = language || "Hinglish";

    const systemPrompt = `You are ZYPHOR's AI Advisor — a smart, friendly smartphone recommendation agent for Indian buyers.
Your job: analyze a user's budget, usage needs, and preferences, then recommend the TOP 3 best-matching verified phones from the available listings.

Rules:
1. Always respond STRICTLY in the user's selected language: "${selectedLanguage}".
   - If "Hindi": write in clean Devanagari script Hindi.
   - If "Hinglish": write in Romanized Hindi/Hinglish (e.g., "Yeh phone aapke budget ke liye best hai...").
   - If "English": write in professional, friendly English.
2. Ground every recommendation in the provided catalog JSON — never invent phones not in the list.
3. Highlight the AI Trust Score (0-100) for every device recommendation.
4. Output ONLY valid JSON — no preamble, no markdown fences.

Output format (strict JSON array):
[
  {
    "id": "<listing _id>",
    "brand": "<brand>",
    "model": "<model>",
    "price": <number>,
    "trustScore": <number 0-100>,
    "matchScore": <0-100>,
    "whyItFits": "<2-3 sentence explanation of why this phone fits the user's needs in ${selectedLanguage}>",
    "tradeoff": "<one honest trade-off in ${selectedLanguage}>"
  }
]

If no listings match the user's request at all, return an empty array [].`;

    await connectDB();
    const allListings = await Listing.find({ status: "active" }).lean();

    const catalogSummary = allListings.map((l) => ({
      id: l._id,
      brand: l.brand,
      model: l.model,
      price: l.price,
      storage: l.storage,
      ram: l.ram,
      conditionGrade: l.conditionGrade,
      tags: l.tags,
      trustScore: l.verification?.trustScore || 88,
      city: l.city
    }));

    const userContent = `
AVAILABLE LISTINGS (catalog):
${JSON.stringify(catalogSummary, null, 2)}

PREFERRED RESPONSE LANGUAGE: ${selectedLanguage}

USER REQUEST:
"${message}"

Recommend the TOP 3 matching phones as JSON array strictly in ${selectedLanguage}.`;

    const resultObj = await callGemini({ system: systemPrompt, content: userContent });
    if (!resultObj.ok) throw new Error(resultObj.error);

    const recs = parseModelJSON(resultObj.text);

    return NextResponse.json({ recommendations: Array.isArray(recs) ? recs : [], catalog: catalogSummary });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to process AI recommendation." }, { status: 500 });
  }
}
