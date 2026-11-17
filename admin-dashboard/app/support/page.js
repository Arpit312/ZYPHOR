import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import SupportClient from "./SupportClient";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  await connectDB();

  const tickets = await Message.find()
    .sort({ createdAt: -1 })
    .populate("sender", "name email role businessName phone")
    .lean();

  const serializedTickets = tickets.map(t => ({
    ...t,
    _id: t._id.toString(),
    sender: t.sender ? {
      ...t.sender,
      _id: t.sender._id.toString()
    } : null
  }));

  return <SupportClient initialTickets={serializedTickets} />;
}
