import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { checkRateLimit } from "@/lib/rateLimit";

const DEFAULT_CATALOG = [
  { id: "demo-redmi-note13", brand: "Xiaomi", model: "Redmi Note 13 5G", price: 14999, trustScore: 88, specs: "Dimensity 6080, 108MP Camera, 5000mAh Battery" },
  { id: "demo-realme-11", brand: "Realme", model: "Realme 11 Pro 5G", price: 18999, trustScore: 87, specs: "Dimensity 7050, 100MP OIS Camera, 67W Fast Charging" },
  { id: "demo-oneplus-nord", brand: "OnePlus", model: "OnePlus Nord CE 3 Lite", price: 17499, trustScore: 89, specs: "Snapdragon 695, 108MP Camera, 5000mAh Battery" },
  { id: "demo-samsung-m34", brand: "Samsung", model: "Galaxy M34 5G", price: 16999, trustScore: 86, specs: "Exynos 1280, 50MP OIS Camera, 6000mAh Battery" },
  { id: "demo-iphone-13", brand: "Apple", model: "iPhone 13 (128GB)", price: 45000, trustScore: 94, specs: "A15 Bionic, 12MP Dual Camera, Super Retina XDR" },
  { id: "demo-oneplus-11r", brand: "OnePlus", model: "OnePlus 11R 5G", price: 24500, trustScore: 90, specs: "Snapdragon 8+ Gen 1, 50MP Sony IMX890 OIS" }
];

function extractMaxBudget(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const kMatch = lower.match(/(?:under|below|around|within|max|budget)?\s*₹?\s*(\d+)\s*k\b/i);
  if (kMatch) return parseInt(kMatch[1], 10) * 1000;
  const numMatch = lower.match(/(?:under|below|around|within|max|budget)?\s*₹?\s*(\d{1,2})[,\s]?(\d{3})\b/i);
  if (numMatch) return parseInt(numMatch[1] + numMatch[2], 10);
  const plainNumMatch = lower.match(/(?:under|below|budget)\s*₹?\s*(\d{4,6})\b/i);
  if (plainNumMatch) return parseInt(plainNumMatch[1], 10);
  return null;
}

function isFollowUpQuestion(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const followUpKeywords = [
    "feature", "specs", "camera", "battery", "processor", "ram", "storage", "display",
    "heating", "bgmi", "gaming", "screen", "charging", "charger", "warranty", "condition",
    "kais", "kaisa", "kaisi", "kitn", "kitna", "kitni", "batao", "bataiye", "detail",
    "is", "us", "isme", "usme", "ismein", "usmein", "dono", "farq", "difference", "compare",
    "kyun", "kyu", "reason", "best", "kyun lu", "buy", "khareed"
  ];
  const newSearchKeywords = [
    "dusra", "dusre", "dusri", "other", "another", "nayi", "naya", "naye", "show me new",
    "under 10k", "under 15k", "under 20k", "under 25k", "under 30k", "under 40k", "under 50k",
    "under 60k", "suggest new", "re-recommend", "change"
  ];

  const hasNewSearch = newSearchKeywords.some(kw => lower.includes(kw));
  if (hasNewSearch) return false;

  return followUpKeywords.some(kw => lower.includes(kw));
}

function isUnrelatedQuery(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const unrelatedKeywords = [
    "weather", "recipe", "cook", "movie", "song", "cricket", "football", "politic",
    "president", "math", "calculator", "essay", "homework", "joke", "story"
  ];
  const phoneContext = ["phone", "mobile", "smartphone", "camera", "battery", "gaming", "budget", "under", "price", "buy", "sell", "zyphor"];
  const hasPhoneContext = phoneContext.some(kw => lower.includes(kw));
  if (hasPhoneContext) return false;

  return unrelatedKeywords.some(kw => lower.includes(kw));
}

