import { connectDB } from "@/lib/db";
import LoginSession from "@/models/LoginSession";
import LoginsClient from "./LoginsClient";

export const dynamic = "force-dynamic";

export default async function LoginsPage() {
  await connectDB();

  const [sessions, allSessions] = await Promise.all([
    LoginSession.find().sort({ loginAt: -1 }).limit(200).lean(),
    LoginSession.find().select("role status").lean()
  ]);

  const roleStats = {
    admin: allSessions.filter(s => s.role === "admin" && s.status === "ACTIVE").length,
    retailer: allSessions.filter(s => s.role === "retailer" && s.status === "ACTIVE").length,
    wholesaler: allSessions.filter(s => s.role === "wholesaler" && s.status === "ACTIVE").length,
    technician: allSessions.filter(s => s.role === "technician" && s.status === "ACTIVE").length,
    customer: allSessions.filter(s => s.role === "customer" && s.status === "ACTIVE").length,
    totalActive: allSessions.filter(s => s.status === "ACTIVE").length,
    totalRecorded: allSessions.length
  };

  const serializedSessions = sessions.map(s => ({
    ...s,
    _id: s._id.toString(),
    userId: s.userId ? s.userId.toString() : null,
    loginAt: s.loginAt ? s.loginAt.toISOString() : new Date().toISOString(),
    lastActiveAt: s.lastActiveAt ? s.lastActiveAt.toISOString() : new Date().toISOString(),
    createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString()
  }));

  return <LoginsClient initialSessions={serializedSessions} initialRoleStats={roleStats} />;
}
