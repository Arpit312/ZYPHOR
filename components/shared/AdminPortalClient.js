"use client";
import { useState } from "react";
import { ShieldCheck, Search, Users, Package, Lock, Sparkles, MessageSquare, Plus, Trash2, Wrench, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPortalClient({ adminUser, initialUsers, initialListings, initialOrders, initialMessages }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [listings, setListings] = useState(initialListings || []);
  const [messages, setMessages] = useState(initialMessages || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // Parts Management State
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartForm, setNewPartForm] = useState({
    title: "",
    brand: "Apple",
    model: "iPhone 13",
    partCategory: "camera",
    price: 1499,
    image: "/parts/camera-module.svg",
    description: ""
  });

  const partsListings = listings.filter((l) => l.listingType === "part");

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
        toast.success(`Access ${!currentAccess ? "Granted" : "Revoked"} successfully!`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Delete Listing
  async function deleteListing(listingId) {
    if (!confirm("Are you sure you want to remove this listing/part from Zyphor?")) return;
    try {
      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteListing", listingId })
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => prev.filter(l => l._id !== listingId));
        toast.success("Listing removed from catalog.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Add Spare Part (Master Admin)
  async function handleAddPart(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addPart", partData: newPartForm })
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => [data.part, ...prev]);
        setShowAddPartModal(false);
        setNewPartForm({
          title: "",
          brand: "Apple",
          model: "iPhone 13",
          partCategory: "camera",
          price: 1499,
          image: "/parts/camera-module.svg",
          description: ""
        });
        toast.success("New Spare Part added to Zyphor Catalog!");
      } else {
        toast.error(data.error || "Failed to add part");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
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
              placeholder="Search User by Token ID (e.g. ZYP-USR-ADM001-X), Name, or Email..."
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
      <div className="flex gap-3 border-b border-white/10 pb-4 overflow-x-auto">
        {[
          { id: "users", label: `User Management (${users.length})`, icon: Users },
          { id: "listings", label: `Listings Control (${listings.length})`, icon: Package },
          { id: "parts", label: `Parts Management (${partsListings.length})`, icon: Wrench },
          { id: "messages", label: `Support Messages (${messages.length})`, icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-600 text-xs transition-all shrink-0 ${
                isActive
                  ? "bg-coral text-white shadow-lg shadow-coral/20"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS */}
      {activeTab === "users" && (
        <div className="bg-slate-800 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-display font-700 text-lg text-white">Registered Users &amp; Unique Token Access</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase border-b border-white/5">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Unique Token ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{u.name}</p>
                      <p className="text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-4 font-mono">
                      <span className="bg-slate-900 text-coral border border-coral/30 px-2.5 py-1 rounded-md font-bold">
                        {u.userTokenId || "ZYP-USR-0000-X"}
                      </span>
                    </td>
                    <td className="p-4 uppercase font-mono text-slate-400 font-bold">{u.role}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleAccess(u._id, u.isAccessGranted)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                          u.isAccessGranted
                            ? "bg-signal-green/20 text-signal-green border border-signal-green/30 hover:bg-signal-green/30"
                            : "bg-signal-red/20 text-signal-red border border-signal-red/30 hover:bg-signal-red/30"
                        }`}
                      >
                        {u.isAccessGranted ? "✓ Access Granted" : "✕ Access Revoked"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALL LISTINGS CONTROL */}
      {activeTab === "listings" && (
        <div className="bg-slate-800 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-display font-700 text-lg text-white">Master Listings Control</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase border-b border-white/5">
                <tr>
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-white">{l.title || `${l.brand} ${l.model}`}</td>
                    <td className="p-4 uppercase font-mono text-slate-400">{l.listingType}</td>
                    <td className="p-4 font-bold text-signal-green">₹{l.price?.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteListing(l._id)}
                        className="text-signal-red hover:text-red-400 font-semibold flex items-center gap-1 bg-signal-red/10 border border-signal-red/20 px-3 py-1 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SPARE PARTS MANAGEMENT */}
      {activeTab === "parts" && (
        <div className="bg-slate-800 rounded-2xl border border-white/10 overflow-hidden shadow-xl space-y-6">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-display font-700 text-lg text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-coral" /> Mobile Spare Parts Catalog Control
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Add, update prices, or remove spare parts live from catalog.</p>
            </div>
            <button
              onClick={() => setShowAddPartModal(!showAddPartModal)}
              className="bg-coral hover:bg-coral-dark text-white font-display font-600 text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-coral/20"
            >
              <Plus className="h-4 w-4" /> {showAddPartModal ? "Cancel" : "Add New Spare Part"}
            </button>
          </div>

          {/* Add Part Form */}
          {showAddPartModal && (
            <div className="p-6 bg-slate-900/90 border-b border-white/10 animate-fade-in">
              <h4 className="font-display font-700 text-white text-sm mb-4">Add New Spare Part</h4>
              <form onSubmit={handleAddPart} className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Part Title</label>
                  <input
                    type="text"
                    value={newPartForm.title}
                    onChange={(e) => setNewPartForm({ ...newPartForm, title: e.target.value })}
                    placeholder="e.g. iPhone 13 Back Camera Module"
                    className="w-full bg-slate-800 text-white border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-coral"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Brand</label>
                  <select
                    value={newPartForm.brand}
                    onChange={(e) => setNewPartForm({ ...newPartForm, brand: e.target.value })}
                    className="w-full bg-slate-800 text-white border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-coral"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Realme">Realme</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Oppo">Oppo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Compatible Model</label>
                  <input
                    type="text"
                    value={newPartForm.model}
                    onChange={(e) => setNewPartForm({ ...newPartForm, model: e.target.value })}
                    placeholder="e.g. iPhone 13"
                    className="w-full bg-slate-800 text-white border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-coral"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Part Category</label>
                  <select
                    value={newPartForm.partCategory}
                    onChange={(e) => setNewPartForm({ ...newPartForm, partCategory: e.target.value })}
                    className="w-full bg-slate-800 text-white border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-coral"
                  >
                    <option value="camera">Camera</option>
                    <option value="speaker">Loudspeaker</option>
                    <option value="calling_speaker">Calling Speaker</option>
                    <option value="motor">Vibration Motor</option>
                    <option value="tempered_glass">Tempered Glass</option>
                    <option value="battery">Original Battery</option>
                    <option value="display">Display Screen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newPartForm.price}
                    onChange={(e) => setNewPartForm({ ...newPartForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-coral"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={newPartForm.image}
                    onChange={(e) => setNewPartForm({ ...newPartForm, image: e.target.value })}
                    className="w-full bg-slate-800 text-white border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-coral"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="bg-signal-green hover:bg-emerald-600 text-white font-display font-600 text-xs px-6 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    Save &amp; Publish Spare Part Live
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Parts List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase border-b border-white/5">
                <tr>
                  <th className="p-4">Spare Part Details</th>
                  <th className="p-4">Brand / Model</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {partsListings.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images?.[0] || "/placeholder-device.svg"} alt="" className="h-10 w-10 object-cover rounded-lg bg-slate-900 border border-white/10" />
                      <span>{p.title}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{p.brand} {p.model}</td>
                    <td className="p-4 uppercase font-mono font-bold text-coral">{p.partCategory || "part"}</td>
                    <td className="p-4 font-bold text-signal-green">₹{p.price?.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteListing(p._id)}
                        className="text-signal-red hover:text-red-400 font-semibold flex items-center gap-1 bg-signal-red/10 border border-signal-red/20 px-3 py-1 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT MESSAGES */}
      {activeTab === "messages" && (
        <div className="bg-slate-800 rounded-2xl border border-white/10 overflow-hidden shadow-xl p-6">
          <h3 className="font-display font-700 text-lg text-white mb-4">Direct User Support Messages</h3>
          {messages.length === 0 ? (
            <p className="text-slate-400 text-xs">No direct support messages yet.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m._id} className="bg-slate-900/80 rounded-xl p-4 border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between font-mono text-slate-400">
                    <span className="font-bold text-white">{m.senderName || m.senderEmail}</span>
                    <span>{new Date(m.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-slate-300 pt-1">{m.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
