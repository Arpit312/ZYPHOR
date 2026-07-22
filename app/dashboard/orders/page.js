import { redirect } from "next/navigation";
import Link from "next/link";
import Container from "@/components/shared/Container";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getSessionUser } from "@/lib/auth";
import { Lock, Package } from "lucide-react";

async function getOrders(userId) {
  await connectDB();
  return Order.find({ $or: [{ buyer: userId }, { seller: userId }] })
    .sort({ createdAt: -1 })
    .populate("listing", "title brand model price images conditionGrade")
    .populate("buyer", "name city")
    .populate("seller", "name businessName city")
    .lean();
}

const STATUS_COLORS = {
  placed: "bg-signal-amber/10 text-signal-amber",
  confirmed: "bg-signal-amber/10 text-signal-amber",
  shipped: "bg-blue-100 text-blue-600",
  delivered: "bg-signal-green/10 text-signal-green",
  cancelled: "bg-signal-red/10 text-signal-red",
  disputed: "bg-signal-red/10 text-signal-red"
};

export const metadata = { title: "Orders — ZYPHOR Dashboard" };

export default async function DashboardOrdersPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const orders = await getOrders(session.id);

  return (
    <section className="py-12">
      <Container>
        <div className="mb-8">
          <p className="text-xs font-mono text-black/40 uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="font-display font-700 text-2xl text-slate-850">Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-black/[0.06]">
            <Package className="h-10 w-10 mx-auto mb-4 text-black/20" />
            <h3 className="font-display font-600 text-xl text-slate-850 mb-2">No orders yet</h3>
            <p className="text-black/50 mb-6">When you buy or sell a device, your orders will appear here.</p>
            <Link href="/marketplace" className="text-sm font-medium text-coral hover:underline">
              Browse marketplace →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const l = o.listing;
              const img = l?.images?.[0] || "/placeholder-device.svg";
              const isBuyer = o.buyer?._id?.toString() === session.id;
              return (
                <div key={o._id.toString()} className="bg-white border border-black/[0.06] rounded-xl p-5 flex flex-col sm:flex-row gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={l?.model} className="h-20 w-20 object-cover rounded-lg bg-paper flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 justify-between">
                      <div>
                        <p className="font-display font-600 text-slate-850">{l?.title || `${l?.brand} ${l?.model}`}</p>
                        <p className="text-xs text-black/40 font-mono mt-0.5">{isBuyer ? `Seller: ${o.seller?.businessName || o.seller?.name}` : `Buyer: ${o.buyer?.name}`}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-700 text-lg text-slate-850">₹{Number(o.amount).toLocaleString("en-IN")}</p>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.orderStatus] || ""}`}>
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-black/50">
                        <Lock className="h-3.5 w-3.5" />
                        Escrow: <span className={`font-mono font-medium ${o.escrowStatus === "held" ? "text-signal-amber" : o.escrowStatus === "released" ? "text-signal-green" : "text-signal-red"}`}>{o.escrowStatus}</span>
                      </div>
                      <span className="text-xs text-black/30 font-mono">
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      {l?._id && (
                        <Link href={`/marketplace/${l._id}`} className="text-xs text-coral hover:underline font-medium">
                          View listing
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
