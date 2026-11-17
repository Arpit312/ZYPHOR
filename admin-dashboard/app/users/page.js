import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await connectDB();
  const rawUsers = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }).select("-passwordHash").lean();
  const users = rawUsers.map(u => ({
    ...u,
    _id: u._id.toString(),
    createdAt: u.createdAt ? u.createdAt.toISOString() : null,
    updatedAt: u.updatedAt ? u.updatedAt.toISOString() : null
  }));

  return <UsersClient initialUsers={users} />;
}
