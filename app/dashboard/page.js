import { redirect } from "next/navigation";
import Container from "@/components/shared/Container";
import RoleDashboardView from "@/components/shared/RoleDashboardView";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Order from "@/models/Order";
import RepairTicket from "@/models/RepairTicket";
import User from "@/models/User";
import Message from "@/models/Message";
import { getSessionUser } from "@/lib/auth";
import { generateUserTokenId } from "@/lib/token";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  await connectDB();

  // Find user details & assign User Token ID if not already saved
  const user = await User.findById(session.id);
  if (user && !user.userTokenId) {
    user.userTokenId = generateUserTokenId(user._id);
    await user.save();
  }

  const userTokenId = user?.userTokenId || generateUserTokenId(session.id);

  const [myListings, orders, repairTickets, messages] = await Promise.all([
    Listing.find({ seller: session.id }).sort({ createdAt: -1 }).limit(10).lean(),
    Order.find({ $or: [{ buyer: session.id }, { seller: session.id }] })
      .sort({ createdAt: -1 }).limit(10)
      .populate("listing", "title brand model price").lean(),
    RepairTicket.find(session.role === "technician" ? {} : { user: session.id }).sort({ createdAt: -1 }).limit(5).lean(),
    Message.find({ sender: session.id }).sort({ createdAt: -1 }).limit(5).lean()
  ]);

  const sanitizedListings = myListings.map((l) => ({ ...l, _id: l._id.toString() }));
  const sanitizedOrders = orders.map((o) => ({ ...o, _id: o._id.toString() }));
  const sanitizedTickets = repairTickets.map((t) => ({ ...t, _id: t._id.toString() }));
  const sanitizedMessages = messages.map((m) => ({ ...m, _id: m._id.toString() }));

  return (
    <section className="py-12 bg-paper min-h-screen">
      <Container>
        <RoleDashboardView
          session={{
            id: session.id,
            name: session.name,
            email: session.email,
            role: session.role,
            businessName: user?.businessName
          }}
          userTokenId={userTokenId}
          myListings={sanitizedListings}
          orders={sanitizedOrders}
          repairTickets={sanitizedTickets}
          messages={sanitizedMessages}
        />
      </Container>
    </section>
  );
}
