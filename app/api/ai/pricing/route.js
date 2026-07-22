import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { brand, model, storage, ram, condition, batteryHealth, city } = await req.json();
    if (!brand || !model) return NextResponse.json({ error: "Brand and model required." }, { status: 400 });

    const prompt = `You are ZYPHOR's AI Pricing Agent. Analyze this used smartphone and suggest an optimal selling price for the Indian market.

Device Details:
- Brand: ${brand}
- Model: ${model}
- Storage: ${storage || "128GB"}
- RAM: ${ram || "8GB"}
- Condition: ${condition || "Good"}
- Battery Health: ${batteryHealth || 85}%
- City: ${city || "India"}

Provide a JSON response with:
{
  "minPrice": <number in INR>,
  "maxPrice": <number in INR>,
  "recommendedPrice": <number in INR>,
  "quickSalePrice": <10% less than recommended>,
  "marketTrend": "rising|stable|falling",
  "demandLevel": "high|medium|low",
  "factors": [<list of 3-4 key factors affecting price>],
  "tip": "<one practical tip for seller>"
}

Only respond with valid JSON, no extra text.`;

    const resultObj = await callGemini({ system: "You are a pricing agent.", content: prompt });
    if (!resultObj.ok) throw new Error(resultObj.error);

    const result = parseModelJSON(resultObj.text);
    if (!result) throw new Error("Could not parse AI response");
    
    return NextResponse.json(result);
  } catch (err) {
    // Fallback mock
    return NextResponse.json({
      minPrice: 20000, maxPrice: 45000, recommendedPrice: 35000, quickSalePrice: 31500,
      marketTrend: "stable", demandLevel: "medium",
      factors: ["Good condition adds value", "Battery health is acceptable", "Market competition in your city"],
      tip: "Price competitively and mention exact battery health for better trust.",
    });
  }
}
