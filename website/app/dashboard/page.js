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

export const metadata = { title: "Dashboard — ZYPHOR" };

function safeStr(val) {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (val?.toString) return val.toString();
  return String(val);
}

function serializeDoc(doc) {
  if (!doc) return null;
  const obj = { ...doc };
  // Convert all ObjectId / Date fields
  for (const key of Object.keys(obj)) {
    if (obj[key]?._bsontype === "ObjectID" || obj[key]?._bsontype === "ObjectId") {
      obj[key] = obj[key].toString();
    } else if (obj[key] instanceof Date) {
      obj[key] = obj[key].toISOString();
    } else if (obj[key] && typeof obj[key] === "object" && obj[key]._id) {
      obj[key] = serializeDoc(obj[key]);
    }
  }
  if (obj._id) obj._id = safeStr(obj._id);
  return obj;
}

export default async function DashboardPage() {
  // 1. Auth check
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/dashboard");

  try {
    await connectDB();

    // 2. Find full user record and auto-assign Token ID
    const user = await User.findById(session.id).lean();
    if (!user) redirect("/login?next=/dashboard");

    // Assign token ID if not present
    if (!user.userTokenId) {
      await User.findByIdAndUpdate(session.id, {
        userTokenId: generateUserTokenId(session.id)
      });
      user.userTokenId = generateUserTokenId(session.id);
    }

    const userTokenId = user.userTokenId || generateUserTokenId(session.id);

    // 3. Fetch all dashboard data in parallel with safe fallbacks
    const isAdmin = session.role === "admin";
    const isTechnician = session.role === "technician";

    const [myListings, orders, repairTickets, messages] = await Promise.all([
      Listing.find({ seller: session.id })
        .sort({ createdAt: -1 }).limit(10).lean()
        .catch(() => []),

      Order.find({ $or: [{ buyer: session.id }, { seller: session.id }] })
        .sort({ createdAt: -1 }).limit(10)
        .populate("listing", "title brand model price images")
        .lean()
        .catch(() => []),

      RepairTicket.find(isTechnician || isAdmin ? {} : { user: session.id })
        .sort({ createdAt: -1 }).limit(5).lean()
        .catch(() => []),

      Message.find({ sender: session.id })
        .sort({ createdAt: -1 }).limit(5).lean()
        .catch(() => []),
    ]);

    // 4. Safe serialization — no unserializable ObjectIds to client
    const sanitizedListings = myListings.map(serializeDoc);
    const sanitizedOrders = orders.map(serializeDoc);
    const sanitizedTickets = repairTickets.map(serializeDoc);
    const sanitizedMessages = messages.map(serializeDoc);

    return (
      <section className="py-12 bg-paper min-h-screen">
        <Container>
          <RoleDashboardView
            session={{
              id: session.id,
              name: session.name,
              email: session.email,
              role: session.role,
              businessName: user?.businessName || null,
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
  } catch (err) {
    console.error("[Dashboard Error]", err);
    // Graceful degradation — show dashboard with empty data
    return (
      <section className="py-12 bg-paper min-h-screen">
        <Container>
          <RoleDashboardView
            session={{
              id: session.id,
              name: session.name,
              email: session.email,
              role: session.role,
              businessName: null,
            }}
            userTokenId={generateUserTokenId(session.id)}
            myListings={[]}
            orders={[]}
            repairTickets={[]}
            messages={[]}
          />
        </Container>
      </section>
    );
  }
}
