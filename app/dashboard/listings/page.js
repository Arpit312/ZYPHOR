import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Eye, Trash2 } from "lucide-react";
import Container from "@/components/shared/Container";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { getSessionUser } from "@/lib/auth";
import TrustBadge from "@/components/shared/TrustBadge";

async function getMyListings(userId) {
  await connectDB();
  return Listing.find({ seller: userId }).sort({ createdAt: -1 }).lean();
}

export const metadata = { title: "My Listings — ZYPHOR Dashboard" };

export default async function DashboardListingsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const listings = await getMyListings(session.id);

  return (
    <section className="py-12">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-mono text-black/40 uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="font-display font-700 text-2xl text-slate-850">My listings</h1>
          </div>
          <Link href="/sell"
            className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-display font-600 px-4 py-2.5 rounded-xl text-sm transition-colors focus-ring">
            <Plus className="h-4 w-4" />
            New listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-black/[0.06]">
            <p className="text-4xl mb-4">📦</p>
            <h3 className="font-display font-600 text-xl text-slate-850 mb-2">No listings yet</h3>
            <p className="text-black/50 mb-6">Create your first listing and let AI verify it in seconds.</p>
            <Link href="/sell" className="inline-flex items-center gap-2 bg-coral text-white font-display font-600 px-5 py-3 rounded-xl text-sm">
              <Plus className="h-4 w-4" /> Create listing
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-black/[0.06] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black/[0.06] bg-paper">
                  <tr>
                    {["Device", "Price", "Condition", "Trust Score", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-mono uppercase tracking-wide text-black/40 px-5 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {listings.map((l) => (
                    <tr key={l._id.toString()} className="hover:bg-paper/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-sm text-slate-850 max-w-[200px] truncate">
                          {l.title || `${l.brand} ${l.model}`}
                        </p>
                        <p className="text-xs text-black/40 font-mono mt-0.5">{l.brand} · {l.category}</p>
                      </td>
                      <td className="px-5 py-4 font-display font-600 text-sm whitespace-nowrap">
                        ₹{Number(l.price).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4 text-sm text-black/65">{l.conditionGrade}</td>
                      <td className="px-5 py-4">
                        <TrustBadge
                          score={l.verification?.trustScore || 0}
                          status={l.verification?.status || "not_verified"}
                          size={38}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full capitalize ${
                          l.status === "active" ? "bg-signal-green/10 text-signal-green"
                          : l.status === "sold" ? "bg-black/[0.06] text-black/50"
                          : "bg-signal-red/10 text-signal-red"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/marketplace/${l._id}`}
                            className="p-1.5 text-black/40 hover:text-black rounded-lg hover:bg-black/[0.05] focus-ring">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
