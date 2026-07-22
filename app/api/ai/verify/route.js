import { NextResponse } from "next/server";
import { callGemini, parseModelJSON } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { getSessionUser } from "@/lib/auth";
import { isValidImeiFormat } from "@/lib/tac-data";

const SYSTEM = `You are ZYPHOR's AI Verification Agent.
Your job: analyze a phone listing's submitted evidence and compute a Trust Score (0–100).

You will receive:
- Seller's self-reported condition claim
- IMEI validity check result
- Battery health % (from screenshot OCR — provided as a number or null)
- Reported physical condition grade: Superb / Good / Fair
- Number of photos submitted (0–5)
- Number of functional test videos submitted (0–3)
- Asking price vs estimated fair market value (FMV) for that model

Scoring breakdown (total 100 points):
1. physicalCondition (0–25): Grade Superb=22, Good=16, Fair=9. Deduct up to 8 points if seller claim seems inconsistent with grade or evidence is thin.
2. functionalCondition (0–25): Battery health 90–100%=25, 80–89%=20, 70–79%=14, 60–69%=8, unknown=12. Deduct if no functional video evidence.
3. documentAuthenticity (0–20): Valid 15-digit IMEI=10pts + format check pass=5pts + CEIR status (White=5, Grey=2, Black=-20, Unknown=2).
4. sellerReliability (0–15): Estimate from how complete and consistent the submission is. Full photos+videos+IMEI=15, partial=8, minimal=3.
5. priceFairness (0–15): Price within 10% of FMV=15, within 20%=11, within 35%=7, more than 35% below FMV (scam risk)=2.

Final decision:
- score >= 80: status="verified"
- score 50–79: status="needs_review"
- score < 50 OR CEIR="black": status="failed"

If IMEI CEIR status is "black" — set status="failed" regardless of score, and add flag "IMEI_BLACKLISTED".

Output ONLY valid JSON:
{
  "trustScore": <0-100>,
  "status": "verified" | "needs_review" | "failed",
  "components": {
    "physicalCondition": <0-25>,
    "functionalCondition": <0-25>,
    "documentAuthenticity": <0-20>,
    "sellerReliability": <0-15>,
    "priceFairness": <0-15>
  },
  "aiSummary": "<2-3 sentence plain English summary of the verification findings>",
  "flags": ["<flag1>", "<flag2>"]
}`;

// Rough fair market values for popular models (₹) — real production system uses live price APIs
const FMV_MAP = {
  "iphone 15": 52000,
  "iphone 14": 40000,
  "iphone 13": 32000,
  "iphone 12": 24000,
  "samsung galaxy s24": 55000,
  "samsung galaxy s23": 38000,
  "redmi note 13": 14000,
  "redmi note 12": 11000,
  "oneplus 12": 48000,
  "poco x6": 16000
};

function estimateFMV(brand, model) {
  const key = `${brand} ${model}`.toLowerCase();
  for (const [k, v] of Object.entries(FMV_MAP)) {
    if (key.includes(k)) return v;
  }
  return null;
}

export async function POST(req) {
  try {
    const session = getSessionUser();
    if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const body = await req.json();
    const {
      listingId,
      conditionClaim,
      conditionGrade,
      imei,
      batteryHealth,
      photoCount,
      videoCount,
      price,
      brand,
      model,
      ceir
    } = body;

    // IMEI validation
    const imeiValid = imei ? isValidImeiFormat(imei) : false;
    const ceирStatus = ceir || "unknown"; // caller passes known CEIR status or "unknown"

    const fmv = estimateFMV(brand || "", model || "");
    const priceVsFmv = fmv ? `₹${price} vs FMV ₹${fmv} (${Math.round((price / fmv) * 100)}% of FMV)` : "FMV unknown";

    const prompt = `
Verify this phone listing:

Brand: ${brand}
Model: ${model}
Seller's condition claim: "${conditionClaim || "No claim provided"}"
Reported grade: ${conditionGrade || "Good"}
IMEI provided: ${imei || "not provided"}
IMEI format valid (Luhn check): ${imeiValid}
CEIR/Blacklist status: ${ceірStatus}
Battery health from screenshot: ${batteryHealth ? batteryHealth + "%" : "not provided"}
Photos submitted: ${photoCount || 0}
Functional test videos: ${videoCount || 0}
Asking price: ₹${price || 0} | ${priceVsFmv}

Compute the Trust Score and return the result JSON.`;

    const result = await callGemini({ system: SYSTEM, content: prompt });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const verification = parseModelJSON(result.text);
    if (!verification) {
      return NextResponse.json({ error: "AI returned unparseable response." }, { status: 500 });
    }

    // Persist verification result onto the listing
    if (listingId) {
      await connectDB();
      await Listing.findByIdAndUpdate(listingId, { verification });
    }

    return NextResponse.json({ verification });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Verification failed." }, { status: 500 });
  }
}
