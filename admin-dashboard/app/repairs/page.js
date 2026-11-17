import { connectDB } from "@/lib/db";
import RepairTicket from "@/models/RepairTicket";
import User from "@/models/User";
import RepairsClient from "./RepairsClient";

export const dynamic = "force-dynamic";

export default async function RepairsPage() {
  await connectDB();

  const [tickets, technicians] = await Promise.all([
    RepairTicket.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email phone")
      .populate("assignedTechnician", "name email phone businessName trustRating")
      .lean(),
    User.find({ role: "technician" })
      .select("name email phone trustRating city")
      .lean()
  ]);

  const serializedTickets = tickets.map(t => ({
    ...t,
    _id: t._id.toString(),
    user: t.user ? { ...t.user, _id: t.user._id.toString() } : null,
    assignedTechnician: t.assignedTechnician ? { ...t.assignedTechnician, _id: t.assignedTechnician._id.toString() } : null,
  }));

  const serializedTechnicians = technicians.map(tech => ({
    ...tech,
    _id: tech._id.toString()
  }));

  return <RepairsClient initialTickets={serializedTickets} initialTechnicians={serializedTechnicians} />;
}
