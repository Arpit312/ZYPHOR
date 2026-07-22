"use client";
import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Package, Sparkles, Plus, Eye, Wrench, Store, Warehouse, MessageSquare, Copy, Check, AlertTriangle, Send } from "lucide-react";
import AISmartListerModal from "@/components/shared/AISmartListerModal";
import AIAgreementModal from "@/components/shared/AIAgreementModal";

export default function RoleDashboardView({ session, userTokenId, myListings, orders, repairTickets, messages }) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [showAiLister, setShowAiLister] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgContent, setMsgContent] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [editShop, setEditShop] = useState(false);
  const [shopName, setShopName] = useState(session.businessName || "");

  const role = session.role || "customer";

  function copyToken() {
    navigator.clipboard.writeText(userTokenId);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!msgContent) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msgContent, subject: `${role.toUpperCase()} Query` })
      });
      const data = await res.json();
      if (data.success) {
        setMsgSent(true);
        setMsgContent("");
        setTimeout(() => { setMsgSent(false); setShowMsgModal(false); }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">
      {/* Unique Identity Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/[0.06] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono text-coral uppercase tracking-widest bg-coral/10 px-3 py-1 rounded-full font-bold">
              {role.toUpperCase()} DASHBOARD
            </span>
            <div className="flex items-center gap-1.5 bg-slate-850 text-white font-mono text-xs font-bold px-3 py-1 rounded-full border border-black/10">
              <span>Token ID:</span>
              <span className="text-signal-green">{userTokenId}</span>
              <button onClick={copyToken} className="hover:text-coral transition-colors ml-1">
                {copiedToken ? <Check className="h-3.5 w-3.5 text-signal-green" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <h1 className="font-display font-700 text-2xl sm:text-3xl text-slate-850">
            Welcome back, {(session.name || session.email?.split("@")[0] || "User").split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-black/50 mt-1">
            Identity Token Address verified • Platform Access Active
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Selling Option with AI Agreement & Auto Lister */}
          <button
            onClick={() => setShowAgreement(true)}
            className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-display font-600 px-5 py-3 rounded-xl text-sm transition-all focus-ring shadow-lg shadow-coral/20"
          >
            <Sparkles className="h-4 w-4" />
            Sell with AI Assistant
          </button>

          <Link
            href="/sell"
            className="inline-flex items-center gap-2 bg-paper hover:bg-black/5 text-slate-850 border border-black/10 font-display font-600 px-4 py-3 rounded-xl text-sm transition-all"
          >
            <Plus className="h-4 w-4" /> Manual Listing
          </Link>

          <button
            onClick={() => setShowMsgModal(true)}
            className="inline-flex items-center gap-2 bg-ink text-white font-display font-600 px-4 py-3 rounded-xl text-sm transition-all hover:bg-ink-900"
          >
            <MessageSquare className="h-4 w-4" /> Message Admin
          </button>
        </div>
      </div>

      {/* Role Specific Sections */}
      {role === "technician" && (
        <div className="bg-purple-50/50 border border-purple-200/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-700 text-lg text-slate-850 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-600" /> Assigned Repair Schedule &amp; Issue Tickets
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-2">
              <span className="text-xs font-mono text-purple-600 font-bold uppercase">Pending Repair Job</span>
              <h4 className="font-semibold text-slate-850 text-sm">Apple iPhone 13 — Screen Replacement</h4>
              <p className="text-xs text-black/50">Date &amp; Time: 24 July 2026 at 02:30 PM • Pincode: 400001</p>
              <span className="inline-block text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-semibold">Assigned</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-2">
              <span className="text-xs font-mono text-purple-600 font-bold uppercase">Admin / Customer Issue Query</span>
              <h4 className="font-semibold text-slate-850 text-sm">Samsung S22 — Battery Health Audit</h4>
              <p className="text-xs text-black/50">Status: Inspection Report Submitted ✓</p>
              <span className="inline-block text-[11px] bg-signal-green/10 text-signal-green px-2 py-0.5 rounded font-semibold">Resolved</span>
            </div>
          </div>
        </div>
      )}

      {(role === "retailer" || role === "wholesaler") && (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-700 text-lg text-slate-850 flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" /> Business &amp; Shop Details
            </h3>
            <button
              onClick={() => setEditShop(!editShop)}
              className="text-xs font-semibold text-coral hover:underline"
            >
              {editShop ? "Save Shop Details" : "Edit Shop Info"}
            </button>
          </div>
          {editShop ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter Shop / Business Name"
                className="border border-black/10 rounded-xl px-4 py-2 text-sm flex-1"
              />
              <button onClick={() => setEditShop(false)} className="bg-coral text-white px-4 py-2 rounded-xl text-xs font-semibold">Save</button>
            </div>
          ) : (
            <p className="text-sm text-black/60">
              Shop Name: <strong className="text-slate-850">{shopName || session.name || "Mobile Store"}</strong> • Identity Token: <span className="font-mono text-xs font-semibold text-coral">{userTokenId}</span>
            </p>
          )}
        </div>
      )}

      {/* Main Grid: Listings & Orders */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Listings Section */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-600 text-base text-slate-850">
              {role === "wholesaler" ? "Bulk Lots & Listed Items" : "My Listed Products & Parts"}
            </h2>
            <Link href="/dashboard/listings" className="text-xs text-coral hover:underline font-medium">View all</Link>
          </div>

          {myListings.length === 0 ? (
            <div className="text-center py-10 text-black/40 space-y-3">
              <Package className="h-10 w-10 mx-auto opacity-30 text-coral" />
              <p className="text-sm">No items listed yet.</p>
              <button
                onClick={() => setShowAiLister(true)}
                className="inline-flex items-center gap-1.5 bg-coral text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                <Sparkles className="h-3.5 w-3.5" /> List with AI Assistant
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map((l) => (
                <div key={l._id.toString()} className="flex items-center gap-3 py-3 border-b border-black/[0.05] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-850 truncate">{l.title || `${l.brand} ${l.model}`}</p>
                    <p className="text-xs text-black/40 font-mono">₹{Number(l.price).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-signal-green/10 text-signal-green">
                      {l.status || "Active"}
                    </span>
                    <Link href={`/marketplace/${l._id}`} className="text-black/30 hover:text-coral transition-colors p-1">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-600 text-base text-slate-850">Recent Orders &amp; Sales</h2>
            <Link href="/dashboard/orders" className="text-xs text-coral hover:underline font-medium">View all</Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-black/40">
              <Package className="h-10 w-10 mx-auto opacity-30 text-signal-green mb-2" />
              <p className="text-sm">No recent transactions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o._id.toString()} className="flex items-center gap-3 py-3 border-b border-black/[0.05] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-850 truncate">
                      {o.listing?.title || `${o.listing?.brand} ${o.listing?.model}` || "Order"}
                    </p>
                    <p className="text-xs text-black/40 font-mono">₹{Number(o.amount).toLocaleString("en-IN")}</p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-signal-green/10 text-signal-green capitalize">
                    {o.orderStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* AI Agreement Modal before AI Lister */}
      <AIAgreementModal
        isOpen={showAgreement}
        userDetails={{ name: session.name, email: session.email, role }}
        onAccept={() => {
          setShowAgreement(false);
          setShowAiLister(true);
        }}
        onCancel={() => setShowAgreement(false)}
      />

      {/* AI Smart Lister Modal */}
      <AISmartListerModal
        isOpen={showAiLister}
        onClose={() => setShowAiLister(false)}
        userRole={role}
      />

      {/* Message Admin Modal */}
      {showMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-display font-700 text-lg text-slate-850 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-coral" /> Direct Message to Master Admin
            </h3>
            <p className="text-xs text-black/55">Send an issue query, payout request, or access query directly to the platform owner.</p>
            {msgSent ? (
              <div className="p-4 bg-signal-green/10 text-signal-green rounded-xl text-xs font-semibold text-center">
                ✓ Message sent successfully to Master Admin!
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  required
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Describe your issue or query..."
                  rows={4}
                  className="w-full border border-black/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowMsgModal(false)} className="flex-1 py-2.5 border border-black/10 rounded-xl text-xs font-semibold text-black/60">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-coral text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"><Send className="h-3.5 w-3.5" /> Send Message</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