export async function POST(req) {
  try {
    const rateCheck = checkRateLimit(req, { limit: 20, windowMs: 24 * 60 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Daily limit reached for AI Advisor (20 requests/day). Please try again tomorrow!" }, { status: 429 });
    }

    const { message, language, history } = await req.json();

    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const selectedLanguage = language || "Hinglish";
    const maxBudget = extractMaxBudget(message);

    // GUARD 1: OUT-OF-SCOPE REDIRECT
    if (isUnrelatedQuery(message)) {
      const redirectText = selectedLanguage === "Hindi"
        ? "मैं ZYPHOR का AI एडवाइज़र हूँ — आपका टेक दोस्त! 📱 मैं आपको सही फ़ोन चुनने, उनके फीचर्स बताने और बेस्ट डील पर फ़ोन बाय (Buy) कराने में हेल्प करूँगा। अपना बजट या पसंद बताइए — जैसे गेमिंग, कैमरा या बैटरी!"
        : selectedLanguage === "English"
        ? "I am ZYPHOR's AI Advisor — your tech best friend & buying guide! 📱 I will help you choose the right phone, explain specs, and convince you with the best verified deals. Tell me your budget or choice — like gaming, camera, or battery!"
        : "Main ZYPHOR ka AI Advisor hoon — aapka tech dost! 📱 Main aapko sahi phone choose karne, uske mast features samjhane aur best verified deal par buy karne me help karunga. Apne choice aur budget batao — jaise gaming, camera ya heavy battery!";

      return NextResponse.json({
        type: "chat",
        text: redirectText,
        recommendations: []
      });
    }

    const isFollowUp = isFollowUpQuestion(message) && Array.isArray(history) && history.length > 0;

    // MODE 1: FRIENDLY & CONVINCING SALESPERSON CHAT
    if (isFollowUp) {
      const historyContext = history.slice(-4).map(h => `${h.role.toUpperCase()}: ${h.text}`).join("\n");
      const chatPrompt = `You are ZYPHOR's AI Advisor — an Honest Tech Best Friend + Master Sales Expert.

PERSONA:
- Talk like an honest, friendly tech buddy ("Bhai / Dost").
- Be super persuasive & convincing! Tell the user WHY buying this phone right now on ZYPHOR is the best decision for their money.
- Highlight key value points: ZYPHOR AI Verified Trust Score, OIS Camera stability, AMOLED display, massive price discount, Escrow payment safety.

RULES:
1. Respond STRICTLY in selected language: "${selectedLanguage}".
2. Explain specs with enthusiastic sales energy & honest friend advice.
3. Keep response punchy, clear, and highly convincing (2-4 short sentences or points).`;

      const userContent = `PREVIOUS CONTEXT:
${historyContext}

USER QUESTION / CHOICE:
"${message}"

Give friendly, highly convincing sales advice strictly in ${selectedLanguage}.`;

      let cleanText = "";
      try {
        const aiRes = await callGemini({ system: chatPrompt, content: userContent });
        if (aiRes.ok && aiRes.text) {
          cleanText = aiRes.text;
          try {
            const parsed = JSON.parse(cleanText);
            if (typeof parsed === "object" && parsed !== null) {
              const keys = Object.keys(parsed);
              if (parsed.response) {
                cleanText = parsed.response;
              } else if (Array.isArray(parsed[keys[0]])) {
                cleanText = parsed[keys[0]].map(item => `• **${item.feature || item.title || "Feature"}**: ${item.explanation || item.desc || item.detail || JSON.stringify(item)}`).join("\n\n");
              } else {
                cleanText = keys.map(k => `• **${k}**: ${JSON.stringify(parsed[k])}`).join("\n");
              }
            } else if (typeof parsed === "string") {
              cleanText = parsed;
            }
          } catch {}
        }
      } catch {}

      if (!cleanText) {
        cleanText = selectedLanguage === "Hindi"
          ? "यह फ़ोन आपके पैसों की पूरी कीमत वसूल कराएगा! इसमें ZYPHOR AI वेरीफाइड ट्रस्ट स्कोर, शानदार कैमरा और पावरफुल बैटरी है। इसे बिना झिझक अभी बाय (Buy) करें!"
          : selectedLanguage === "English"
          ? "This phone gives you unbeatable value for money! Verified by ZYPHOR AI with full escrow safety, OIS camera, and long-lasting battery. Go ahead and buy with full confidence!"
          : "Bhai yeh phone aapke paise vasool karwa dega! ZYPHOR AI verified trust score, solid OIS camera aur heavy battery hai. Bina tension abhi buy kar lo, best deal hai!";
      }

      return NextResponse.json({
        type: "chat",
        text: cleanText,
        recommendations: []
      });
    }

    // MODE 2: SMART RECOMMENDATION ENGINE (HONEST FRIEND + SALESMAN PITCH)
    const systemPrompt = `You are ZYPHOR's AI Advisor — an Honest Tech Friend + Sales Master.

STRICT PRICE RULE:
${maxBudget ? `User budget limit is strictly ₹${maxBudget.toLocaleString("en-IN")}. NEVER recommend any phone whose price is greater than ₹${maxBudget}. ALL recommendations MUST have price <= ${maxBudget}.` : "Recommend best matching phones within reasonable budget."}

TRAINING & SALES PERSONA:
1. Respond STRICTLY in selected language: "${selectedLanguage}".
2. Recommend TOP 3 matching items from catalog array based on user's choice/budget.
3. Write a CONVINCING, HIGH-CONVERTING sales pitch line (why this phone is a steal deal for them) in ${selectedLanguage}.
4. Output ONLY valid JSON array in this structure:
[
  {
    "id": "<id>",
    "brand": "<brand>",
    "model": "<model>",
    "price": <number>,
    "trustScore": <number>,
    "matchScore": 95,
    "whyItFits": "<1 highly convincing sales pitch line as a friend in ${selectedLanguage}>",
    "tradeoff": "<1 short honest tradeoff in ${selectedLanguage}>"
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
USER CHOICE/REQUEST: "${message}"`;

    let recs = [];
    try {
      const resultObj = await callGemini({ system: systemPrompt, content: userContent });
      if (resultObj.ok) {
        recs = parseModelJSON(resultObj.text);
      }
    } catch {}

    if (Array.isArray(recs) && maxBudget) {
      recs = recs.filter((item) => Number(item.price) <= maxBudget);
    }

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
          ? `Bhai! यह फ़ोन ₹${item.price.toLocaleString("en-IN")} में ज़बरदस्त वैल्यू देता है, अभी बाय करें!`
          : selectedLanguage === "English"
          ? `Best bang for your buck under ₹${(maxBudget || item.price).toLocaleString("en-IN")} — buy with full confidence!`
          : `Bhai ₹${item.price.toLocaleString("en-IN")} ke price me yeh ekdum steal deal hai, miss mat karo!`,
        tradeoff: selectedLanguage === "Hindi" ? "सीमित स्टॉक उपलब्ध।" : "Limited stock available."
      }));
    }

    return NextResponse.json({ type: "recommendation", recommendations: recs, catalog: fullCatalog.length > 0 ? fullCatalog : DEFAULT_CATALOG });
  } catch (err) {
    const defaultRecs = DEFAULT_CATALOG.slice(0, 3).map((item) => ({
      id: item.id,
      brand: item.brand,
      model: item.model,
      price: item.price,
      trustScore: item.trustScore || 90,
      matchScore: 90,
      whyItFits: "ZYPHOR AI verified high-value smartphone match for your requirements.",
      tradeoff: "Limited verified stock."
    }));
    return NextResponse.json({ type: "recommendation", recommendations: defaultRecs, catalog: DEFAULT_CATALOG });
  }
}
