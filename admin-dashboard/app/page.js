import { 
  Users, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Wrench, 
  MessageSquare, 
  FileText, 
  ArrowUpRight, 
  UploadCloud, 
  KeyRound
} from "lucide-react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Order from "@/models/Order";
import Subscription from "@/models/Subscription";
import RepairTicket from "@/models/RepairTicket";
import Message from "@/models/Message";
import AuditLog from "@/models/AuditLog";
import LoginSession from "@/models/LoginSession";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  await connectDB();
  
  const [
    totalUsers,
    totalProducts,
    activeProducts,
    totalOrders,
    activeSubscriptions,
    totalRepairs,
    pendingRepairs,
    openTickets,
    activeSessions,
    recentProducts,
    recentLogs
  ] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Listing.countDocuments({ status: "active" }),
    Order.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    RepairTicket.countDocuments(),
    RepairTicket.countDocuments({ status: "pending" }),
    Message.countDocuments({ status: "open" }),
    LoginSession.countDocuments({ status: "ACTIVE" }),
    Listing.find().sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.find().sort({ createdAt: -1 }).limit(5).lean()
  ]);

  const stats = [
    { 
      label: "Live Active Products", 
      value: `${activeProducts} / ${totalProducts}`, 
      sub: "Active on Web & Mobile App", 
      icon: Package, 
      href: "/products" 
    },
    { 
      label: "Total Orders & Escrow", 
      value: totalOrders, 
      sub: "Processed marketplace transactions", 
      icon: ShoppingCart, 
      href: "/orders" 
    },
    { 
      label: "Registered Users", 
      value: totalUsers, 
      sub: "Retailers, Wholesalers & Buyers", 
      icon: Users, 
      href: "/users" 
    },
    { 
      label: "Active Subscriptions", 
      value: activeSubscriptions, 
      sub: "Pro & Enterprise seller plans", 
      icon: CreditCard, 
      href: "/subscriptions" 
    },
    { 
      label: "Doorstep Repairs", 
      value: `${pendingRepairs} Pending / ${totalRepairs}`, 
      sub: "Technician doorstep bookings", 
      icon: Wrench, 
      href: "/repairs" 
    },
    { 
      label: "Active Logins & Sessions", 
      value: `${activeSessions} Active`, 
      sub: "Role-segregated live authentication", 
      icon: KeyRound, 
      href: "/logins" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER WITH REALTIME STATUS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
            <span className="text-xs font-bold text-gray-900 tracking-wider uppercase">Live Master Synchronized</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight mt-1">Master Commerce Governance</h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Real-time commerce management, catalog verification, doorstep repairs, and multi-role marketplace control.
          </p>
        </div>

        {/* QUICK SHORTCUTS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <Link
            href="/products/upload"
            className="flex-1 sm:flex-none justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <UploadCloud size={16} className="text-gray-700" /> Bulk Import CSV
          </Link>
          <Link
            href="/products/add"
            className="flex-1 sm:flex-none justify-center bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Package size={16} /> + Add Product
          </Link>
          <Link
            href="/logins"
            className="w-full sm:w-auto justify-center bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <KeyRound size={16} className="text-gray-800" /> Login Governance
          </Link>
        </div>
      </div>
      
      {/* 6 STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-black hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gray-100 text-black border border-gray-200">
                  <Icon size={22} />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-black transition-colors">
                  <span>Manage</span>
                  <ArrowUpRight size={15} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">{stat.label}</p>
                <p className="text-2xl font-black text-black mt-0.5">{stat.value}</p>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">{stat.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* OPERATIONAL 2X2 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT CATALOG PRODUCTS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <Package size={18} className="text-gray-800" /> Live Catalog Listings
              </h3>
              <Link href="/products" className="text-xs font-bold text-gray-700 hover:text-black hover:underline">
                View All ({totalProducts}) &rarr;
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentProducts.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  <Package size={24} className="mx-auto mb-2 text-gray-300" />
                  No products currently in catalog (0 Products).
                </div>
              ) : (
                recentProducts.map((p) => (
                  <div key={p._id.toString()} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 relative">
                        {p.images && p.images[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No img</div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-black">{p.brand} {p.model}</p>
                        <p className="text-[11px] text-gray-500">{p.storage || p.partCategory || "Device"} • {p.city || "Pan India"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-black">₹{Number(p.price || 0).toLocaleString("en-IN")}</p>
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
            <Link href="/products/upload" className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              <UploadCloud size={14} /> Bulk Add More Products &rarr;
            </Link>
          </div>
        </div>

        {/* RECENT ROLE AUDIT LOGS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <FileText size={18} className="text-gray-800" /> Role-Based Audit Stream
              </h3>
              <Link href="/logs" className="text-xs font-bold text-gray-700 hover:text-black hover:underline">
                View Full Audit Logs &rarr;
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">No logs yet recorded.</div>
              ) : (
                recentLogs.map((l) => (
                  <div key={l._id.toString()} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                          {l.role}
                        </span>
                        <span className="text-xs font-bold text-black">{l.action}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 font-medium">{l.details || l.userName}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
            <Link href="/logs" className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              <FileText size={14} /> Filter by Role (Retailer, Tech, Admin) &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
