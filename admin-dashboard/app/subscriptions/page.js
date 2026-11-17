import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import SubscriptionsClient from "./SubscriptionsClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  await connectDB();

  const [subscriptions, users] = await Promise.all([
    Subscription.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email phone role businessName subscription")
      .lean(),
    User.find({ role: { $in: ["retailer", "wholesaler", "technician", "customer"] } })
      .select("name email role businessName subscription")
      .lean()
  ]);

  const serializedSubs = subscriptions.map(s => ({
    ...s,
    _id: s._id.toString(),
    user: s.user ? {
      ...s.user,
      _id: s.user._id.toString()
    } : null
  }));

  const serializedUsers = users.map(u => ({
    ...u,
    _id: u._id.toString()
  }));

  return <SubscriptionsClient initialSubscriptions={serializedSubs} users={serializedUsers} />;
}
