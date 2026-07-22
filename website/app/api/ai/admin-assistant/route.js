import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Order from "@/models/Order";
import { getSessionUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { query } = await req.json();

    if (!query) return NextResponse.json({ error: "Query is required." }, { status: 400 });

    await connectDB();

    // Search users by Token ID, email, or name
    const foundUsers = await User.find({
      $or: [
        { userTokenId: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
        { role: { $regex: query, $options: "i" } }
      ]
    }).limit(5).select("-passwordHash").lean();

    const foundListings = await Listing.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { model: { $regex: query, $options: "i" } }
      ]
    }).limit(5).lean();

    const systemPrompt = `You are ZYPHOR's Admin Governance AI. 
Provide a clear, professional summary for the Admin regarding the matching users/listings found in the database for query: "${query}".

Highlight:
- User Token IDs & Roles
- Access Authorization Status
- Active Listings & Risk Assessment`;

    const userPrompt = `Found Users: ${JSON.stringify(foundUsers, null, 2)}
Found Listings: ${JSON.stringify(foundListings, null, 2)}`;

    const aiRes = await callGemini({ system: systemPrompt, content: userPrompt });

    return NextResponse.json({
      success: true,
      users: foundUsers,
      listings: foundListings,
      aiSummary: aiRes.text || "No AI summary available."
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
