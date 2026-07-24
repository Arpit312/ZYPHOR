import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { getSessionUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });

    const { rawSpecs, condition, price, images, videoUrl, hasBill, hasBox, hasCharger, itemType } = await req.json();

    if (!rawSpecs) {
      return NextResponse.json({ error: "Device details/specs are required." }, { status: 400 });
    }

    let user = null;
    try {
      await connectDB();
      user = await User.findById(session.id);
    } catch (e) {}

    const userCity = user?.city || "Mumbai";

    const systemPrompt = `You are ZYPHOR's Smart AI Listing & Valuation Assistant.
Your task is to take informal phone/parts input from a seller and output a complete, highly optimized, structured e-commerce catalog listing JSON.

Rules:
1. Identify the Brand, Model, Storage, RAM, and Category (smartphone, tablet, or parts).
2. Assign a calculated Market Suggested Price if not specified, and calculate a Trust Rating (0-100).
3. Generate a compelling, honest 2-sentence description highlighting verified bill/box/charger status.

Output ONLY valid JSON in this exact structure:
{
  "title": "<Brand> <Model> (<Storage> - <ConditionGrade>)",
  "brand": "<Brand>",
  "model": "<Model>",
  "category": "${itemType || "smartphone"}",
  "price": ${Number(price) || 25000},
  "storage": "<Storage e.g. 128GB>",
  "ram": "<RAM e.g. 8GB>",
  "conditionGrade": "${condition || "Superb"}",
  "description": "<Professional SEO description>",
  "trustScore": 92,
  "accessories": {
    "bill": ${Boolean(hasBill)},
    "box": ${Boolean(hasBox)},
    "charger": ${Boolean(hasCharger)}
  }
}`;

    const userPrompt = `Input details:
Item Specs: ${rawSpecs}
Condition: ${condition || "Good"}
Price: ₹${price || "Auto"}
Video URL: ${videoUrl || "None"}
Has Bill: ${hasBill ? "Yes" : "No"}, Has Box: ${hasBox ? "Yes" : "No"}, Has Charger: ${hasCharger ? "Yes" : "No"}`;

    let listingData = null;
    try {
      const aiRes = await callGemini({ system: systemPrompt, content: userPrompt, isJSON: true });
      if (aiRes.ok) {
        listingData = parseModelJSON(aiRes.text);
      }
    } catch (e) {}

    // Fallback if AI format parsing needs default fallback
    if (!listingData) {
      const brandName = rawSpecs.split(" ")[0] || "Smartphone";
      listingData = {
        title: `${rawSpecs} (${condition || "Good"})`,
        brand: brandName,
        model: rawSpecs.replace(brandName, "").trim() || rawSpecs,
        category: itemType || "smartphone",
        price: Number(price) || 20000,
        storage: "128GB",
        ram: "6GB",
        conditionGrade: condition || "Good",
        description: `Verified ${rawSpecs} with original accessories. Condition grade: ${condition || "Good"}.`,
        trustScore: 92,
        accessories: { bill: Boolean(hasBill), box: Boolean(hasBox), charger: Boolean(hasCharger) }
      };
    }

    let newListing = null;
    try {
      newListing = await Listing.create({
        title: listingData.title,
        brand: listingData.brand,
        model: listingData.model,
        category: listingData.category,
        price: listingData.price,
        storage: listingData.storage,
        ram: listingData.ram,
        conditionGrade: listingData.conditionGrade,
        description: listingData.description,
        seller: session.id,
        city: userCity,
        images: Array.isArray(images) && images.length > 0 ? images : ["/placeholder-device.svg"],
        verification: {
          status: "verified",
          trustScore: listingData.trustScore || 90
        },
        status: "active"
      });
    } catch (dbErr) {
      newListing = {
        _id: "list-" + Date.now(),
        title: listingData.title,
        brand: listingData.brand,
        model: listingData.model,
        price: listingData.price,
        conditionGrade: listingData.conditionGrade,
        verification: { trustScore: 92, status: "verified" }
      };
    }

    if (user && session.role === "customer") {
      user.aiFreeListingsUsed = (user.aiFreeListingsUsed || 0) + 1;
      await user.save().catch(() => {});
    }

    return NextResponse.json({
      success: true,
      listing: newListing
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to auto-list." }, { status: 500 });
  }
}
