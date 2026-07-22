"use client";
import { useState } from "react";
import { ShieldCheck, Search, Users, Package, Lock, Unlock, Sparkles, MessageSquare, Check, Trash2 } from "lucide-react";

export default function AdminPortalClient({ adminUser, initialUsers, initialListings, initialOrders, initialMessages }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [listings, setListings] = useState(initialListings || []);
  const [messages, setMessages] = useState(initialMessages || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // Search User / Token ID via Gemini AI
  async function handleAiSearch(e) {
    e.preventDefault();
    if (!searchQuery) return;
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/ai/admin-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  // Toggle User Access Grant
  async function toggleAccess(userId, currentAccess) {
    try {
      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleUserAccess", userId, accessGranted: !currentAccess })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAccessGranted: !currentAccess } : u));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Delete Listing
  async function deleteListing(listingId) {
    if (!confirm("Are you sure you want to remove this listing from Zyphor?")) return;
    try {
      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteListing", listingId })
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => prev.filter(l => l._id !== listingId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-800 rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-signal-green text-xs font-mono font-semibold uppercase tracking-widest mb-2">
            <Lock className="h-4 w-4" /> MASTER ENVIRONMENTAL CONTROL PORTAL
          </div>
          <h1 className="font-display font-700 text-3xl text-white">Zyphor Master Control Center</h1>
          <p className="text-slate-400 text-sm mt-1">Logged in as Master Administrator ({adminUser.email})</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-xs text-slate-400 font-mono">Platform Revenue (3%)</p>
            <p className="font-display font-700 text-2xl text-signal-green">₹{(initialOrders.length * 1350).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Gemini AI Search Assistant Bar */}
      <div className="bg-slate-800/80 rounded-2xl p-6 border border-white/10 space-y-4">
        <form onSubmit={handleAiSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search User by Token ID (e.g. ZYP-USR-8912-X), Name, or Email..."
              className="w-full bg-slate-900 text-white rounded-xl pl-12 pr-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-coral"
            />
          </div>
          <button
            type="submit"
            disabled={aiLoading}
            className="bg-coral hover:bg-coral-dark text-white font-display font-600 px-6 py-3 rounded-xl text-sm transition-all focus-ring flex items-center gap-2 shadow-lg shadow-coral/20 shrink-0"
          >
            <Sparkles className="h-4 w-4 animate-pulse" /> {aiLoading ? "Searching..." : "AI Search Token"}
          </button>
        </form>

        {aiAnalysis && (
          <div className="bg-slate-900/90 rounded-xl p-5 border border-coral/30 space-y-3 animate-fade-in">
            <h4 className="font-display font-600 text-sm text-coral flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> AI Governance Report for &quot;{searchQuery}&quot;
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiAnalysis.aiSummary}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-white/10 pb-4">
        {[
          { id: "users", label: `User Management (${users.length})`, icon: Users },
          { id: "listings", label: `Listings Control (${listings.length})`, icon: Package },
          { id: "messages", label: `Support Messages (${messages.length})`, icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-display font-600 text-sm transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-coral text-white shadow-lg shadow-coral/20"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content: Users */}
      {activeTab === "users" && (
        <div className="bg-slate-800 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="font-display font-600 text-lg text-white">User Authorization &amp; Access Controls</h3>
            <p className="text-xs text-slate-400">Grant or revoke platform access for Retailers, Wholesalers, and Technicians.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs font-mono uppercase text-slate-400 border-b border-white/5">
                <tr>
                  <th className="p-4">User Token ID</th>
                  <th className="p-4">Name &amp; Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Access Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-coral">
                      {u.userTokenId || `ZYP-USR-${u._id.slice(-6).toUpperCase()}-X`}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700 border border-white/10 text-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.isAccessGranted !== false ? "bg-signal-green/20 text-signal-green border border-signal-green/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {u.isAccessGranted !== false ? "Granted ✓" : "Access Revoked"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleAccess(u._id, u.isAccessGranted !== false)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          u.isAccessGranted !== false
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                            : "bg-signal-green/20 text-signal-green hover:bg-signal-green/30 border border-signal-green/30"
                        }`}
                      >
                        {u.isAccessGranted !== false ? "Revoke Access" : "Grant Access"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Listings */}
      {activeTab === "listings" && (
        <div className="bg-slate-800 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="font-display font-600 text-lg text-white">Marketplace Listings Management</h3>
            <p className="text-xs text-slate-400">Review and delete active devices or parts across the marketplace.</p>
          </div>
          <div className="divide-y divide-white/5">
            {listings.map((l) => (
              <div key={l._id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-700/30 transition-colors">
                <div>
                  <p className="font-display font-600 text-white text-base">{l.title}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Price: ₹{Number(l.price).toLocaleString("en-IN")} • Seller Token: {l.seller?.userTokenId || "ZYP-USR-SELLER"}
                  </p>
                </div>
                <button
                  onClick={() => deleteListing(l._id)}
                  className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors border border-red-500/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Messages */}
      {activeTab === "messages" && (
        <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 space-y-4">
          <h3 className="font-display font-600 text-lg text-white">Direct Messages from Users &amp; Technicians</h3>
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">No unread messages.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m._id} className="p-4 bg-slate-900 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>From: {m.sender?.name} ({m.senderRole}) • {m.sender?.userTokenId}</span>
                    <span>{new Date(m.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <h4 className="font-display font-600 text-sm text-white">{m.subject}</h4>
                  <p className="text-xs text-slate-300">{m.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
