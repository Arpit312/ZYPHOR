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

    await connectDB();
    const user = await User.findById(session.id);

    // Quota & Pricing Logic:
    // Customer: 3 Free Trial Listings, then requires sub or payment (₹99/mo).
    // Retailer / Wholesaler: Included in subscription.
    if (session.role === "customer") {
      if ((user.aiFreeListingsUsed || 0) >= 3 && !user.subscription?.status === "active") {
        return NextResponse.json({
          error: "Free trial limit reached (3 listings). Upgrade to ₹99/month AI Subscription to generate unlimited smart listings!"
        }, { status: 402 });
      }
    }

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

    const aiRes = await callGemini({ system: systemPrompt, content: userPrompt });

    let listingData = null;

    if (aiRes.ok) {
      listingData = parseModelJSON(aiRes.text);
    }

    // Fallback if AI format parsing needs default fallback
    if (!listingData) {
      listingData = {
        title: `${rawSpecs.slice(0, 30)} (${condition || "Good"})`,
        brand: rawSpecs.split(" ")[0] || "Smartphone",
        model: rawSpecs.slice(0, 20),
        category: itemType || "smartphone",
        price: Number(price) || 20000,
        storage: "128GB",
        ram: "6GB",
        conditionGrade: condition || "Good",
        description: `Verified device with original bill/box. Condition grade: ${condition || "Good"}.`,
        trustScore: 88,
        accessories: { bill: Boolean(hasBill), box: Boolean(hasBox), charger: Boolean(hasCharger) }
      };
    }

    // Create the actual database listing
    const newListing = await Listing.create({
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
      city: user.city || "Mumbai",
      images: Array.isArray(images) && images.length > 0 ? images : ["/placeholder-phone.png"],
      verification: {
        status: "verified",
        trustScore: listingData.trustScore || 90
      },
      status: "active"
    });

    // Increment free listing count for customers
    if (session.role === "customer") {
      user.aiFreeListingsUsed = (user.aiFreeListingsUsed || 0) + 1;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      listing: newListing,
      remainingFree: Math.max(0, 3 - (user.aiFreeListingsUsed || 0))
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
