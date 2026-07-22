import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { checkRateLimit } from "@/lib/rateLimit";

const SYSTEM = `You are ZYPHOR's AI Advisor — a smart, friendly smartphone recommendation agent for Indian buyers.
Your job: analyze a user's budget, usage needs, and preferences, then recommend the TOP 3 best-matching phones from the available listings.

Rules:
- Always respond in the SAME LANGUAGE the user writes in (Hindi, Hinglish, or English).
- Ground every recommendation in the provided catalog JSON — never invent phones not in the list.
- Be concise. Use simple, relatable language (no jargon).
- Output ONLY valid JSON — no preamble, no markdown fences.

Output format (strict JSON array):
[
  {
    "id": "<listing _id>",
    "brand": "<brand>",
    "model": "<model>",
    "price": <number>,
    "trustScore": <number>,
    "matchScore": <0-100>,
    "whyItFits": "<2-3 sentence plain-language explanation of why this phone fits the user's needs — in user's language>",
    "tradeoff": "<one honest trade-off — in user's language>"
  }
]

If no listings match the user's request at all, return an empty array [].`;

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

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
      trustScore: l.verification?.trustScore || 0,
      city: l.city
    }));

    const userContent = `
AVAILABLE LISTINGS (catalog):
${JSON.stringify(catalogSummary, null, 2)}

USER REQUEST:
"${message}"

Recommend the TOP 3 matching phones as JSON.`;

    const result = await callGemini({ system: SYSTEM, content: userContent });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    let recommendations = parseModelJSON(result.text);

    if (!recommendations) {
      return NextResponse.json({ error: "AI response could not be parsed. Please try again." }, { status: 500 });
    }

    // Sometimes Gemini wraps it in { recommendations: [...] }
    if (!Array.isArray(recommendations) && Array.isArray(recommendations.recommendations)) {
      recommendations = recommendations.recommendations;
    } else if (!Array.isArray(recommendations)) {
      recommendations = [];
    }

    return NextResponse.json({ recommendations });
  } catch (err) {
    return NextResponse.json({ error: err.message || "AI Advisor failed." }, { status: 500 });
  }
}
