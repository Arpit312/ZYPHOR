"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  CheckCircle, 
  Calendar, 
  Plus, 
  Search, 
  Loader2, 
  X, 
  ShieldCheck, 
  Zap, 
  TrendingUp
} from "lucide-react";

export default function SubscriptionsClient({ initialSubscriptions, users }) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions || []);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingId, setLoadingId] = useState(null);
  const [feedback, setFeedback] = useState("");

  // Grant Subscription Modal
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({
    userId: users && users.length > 0 ? users[0]._id : "",
    plan: "pro",
    billingCycle: "monthly",
    durationMonths: 1
  });
  const [granting, setGranting] = useState(false);
  const [currentTime] = useState(() => Date.now());

  // Filter subscriptions
  const filtered = subscriptions.filter(s => {
    const userName = (s.user?.name || "").toLowerCase();
    const userEmail = (s.user?.email || "").toLowerCase();
    const businessName = (s.user?.businessName || "").toLowerCase();
    const matchesSearch = userName.includes(search.toLowerCase()) || 
                          userEmail.includes(search.toLowerCase()) || 
                          businessName.includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" ? true : s.plan === planFilter;
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Calculate Metrics
  const totalActive = subscriptions.filter(s => s.status === "active").length;
  const totalRevenue = subscriptions.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const proCount = subscriptions.filter(s => s.plan === "pro").length;
  const enterpriseCount = subscriptions.filter(s => s.plan === "enterprise").length;

  const showNotification = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: id, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscriptions(prev => prev.map(s => s._id === id ? { ...s, status: newStatus } : s));
        showNotification(`Status updated to ${newStatus}`);
        router.refresh();
      } else {
        alert("Failed to update: " + (data.error || "Unknown"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleExtend = async (id, days) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: id, extendDays: days, status: "active" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscriptions(prev => prev.map(s => s._id === id ? {
          ...s,
          status: "active",
          endDate: data.subscription.endDate
        } : s));
        showNotification(`Extended subscription by ${days} days!`);
        router.refresh();
      } else {
        alert("Failed to extend: " + (data.error || "Unknown"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleGrantSubscription = async (e) => {
    e.preventDefault();
    setGranting(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grantForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`Granted ${grantForm.plan.toUpperCase()} plan successfully!`);
        setShowGrantModal(false);
        router.refresh();
        const refreshRes = await fetch("/api/subscriptions");
        const refreshData = await refreshRes.json();
        if (refreshData.subscriptions) setSubscriptions(refreshData.subscriptions);
      } else {
        alert("Grant error: " + (data.error || "Unknown"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST FEEDBACK */}
      {feedback && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle size={16} className="text-gray-300" />
          <span className="text-xs font-semibold tracking-wide">{feedback}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-black" size={28} />
            Seller Subscriptions & Plans
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Real-time control of seller tiers, recurring billing status & tier entitlements
          </p>
        </div>
        <button
          onClick={() => setShowGrantModal(true)}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-all text-xs"
        >
          <Plus size={16} /> Grant Plan to User
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Active Plans</span>
            <ShieldCheck size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{totalActive}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Out of {subscriptions.length} total recorded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Total Revenue</span>
            <TrendingUp size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">₹{totalRevenue.toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Subscription collections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Pro Sellers</span>
            <Zap size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{proCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">₹799/mo tier subscribers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Enterprise</span>
            <CreditCard size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{enterpriseCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">₹1,999/mo unlimited tier</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search subscriber name, email, business..."
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-black placeholder-gray-400 text-xs font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="basic">Basic (₹299)</option>
            <option value="pro">Pro (₹799)</option>
            <option value="enterprise">Enterprise (₹1,999)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* SUBSCRIPTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4 pl-5">Subscriber</th>
                <th className="p-4">Role / Business</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Billing & Fee</th>
                <th className="p-4">Validity Period</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    No matching subscriptions found. You can grant a plan using the button above.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const subEndTime = sub.endDate ? new Date(sub.endDate).getTime() : 0;
                  const isExpiringSoon = subEndTime > 0 && subEndTime < (currentTime + 7 * 86400000);
                  const isPast = subEndTime > 0 && subEndTime < currentTime;

                  return (
                    <tr key={sub._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4 pl-5">
                        <div className="font-bold text-black">{sub.user?.name || "Member"}</div>
                        <div className="text-[11px] text-gray-500 font-medium">{sub.user?.email || "No email"}</div>
                      </td>
                      <td className="p-4">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                          {sub.user?.role || "retailer"}
                        </span>
                        {sub.user?.businessName && (
                          <div className="text-[11px] text-gray-600 font-medium mt-0.5">{sub.user.businessName}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-gray-100 text-black border border-gray-300">
                          <Zap size={12} className="text-gray-700" />
                          {sub.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-black">₹{Number(sub.amount || 0).toLocaleString("en-IN")}</div>
                        <div className="text-[10px] text-gray-400 capitalize">{sub.billingCycle || "monthly"}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <Calendar size={13} className="text-gray-400" />
                          <span>
                            {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : "—"} to{" "}
                            {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "—"}
                          </span>
                        </div>
                        {isPast ? (
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expired</span>
                        ) : isExpiringSoon ? (
                          <span className="text-[10px] font-bold text-gray-700">Expires in &lt; 7 days</span>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleExtend(sub._id, 30)}
                            disabled={loadingId === sub._id}
                            className="bg-gray-100 hover:bg-black hover:text-white text-gray-800 border border-gray-300 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                            title="Extend 30 Days"
                          >
                            +30 Days
                          </button>
                          {sub.status === "active" ? (
                            <button
                              onClick={() => handleUpdateStatus(sub._id, "cancelled")}
                              disabled={loadingId === sub._id}
                              className="bg-gray-200 hover:bg-gray-800 hover:text-white text-gray-700 border border-gray-300 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(sub._id, "active")}
                              disabled={loadingId === sub._id}
                              className="bg-black text-white hover:bg-gray-800 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRANT SUBSCRIPTION MODAL */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <Zap size={18} className="text-black" />
                Grant Plan to Registered User
              </h3>
              <button onClick={() => setShowGrantModal(false)} className="text-gray-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGrantSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[10px] tracking-wider text-gray-600 mb-1.5">Select User / Seller</label>
                <select
                  required
                  value={grantForm.userId}
                  onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white text-black font-medium"
                >
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) — Role: {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] tracking-wider text-gray-600 mb-1.5">Plan Tier</label>
                <select
                  value={grantForm.plan}
                  onChange={(e) => setGrantForm({ ...grantForm, plan: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white text-black font-medium"
                >
                  <option value="basic">Basic (10 Listings, 50 AI Calls - ₹299/mo)</option>
                  <option value="pro">Pro (50 Listings, 200 AI Calls, Verified Badge - ₹799/mo)</option>
                  <option value="enterprise">Enterprise (Unlimited Listings & AI, Dedicated Mgr - ₹1,999/mo)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[10px] tracking-wider text-gray-600 mb-1.5">Cycle</label>
                  <select
                    value={grantForm.billingCycle}
                    onChange={(e) => setGrantForm({ ...grantForm, billingCycle: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white text-black font-medium"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-[10px] tracking-wider text-gray-600 mb-1.5">Duration</label>
                  <select
                    value={grantForm.durationMonths}
                    onChange={(e) => setGrantForm({ ...grantForm, durationMonths: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white text-black font-medium"
                  >
                    <option value={1}>1 Cycle</option>
                    <option value={3}>3 Cycles</option>
                    <option value={6}>6 Cycles</option>
                    <option value={12}>1 Year</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={granting}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {granting ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                  Activate Plan Immediately
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
