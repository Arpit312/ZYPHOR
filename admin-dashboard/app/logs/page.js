import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import LogsClient from "./LogsClient";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  await connectDB();

  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const allLogs = await AuditLog.find().select("role").lean();
  const roleStats = {
    admin: allLogs.filter(l => l.role === "admin").length,
    retailer: allLogs.filter(l => l.role === "retailer").length,
    wholesaler: allLogs.filter(l => l.role === "wholesaler").length,
    technician: allLogs.filter(l => l.role === "technician").length,
    customer: allLogs.filter(l => l.role === "customer").length,
  };

  const serializedLogs = logs.map(l => ({
    ...l,
    _id: l._id.toString(),
    userId: l.userId ? l.userId.toString() : null,
    createdAt: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString()
  }));

  return <LogsClient initialLogs={serializedLogs} initialRoleStats={roleStats} />;
}
