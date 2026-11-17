"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Package, 
  Sparkles, 
  Plus, 
  Eye, 
  Wrench, 
  Store, 
  Building2, 
  MessageSquare, 
  Copy, 
  Check, 
  AlertTriangle, 
  Send, 
  Clock, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  TrendingUp, 
  UserCheck, 
  Trash2, 
  ExternalLink, 
  Layers, 
  Settings, 
  CheckCircle2, 
  User, 
  Tag,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import AISmartListerModal from "@/components/shared/AISmartListerModal";
import AIAgreementModal from "@/components/shared/AIAgreementModal";

export default function RoleDashboardView({
  session,
  userProfile,
  userTokenId,
  myListings = [],
  orders = [],
  repairTickets = [],
  messages = []
}) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [showAiLister, setShowAiLister] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgContent, setMsgContent] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [listingsList, setListingsList] = useState(myListings);
  const [ticketList, setTicketList] = useState(repairTickets);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [deletingListingId, setDeletingListingId] = useState(null);
  const [activeTab, setActiveTab] = useState("default");
  const [toastMsg, setToastMsg] = useState("");

  const role = session.role || "customer";

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const copyToken = () => {
    if (userTokenId) {
      navigator.clipboard.writeText(userTokenId);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  // Delete listing handler
  const handleDeleteListing = async (listingId) => {
    if (!confirm("Are you sure you want to remove this listing?")) return;
    setDeletingListingId(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setListingsList(listingsList.filter((l) => l._id !== listingId));
        showToast("Listing removed successfully.");
      } else {
        alert(data.error || "Failed to delete listing");
      }
    } catch {
      alert("Error deleting listing");
    } finally {
      setDeletingListingId(null);
    }
  };

  // Technician ticket status updater
  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    setUpdatingTicketId(ticketId);
    try {
      const res = await fetch("/api/repair", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTicketList(ticketList.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t)));
        showToast(`Ticket status updated to ${newStatus.toUpperCase()}`);
      } else {
        alert(data.error || "Failed to update ticket status");
      }
    } catch {
      alert("Error updating status");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // Technician claim job
  const handleClaimJob = async (ticketId) => {
    setUpdatingTicketId(ticketId);
    try {
      const res = await fetch("/api/repair", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: "assigned", claimJob: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTicketList(ticketList.map((t) => (t._id === ticketId ? { ...t, status: "assigned", assignedTechnician: session.id } : t)));
        showToast("Repair job successfully claimed by you!");
      } else {
        alert(data.error || "Failed to claim job");
      }
    } catch {
      alert("Error claiming job");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // Message admin handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msgContent, subject: `${role.toUpperCase()} Support Query` }),
      });
      const data = await res.json();
      if (data.success) {
        setMsgSent(true);
        setMsgContent("");
        setTimeout(() => {
          setMsgSent(false);
          setShowMsgModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Customer purchase orders vs store sales
  const customerOrders = orders.filter((o) => {
    const buyerId = o.buyer?._id || o.buyer;
    return buyerId === session.id;
  });

  const sellerOrders = orders.filter((o) => {
    const sellerId = o.seller?._id || o.seller;
    return sellerId === session.id;
  });

  // Calculate earnings / volume
  const totalSellerVolume = listingsList.reduce((sum, l) => sum + (Number(l.price) || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in text-xs font-semibold">
          <CheckCircle size={16} className="text-signal-green" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. TOP IDENTITY & SELLING BAR (Universal Across All Roles)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider bg-black text-white px-3 py-1 rounded-full font-bold">
              {role === "customer" ? "Customer Account" : `${role.toUpperCase()} PORTAL`}
            </span>

            {userTokenId && (
              <div className="flex items-center gap-1.5 bg-gray-100 text-gray-800 font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-gray-300">
                <span className="text-gray-500">ID:</span>
                <span className="text-black">{userTokenId}</span>
                <button onClick={copyToken} title="Copy Identity ID" className="hover:text-coral transition-colors ml-1">
                  {copiedToken ? <Check className="h-3.5 w-3.5 text-signal-green" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {session.verifiedSeller && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-signal-green/10 text-signal-green px-2.5 py-0.5 rounded-full border border-signal-green/30">
                <ShieldCheck size={13} /> Verified Seller
              </span>
            )}
          </div>

          <h1 className="font-display font-800 text-2xl sm:text-3xl text-slate-850 tracking-tight">
            Welcome, {session.name || session.email?.split("@")[0] || "User"}
          </h1>
          <p className="text-xs text-black/50 mt-1 font-medium">
            {session.email} • {session.city || userProfile?.city || "India"} • Platform Verified Access Active
          </p>
        </div>

        {/* Action Group: Sell / List Device is Always 1-Click Available */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-display font-700 px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all focus-ring shadow-lg shadow-coral/25"
          >
            <Sparkles className="h-4 w-4" />
            {role === "customer" ? "Sell A Device (+ Cash In)" : "+ List & Sell Item"}
          </Link>

          <button
            onClick={() => setShowAgreement(true)}
            className="inline-flex items-center gap-2 bg-paper hover:bg-black/5 text-slate-850 border border-black/10 font-display font-600 px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all"
          >
            <Plus className="h-4 w-4" /> AI Smart Lister
          </button>

          <button
            onClick={() => setShowMsgModal(true)}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-display font-600 px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all"
          >
            <MessageSquare className="h-4 w-4" /> Support
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROLE VIEW A: CUSTOMER (Buyer by default, Unlocks Seller Hub)
      ───────────────────────────────────────────────────────────── */}
      {role === "customer" && (
        <div className="space-y-8">
          
          {/* Prominent Sell Banner: Direct Gateway to /sell */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181824] via-[#232338] to-[#12121E] text-white p-6 sm:p-8 border border-white/10 shadow-xl">
            <div className="max-w-2xl space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-coral/20 text-coral border border-coral/30 px-3 py-1 rounded-full text-[11px] font-mono font-bold">
                <Sparkles size={13} /> Instant Cashout Program
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Sell Your Old Phone or Device in 60 Seconds ⚡
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-medium">
                Upgrading your phone? Upload details, get instant AI market valuation, guaranteed doorstep inspection, and direct bank transfer without brokerage.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-coral/30"
                >
                  Start Selling Now &rarr;
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white/90 text-xs sm:text-sm px-4 py-3 rounded-xl transition-all font-semibold"
                >
                  Browse Marketplace to Buy
                </Link>
              </div>
            </div>
          </div>

          {/* Dynamic Customer Tabs: Profile & Orders VS Seller Hub (if listings exist) */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <button
              onClick={() => setActiveTab("default")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "default" ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              My Profile &amp; Purchases ({customerOrders.length})
            </button>

            {listingsList.length > 0 && (
              <button
                onClick={() => setActiveTab("seller")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "seller" ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Tag size={13} />
                My Listed Devices ({listingsList.length})
              </button>
            )}
          </div>

          {/* Tab 1: Customer Profile & Order History */}
          {activeTab === "default" && (
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Profile Details Card */}
              <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-display font-700 text-base text-slate-850 flex items-center gap-2">
                    <User className="h-4 w-4 text-coral" /> Customer Details
                  </h3>
                  <Link href="/dashboard/profile" className="text-xs font-semibold text-coral hover:underline">
                    Edit Profile
                  </Link>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Full Name</span>
                    <p className="font-bold text-slate-850 text-sm mt-0.5">{session.name || "Customer User"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Registered Email</span>
                    <p className="font-bold text-slate-850 mt-0.5">{session.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Contact Phone</span>
                    <p className="font-bold text-slate-850 mt-0.5">{userProfile?.phone || session.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Delivery City / Region</span>
                    <p className="font-bold text-slate-850 mt-0.5">{userProfile?.city || session.city || "India"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Identity Token</span>
                    <p className="font-mono text-xs font-bold text-black bg-gray-100 p-2 rounded-xl mt-1 break-all">
                      {userTokenId}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <Link
                    href="/dashboard/profile"
                    className="block w-full text-center py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all"
                  >
                    Update Address &amp; Settings
                  </Link>
                </div>
              </div>

              {/* Purchase Orders Section */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-display font-700 text-base text-slate-850 flex items-center gap-2">
                    <Package className="h-4 w-4 text-signal-green" /> My Purchased Orders
                  </h3>
                  <Link href="/marketplace" className="text-xs font-semibold text-coral hover:underline">
                    Explore Marketplace
                  </Link>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="text-center py-12 text-black/40 space-y-3">
                    <Package className="h-12 w-12 mx-auto opacity-30 text-signal-green" />
                    <p className="text-sm font-semibold text-gray-700">No purchases made yet.</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Explore AI-verified phones and spare parts with 24-hr IMEI blacklist protection and free pan-India delivery.
                    </p>
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-all"
                    >
                      Shop Verified Phones &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((o) => (
                      <div key={o._id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-850 text-sm">
                            {o.listing?.title || `${o.listing?.brand || "Device"} ${o.listing?.model || ""}`}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Order ID: <span className="font-mono text-gray-700">{o._id}</span> • ₹{Number(o.amount || o.price || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-signal-green/10 text-signal-green border border-signal-green/30">
                            {o.orderStatus || "Processing"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 2: Seller Dashboard (Active Once Customer Lists Any Product) */}
          {activeTab === "seller" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-display font-700 text-lg text-slate-850 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-coral" /> Customer Listed Devices &amp; Sales Hub
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Track views, status, and earnings for devices you uploaded to the marketplace
                    </p>
                  </div>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-2 bg-coral text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-coral-dark transition-all self-start"
                  >
                    <Plus size={14} /> Sell Another Device
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Listed</span>
                    <p className="text-2xl font-black text-black mt-1">{listingsList.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Active Live</span>
                    <p className="text-2xl font-black text-signal-green mt-1">
                      {listingsList.filter(l => l.status === "active").length}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Sold Count</span>
                    <p className="text-2xl font-black text-black mt-1">
                      {listingsList.filter(l => l.status === "sold").length}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Portfolio Value</span>
                    <p className="text-2xl font-black text-black mt-1">₹{totalSellerVolume.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Listed Devices Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="p-3 pl-4">Device Details</th>
                        <th className="p-3">Condition</th>
                        <th className="p-3">Asking Price</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {listingsList.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="p-3 pl-4">
                            <div className="font-bold text-black text-sm">{item.title || `${item.brand} ${item.model}`}</div>
                            <div className="text-[11px] text-gray-400 font-mono">{item.category} • {item.city || "India"}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                              {item.conditionGrade || "Good"}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-850">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === "active" ? "bg-signal-green/10 text-signal-green" : "bg-gray-100 text-gray-600"
                            }`}>
                              {item.status || "Active"}
                            </span>
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/marketplace/${item._id}`}
                                className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                title="View on Marketplace"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <button
                                onClick={() => handleDeleteListing(item._id)}
                                disabled={deletingListingId === item._id}
                                className="p-1.5 text-signal-red hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Listing"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ROLE VIEW B: TECHNICIAN (Diagnostic, Assigned Work & Repair Control)
      ───────────────────────────────────────────────────────────── */}
      {role === "technician" && (
        <div className="space-y-8">
          
          {/* Header Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Assigned Jobs</span>
              <p className="text-2xl font-black text-black mt-1">
                {ticketList.filter(t => t.assignedTechnician === session.id || t.assignedTechnician?._id === session.id).length}
              </p>
              <span className="text-[11px] text-gray-400 mt-1 block">Active on your workbench</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Open Tickets (Area)</span>
              <p className="text-2xl font-black text-purple-600 mt-1">
                {ticketList.filter(t => !t.assignedTechnician || t.status === "pending").length}
              </p>
              <span className="text-[11px] text-gray-400 mt-1 block">Available to claim</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Repairs Completed</span>
              <p className="text-2xl font-black text-signal-green mt-1">
                {ticketList.filter(t => t.status === "completed").length}
              </p>
              <span className="text-[11px] text-gray-400 mt-1 block">Successful deliveries</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Parts &amp; Devices Listed</span>
              <p className="text-2xl font-black text-black mt-1">{listingsList.length}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">Refurbished inventory</span>
            </div>
          </div>

          {/* Technician Repair Work Manager */}
          <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-display font-700 text-lg text-slate-850 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-purple-600" /> Technician Repair &amp; Diagnostic Workbench
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update diagnostic outcomes, work progress, and claim new customer service requests
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  <Plus size={14} /> Sell Refurbished Device / Parts
                </Link>
              </div>
            </div>

            {ticketList.length === 0 ? (
              <div className="text-center py-12 text-black/40 space-y-2">
                <Wrench className="h-10 w-10 mx-auto opacity-30 text-purple-600" />
                <p className="text-sm font-semibold text-gray-700">No active repair tickets currently.</p>
                <p className="text-xs text-gray-400">Customer doorstep repair inquiries will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ticketList.map((ticket) => {
                  const isAssignedToMe = (ticket.assignedTechnician === session.id || ticket.assignedTechnician?._id === session.id);
                  const isUnassigned = !ticket.assignedTechnician;

                  return (
                    <div key={ticket._id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg">
                            {ticket.ticketNumber || `TKT-${ticket._id.slice(-6)}`}
                          </span>
                          <span className="font-black text-slate-850 text-sm">
                            {ticket.brand} {ticket.model}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-600">
                          Est. Fee: ₹{ticket.estimatedPrice || 1499}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Customer Reported Issue</span>
                          <p className="font-semibold text-slate-850 mt-0.5">{ticket.issue}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Service Location</span>
                          <p className="font-semibold text-slate-850 mt-0.5">
                            {ticket.address ? `${ticket.address}, ` : ""}Pincode {ticket.pincode}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Customer Contact</span>
                          <p className="font-semibold text-slate-850 mt-0.5">
                            {ticket.contactPhone || ticket.user?.phone || ticket.user?.email || "Protected"}
                          </p>
                        </div>
                      </div>

                      {/* Action & Status Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-500">Job Status:</span>
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-black text-white">
                            {ticket.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isUnassigned && (
                            <button
                              onClick={() => handleClaimJob(ticket._id)}
                              disabled={updatingTicketId === ticket._id}
                              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Claim Job
                            </button>
                          )}

                          {isAssignedToMe && (
                            <select
                              value={ticket.status}
                              onChange={(e) => handleUpdateTicketStatus(ticket._id, e.target.value)}
                              disabled={updatingTicketId === ticket._id}
                              className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold bg-white text-gray-800 cursor-pointer"
                            >
                              <option value="assigned">Status: Assigned</option>
                              <option value="in_repair">Status: In Repair / Diagnostic</option>
                              <option value="completed">Status: Work Completed ✓</option>
                              <option value="cancelled">Status: Cancelled</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Technician Listed Spare Parts & Refurbished Devices */}
          {listingsList.length > 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm space-y-4">
              <h3 className="font-display font-700 text-base text-slate-850 flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-600" /> My Listed Spare Parts &amp; Devices
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {listingsList.map((item) => (
                  <div key={item._id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                    <div className="font-bold text-slate-850 text-sm truncate">{item.title || `${item.brand} ${item.model}`}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-black">₹{Number(item.price).toLocaleString("en-IN")}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-signal-green/10 text-signal-green">
                        {item.status || "Active"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ROLE VIEW C: RETAILER (Storefront, Stock Management & Orders)
      ───────────────────────────────────────────────────────────── */}
      {role === "retailer" && (
        <div className="space-y-8">
          
          {/* Header Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Live Inventory</span>
              <p className="text-2xl font-black text-black mt-1">{listingsList.length}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">Active showroom stock</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Orders Received</span>
              <p className="text-2xl font-black text-signal-green mt-1">{sellerOrders.length}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">From marketplace buyers</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Stock Value</span>
              <p className="text-2xl font-black text-black mt-1">₹{totalSellerVolume.toLocaleString("en-IN")}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">Total inventory catalog</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Store Trust Rating</span>
              <p className="text-2xl font-black text-black mt-1">98%</p>
              <span className="text-[11px] text-signal-green mt-1 block font-bold">Verified Retailer ✓</span>
            </div>
          </div>

          {/* Store Inventory Management */}
          <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-display font-700 text-lg text-slate-850 flex items-center gap-2">
                  <Store className="h-5 w-5 text-signal-green" /> Retailer Store Inventory &amp; Catalog
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage store stock, pricing, and live listings for {session.businessName || "Your Retail Store"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  <Plus size={14} /> Add Device to Store (+ Sell)
                </Link>
                <Link
                  href="/products/upload"
                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
                >
                  CSV Importer
                </Link>
              </div>
            </div>

            {listingsList.length === 0 ? (
              <div className="text-center py-12 text-black/40 space-y-3">
                <Store className="h-12 w-12 mx-auto opacity-30 text-signal-green" />
                <p className="text-sm font-semibold text-gray-700">No store inventory listed yet.</p>
                <p className="text-xs text-gray-400">Add smartphones, tablets or accessories to start accepting customer orders.</p>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 bg-coral text-white text-xs font-bold px-5 py-2.5 rounded-xl"
                >
                  <Plus size={14} /> Add First Device Now
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3 pl-4">Model &amp; Brand</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Condition</th>
                      <th className="p-3">Store Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listingsList.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="font-bold text-black text-sm">{item.title || `${item.brand} ${item.model}`}</div>
                          <div className="text-[11px] text-gray-400 font-mono">IMEI: {item.imei || "Screened"}</div>
                        </td>
                        <td className="p-3 text-gray-600">{item.category}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">
                            {item.conditionGrade || "Good"}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-850">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-signal-green/10 text-signal-green">
                            {item.status || "Active"}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/marketplace/${item._id}`}
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <button
                              onClick={() => handleDeleteListing(item._id)}
                              disabled={deletingListingId === item._id}
                              className="p-1.5 text-signal-red hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ROLE VIEW D: WHOLESALER (B2B Bulk Distribution, Parts & Lots)
      ───────────────────────────────────────────────────────────── */}
      {role === "wholesaler" && (
        <div className="space-y-8">
          
          {/* Header Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Bulk Lots Listed</span>
              <p className="text-2xl font-black text-black mt-1">{listingsList.length}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">B2B batches &amp; spare parts</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Wholesale Value</span>
              <p className="text-2xl font-black text-amber-600 mt-1">₹{totalSellerVolume.toLocaleString("en-IN")}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">Active catalog valuation</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">B2B Inquiries</span>
              <p className="text-2xl font-black text-black mt-1">{messages.length}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">Retailer RFQs &amp; chats</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Verified Wholesaler</span>
              <p className="text-2xl font-black text-signal-green mt-1">B2B Tier-1</p>
              <span className="text-[11px] text-gray-400 mt-1 block">GSTIN Verified ✓</span>
            </div>
          </div>

          {/* Wholesaler Lots & Inventory Manager */}
          <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-display font-700 text-lg text-slate-850 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-600" /> B2B Bulk Inventory &amp; Spare Parts Catalog
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribute wholesale mobile lots, screen assemblies, ICs, and accessories to retailers pan-India
                </p>
              </div>

              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all self-start"
              >
                <Plus size={14} /> List Bulk Lot or Mobile Parts (+ Sell)
              </Link>
            </div>

            {listingsList.length === 0 ? (
              <div className="text-center py-12 text-black/40 space-y-3">
                <Building2 className="h-12 w-12 mx-auto opacity-30 text-amber-600" />
                <p className="text-sm font-semibold text-gray-700">No wholesale lots listed yet.</p>
                <p className="text-xs text-gray-400">List batch phones or spare parts lots for certified retailers.</p>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 bg-coral text-white text-xs font-bold px-5 py-2.5 rounded-xl"
                >
                  <Plus size={14} /> List First Bulk Lot Now
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3 pl-4">Lot Title &amp; Specification</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Wholesale Lot Price</th>
                      <th className="p-3">Availability</th>
                      <th className="p-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listingsList.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="font-bold text-black text-sm">{item.title || `${item.brand} ${item.model} (Bulk Lot)`}</div>
                          <div className="text-[11px] text-gray-400 font-mono">Location: {item.city || "Central Hub"}</div>
                        </td>
                        <td className="p-3 text-gray-600">{item.category}</td>
                        <td className="p-3 font-mono font-bold text-slate-850">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            {item.status || "Available in Bulk"}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/marketplace/${item._id}`}
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <button
                              onClick={() => handleDeleteListing(item._id)}
                              disabled={deletingListingId === item._id}
                              className="p-1.5 text-signal-red hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODALS: AI Agreement & Message Admin
      ───────────────────────────────────────────────────────────── */}
      <AIAgreementModal
        isOpen={showAgreement}
        userDetails={{ name: session.name, email: session.email, role }}
        onAccept={() => {
          setShowAgreement(false);
          setShowAiLister(true);
        }}
        onCancel={() => setShowAgreement(false)}
      />

      <AISmartListerModal
        isOpen={showAiLister}
        onClose={() => setShowAiLister(false)}
        userRole={role}
      />

      {showMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <h3 className="font-display font-700 text-lg text-slate-850 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-coral" /> Contact Platform Support
            </h3>
            <p className="text-xs text-black/55">
              Submit your inquiry or verification query directly to the platform governance team.
            </p>
            {msgSent ? (
              <div className="p-4 bg-signal-green/10 text-signal-green rounded-xl text-xs font-semibold text-center">
                ✓ Message sent successfully!
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  required
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Describe your inquiry..."
                  rows={4}
                  className="w-full border border-black/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMsgModal(false)}
                    className="flex-1 py-2.5 border border-black/10 rounded-xl text-xs font-semibold text-black/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-coral text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
