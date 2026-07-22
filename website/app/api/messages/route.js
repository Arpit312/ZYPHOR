import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { getSessionUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    let query = {};
    if (session.role === "admin") {
      query = {}; // Admin sees all messages
    } else {
      query = { $or: [{ sender: session.id }, { receiver: session.id }] };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .populate("sender", "name email role userTokenId")
      .lean();

    return NextResponse.json({ success: true, messages });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, subject, category, receiverId } = await req.json();

    if (!content) return NextResponse.json({ error: "Content is required." }, { status: 400 });

    await connectDB();

    const msg = await Message.create({
      sender: session.id,
      receiver: receiverId || null,
      senderRole: session.role,
      subject: subject || "Dashboard Query",
      content,
      category: category || "general"
    });

    return NextResponse.json({ success: true, message: msg });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
