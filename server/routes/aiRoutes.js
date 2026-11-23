const router = require("express").Router();
const auth = require("../middleware/auth");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { SUBSCRIPTION_PLANS } = require("../services/billing");

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const FREE_AI_CALLS = 5;

function luhn(imei) {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(imei[i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

// Quota: free users get 5 AI calls/month; merchants get their plan's aiCallsPerMonth.
// Returns { ok:true } and consumes one call, or { ok:false, status, error }.
async function consumeAiCall(userId) {
  const month = new Date().toISOString().slice(0, 7); // "2026-11"
  const user = await User.findById(userId).lean();
  if (!user) return { ok: false, status: 404, error: "User not found." };
  let limit = FREE_AI_CALLS;
  if (["retailer", "wholesaler", "technician"].includes(user.role) && user.subscription?.status === "active") {
    const sub = await Subscription.findOne({ user: userId, status: "active" }).lean();
    limit = sub?.planDetails?.aiCallsPerMonth ?? SUBSCRIPTION_PLANS[user.subscription.plan]?.aiCallsPerMonth ?? FREE_AI_CALLS;
  }
  const used = user.aiCallsMonth === month ? (user.aiCallsUsed || 0) : 0;
  if (used >= limit)
    return { ok: false, status: 429, error: `Monthly AI limit reached (${limit} calls on your plan). Upgrade for more.`, limitReached: true };
  // Pipeline update handles month rollover atomically (reads pre-update values)
  await User.updateOne({ _id: userId }, [
    { $set: {
        aiCallsMonth: month,
        aiCallsUsed: { $cond: [{ $eq: ["$aiCallsMonth", month] }, { $add: ["$aiCallsUsed", 1] }, 1] },
    } },
  ]);
  return { ok: true, remaining: limit - used - 1 };
}

async function gemini(apiKey, payload) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

const parseJson = (text) => JSON.parse(text.replace(/```json|```/gi, "").trim());

// POST /api/ai/advisor — grounded chat over the live catalog
router.post("/advisor", auth, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || !String(message).trim()) return res.status(400).json({ error: "Message required." });
    const quota = await consumeAiCall(req.user.id);
    if (!quota.ok) return res.status(quota.status).json({ error: quota.error, limitReached: quota.limitReached });

    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(503).json({ error: "AI service is not configured on the server (GEMINI_API_KEY missing)." });

    const listings = await Listing.find({ status: "active" })
      .select("brand model price conditionGrade city verification.trustScore listingType")
      .limit(60).lean();
    const listingText = listings
      .map((l) => `${l.brand} ${l.model} - ₹${l.price} (${l.conditionGrade}, Trust: ${l.verification?.trustScore || 0}%, ${l.city || "Pan-India"})`)
      .join("\n");

    const reply = await gemini(apiKey, {
      contents: [{ role: "user", parts: [{ text: String(message).slice(0, 2000) }] }],
      systemInstruction: { parts: [{ text: `You are ZYPHOR's AI Advisor for buying/selling verified smartphones in India.
Current live listings:\n${listingText || "(none right now)"}\n
Help users find the best deals, understand pricing, condition grades and escrow protection. Be concise and friendly. Answer in plain text.` }] },
    });
    res.json({ reply: reply || "Sorry, I couldn't process that.", remaining: quota.remaining });
  } catch (err) {
    res.status(502).json({ error: `AI advisor unavailable: ${err.message}` });
  }
});

// POST /api/ai/pricing — resale valuation
router.post("/pricing", auth, async (req, res) => {
  try {
    const { brand, model, storage, ram, condition, batteryHealth, city } = req.body || {};
    if (!brand || !model) return res.status(400).json({ error: "Brand and model required." });
    const quota = await consumeAiCall(req.user.id);
    if (!quota.ok) return res.status(quota.status).json({ error: quota.error, limitReached: quota.limitReached });

    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(503).json({ error: "AI service is not configured on the server (GEMINI_API_KEY missing)." });

    const text = await gemini(apiKey, {
      contents: [{ role: "user", parts: [{ text: `Give the resale price for a ${brand} ${model}, storage ${storage || "unknown"}, RAM ${ram || "unknown"}, condition: ${condition || "Good"}, battery health: ${batteryHealth || 85}%, city: ${city || "India"}.
Respond ONLY with JSON: {"minPrice":number,"maxPrice":number,"recommendedPrice":number,"quickSalePrice":number,"marketTrend":"rising|stable|falling","demandLevel":"low|medium|high","factors":[string],"tip":string}` }] }],
    });
    res.json({ ...parseJson(text), remaining: quota.remaining });
  } catch (err) {
    res.status(502).json({ error: err instanceof SyntaxError ? "AI returned an unreadable response. Try again." : `AI pricing unavailable: ${err.message}` });
  }
});

// POST /api/ai/verify-imei — AI-assisted IMEI analysis; honest local Luhn fallback when no key
router.post("/verify-imei", auth, async (req, res) => {
  try {
    const { imei } = req.body || {};
    const clean = String(imei || "").replace(/\D/g, "");
    if (clean.length !== 15) return res.status(400).json({ error: "IMEI must be exactly 15 digits." });

    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // No key: do the real local Luhn check and say exactly what was checked — no fake AI claims
      const valid = luhn(clean);
      return res.json({
        valid,
        message: valid
          ? "IMEI passes the Luhn checksum (local check). Live CEIR blacklist screening needs the government API — see server setup notes."
          : "IMEI failed the Luhn checksum — this number is invalid.",
        ceirStatus: valid ? "Not screened (offline mode)" : "Invalid",
        localOnly: true,
      });
    }

    const quota = await consumeAiCall(req.user.id);
    if (!quota.ok) return res.status(quota.status).json({ error: quota.error, limitReached: quota.limitReached });

    const text = await gemini(apiKey, {
      contents: [{ role: "user", parts: [{ text: `Analyze IMEI ${clean}. Respond ONLY with JSON: {"valid":boolean,"message":string,"ceirStatus":"white|grey|black|unknown"}. First verify the Luhn checksum yourself; if it fails, valid must be false.` }] }],
      systemInstruction: { parts: [{ text: "You are ZYPHOR's IMEI verification agent. Only output valid JSON without formatting blocks." }] },
    });
    res.json({ ...parseJson(text), remaining: quota.remaining });
  } catch (err) {
    res.status(502).json({ error: err instanceof SyntaxError ? "AI returned an unreadable response. Try again." : `IMEI verification unavailable: ${err.message}` });
  }
});

module.exports = router;
