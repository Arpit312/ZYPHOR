import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Link from "next/link";
import { Truck, ShieldCheck, ExternalLink, Package } from "lucide-react";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getSessionUser } from "@/lib/auth";

async function getUserOrders(userId) {
  if (!userId) return [];
  try {
    await connectDB();
    const orders = await Order.find({ buyer: userId })
      .sort({ createdAt: -1 })
      .populate("listing", "title brand model price conditionGrade")
      .lean();
    return orders.map((o) => ({
      id: o.bill?.billNumber || `ZYP-${o._id.toString().slice(-6)}`,
      date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      item: o.listing ? `${o.listing.brand} ${o.listing.model}` : "Verified Smartphone",
      type: "Buy",
      status: o.orderStatus ? o.orderStatus.toUpperCase() : "IN TRANSIT",
      price: `₹${(o.amount || 0).toLocaleString("en-IN")}`,
      trustScore: 92
    }));
  } catch (e) {
    return [];
  }
}

export default async function OrdersPage() {
  const session = await getSessionUser();
  const dbOrders = await getUserOrders(session?.id);

  const demoOrders = [
    {
      id: "ZYP-89210",
      date: "22 July 2026",
      item: "Apple iPhone 13 (128GB - Midnight)",
      type: "Buy",
      status: "IN TRANSIT",
      price: "₹45,000",
      trustScore: 92
    },
    {
      id: "ZYP-77192",
      date: "15 June 2026",
      item: "OnePlus 11R 5G (Sell Order)",
      type: "Sell",
      status: "COMPLETED",
      price: "₹24,500",
      trustScore: 88
    }
  ];

  const orders = dbOrders.length > 0 ? dbOrders : demoOrders;

  return (
    <div className="py-12 bg-paper min-h-screen">
      <Container>
        <SectionHeading
          title="My Orders & Transactions"
          eyebrow="Account History"
          subtitle="Track your device purchases, doorstep sales, and repair tickets in real-time."
          className="mb-10"
        />

        <div className="max-w-4xl mx-auto space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-black/50 font-semibold">{o.id}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    o.type === "Buy" ? "bg-coral/10 text-coral" : "bg-signal-green/10 text-signal-green"
                  }`}>
                    {o.type} Order
                  </span>
                  <span className="text-xs text-black/40">• {o.date}</span>
                </div>

                <h3 className="font-display font-600 text-lg text-slate-850">{o.item}</h3>
                
                <div className="flex items-center gap-3 text-xs text-black/55">
                  <span className="flex items-center gap-1 text-signal-green font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> Trust Score: {o.trustScore}/100
                  </span>
                  <span>|</span>
                  <span className="font-semibold text-slate-850">{o.price}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-black/5">
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <Truck className="h-3.5 w-3.5 text-amber-600" /> {o.status}
                  </span>
                </div>
                <Link 
                  href={`/dashboard/orders`}
                  className="px-4 py-2 border border-black/10 hover:border-black/30 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 focus-ring"
                >
                  Track <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
