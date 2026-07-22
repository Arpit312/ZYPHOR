import { redirect } from "next/navigation";
import Container from "@/components/shared/Container";
import AdminPortalClient from "@/components/shared/AdminPortalClient";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Order from "@/models/Order";
import Message from "@/models/Message";
import { getSessionUser } from "@/lib/auth";

export const metadata = { title: "Master Governance Control Portal — ZYPHOR Admin" };

export default async function MasterAdminPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login?redirect=/admin");
  }

  await connectDB();

  const [users, listings, orders, messages] = await Promise.all([
    User.find().sort({ createdAt: -1 }).select("-passwordHash").lean(),
    Listing.find().sort({ createdAt: -1 }).populate("seller", "name userTokenId").lean(),
    Order.find().sort({ createdAt: -1 }).populate("buyer seller", "name userTokenId").lean(),
    Message.find({ isRead: false }).sort({ createdAt: -1 }).populate("sender", "name userTokenId role").lean()
  ]);

  const sanitizedUsers = users.map(u => ({ ...u, _id: u._id.toString() }));
  const sanitizedListings = listings.map(l => ({ ...l, _id: l._id.toString() }));
  const sanitizedOrders = orders.map(o => ({ ...o, _id: o._id.toString() }));
  const sanitizedMessages = messages.map(m => ({ ...m, _id: m._id.toString() }));

  return (
    <div className="py-10 bg-slate-900 min-h-screen text-white">
      <Container>
        <AdminPortalClient
          adminUser={{ name: session.name, email: session.email }}
          initialUsers={sanitizedUsers}
          initialListings={sanitizedListings}
          initialOrders={sanitizedOrders}
          initialMessages={sanitizedMessages}
        />
      </Container>
    </div>
  );
}
