"use client";
import { useState } from "react";
import { 
  KeyRound, 
  Search, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  Store, 
  Building2, 
  Wrench, 
  User, 
  Laptop, 
  Smartphone, 
  Clock, 
  MapPin, 
  Globe, 
  XCircle, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const ROLES_CONFIG = [
  { 
    id: "admin", 
    label: "Admin Sessions", 
    badge: "Master Governance", 
    icon: ShieldAlert,
    desc: "Platform root & executive administrator logins with full system authority"
  },
  { 
    id: "retailer", 
    label: "Retailer Sessions", 
    badge: "Store Operators", 
    icon: Store,
    desc: "Merchant portal & retail storefront operator active logins"
  },
  { 
    id: "wholesaler", 
    label: "Wholesaler Sessions", 
    badge: "Bulk Suppliers", 
    icon: Building2,
    desc: "B2B inventory suppliers & bulk stock distributor authenticated sessions"
  },
  { 
    id: "technician", 
    label: "Technician Sessions", 
    badge: "Doorstep Repairs", 
    icon: Wrench,
    desc: "Field repair technicians & diagnostic service engineers logged into the portal"
  },
  { 
    id: "customer", 
    label: "Customer Sessions", 
    badge: "App & Web Buyers", 
    icon: User,
    desc: "End-consumer marketplace buyers authenticated across Web & Mobile App"
  }
];

export default function LoginsClient({ initialSessions, initialRoleStats }) {
  const [sessions, setSessions] = useState(initialSessions || []);
  const [roleStats, setRoleStats] = useState(initialRoleStats || {});
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/logins");
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
        if (data.roleStats) setRoleStats(data.roleStats);
        showToast("Logins refreshed successfully");
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRevokeSession = async (sessionId, userEmail) => {
    if (!confirm(`Are you sure you want to terminate the active session for ${userEmail}?`)) return;
    setActionLoadingId(sessionId);
    try {
      const res = await fetch("/api/logins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, status: "REVOKED" } : s));
        showToast(`Session for ${userEmail} revoked successfully.`);
        // Re-calculate role stats
        setRoleStats(prev => ({
          ...prev,
          totalActive: Math.max(0, (prev.totalActive || 1) - 1)
        }));
      } else {
        alert("Failed to revoke session: " + (data.error || "Unknown"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevokeAllInRole = async (role) => {
    if (!confirm(`Are you sure you want to terminate ALL active sessions for role: ${role.toUpperCase()}?`)) return;
    try {
      const res = await fetch("/api/logins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_role", role })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(prev => prev.map(s => s.role === role ? { ...s, status: "REVOKED" } : s));
        showToast(`All active ${role} sessions have been revoked.`);
        handleRefresh();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredSessions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zyphor_logins_${activeTab}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered sessions
  const filteredSessions = sessions.filter(s => {
    const matchesTab = activeTab === "all" ? true : s.role === activeTab;
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      (s.userName || "").toLowerCase().includes(q) ||
      (s.userEmail || "").toLowerCase().includes(q) ||
      (s.ipAddress || "").toLowerCase().includes(q) ||
      (s.device || "").toLowerCase().includes(q) ||
      (s.location || "").toLowerCase().includes(q)
    );
    return matchesTab && matchesStatus && matchesSearch;
  });

  const formatSessionDate = (isoStr) => {
    if (!isoStr) return "-";
    try {
      const d = new Date(isoStr);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-gray-700 animate-fade-in">
          <CheckCircle2 size={16} className="text-gray-300" />
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight flex items-center gap-2.5">
            <KeyRound className="text-black" size={28} />
            Login Management & Active Sessions
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Real-time authentication monitoring, device tracking, and session governance segregated by role
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-xl text-gray-800 hover:text-black hover:bg-gray-50 shadow-sm transition-all"
          >
            <RefreshCw size={13} className={`text-gray-700 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 shadow-sm transition-all"
          >
            <Download size={13} className="text-white" />
            Export Logins (JSON)
          </button>
        </div>
      </div>

      {/* ROLE STAT METRIC CARDS (ALL MONOCHROME) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ROLES_CONFIG.map((role) => {
          const count = roleStats[role.id] || 0;
          const isSelected = activeTab === role.id;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => setActiveTab(isSelected ? "all" : role.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected 
                  ? "bg-black text-white border-black shadow-md" 
                  : "bg-white border-gray-200 text-black hover:border-gray-400 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                  {role.id}
                </span>
                <Icon size={16} className={isSelected ? "text-white" : "text-gray-700"} />
              </div>
              <div className={`text-2xl font-black ${isSelected ? "text-white" : "text-black"}`}>
                {count}
              </div>
              <div className={`text-[11px] font-medium mt-1 truncate ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                {role.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* CONTROLS & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* ROLE TABS SWITCHER */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            All Roles ({roleStats.totalActive || 0} active)
          </button>
          {ROLES_CONFIG.map((role) => {
            const count = roleStats[role.id] || 0;
            const isTabActive = activeTab === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  isTabActive
                    ? "bg-black text-white font-bold shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {role.id} ({count})
              </button>
            );
          })}
        </div>

        {/* SEARCH & STATUS FILTER */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search user, email, IP, device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black placeholder-gray-400 focus:bg-white transition-all font-medium"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="REVOKED">Revoked</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* ROLE SECTIONS CONTAINER */}
      <div className="space-y-6">
        {ROLES_CONFIG.filter(r => activeTab === "all" || activeTab === r.id).map((roleConfig) => {
          const roleSessions = filteredSessions.filter(s => s.role === roleConfig.id);
          const activeRoleCount = roleSessions.filter(s => s.status === "ACTIVE").length;
          const RoleIcon = roleConfig.icon;

          return (
            <div 
              key={roleConfig.id} 
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* SECTION HEADER */}
              <div className="p-5 border-b border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
                    <RoleIcon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-black capitalize">
                        {roleConfig.label}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                        {activeRoleCount} Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {roleConfig.desc}
                    </p>
                  </div>
                </div>

                {activeRoleCount > 0 && (
                  <button
                    onClick={() => handleRevokeAllInRole(roleConfig.id)}
                    className="text-[11px] font-bold text-gray-700 hover:text-black px-3 py-1.5 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Revoke All {roleConfig.id.toUpperCase()} Sessions
                  </button>
                )}
              </div>

              {/* SESSIONS TABLE */}
              {roleSessions.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <KeyRound size={28} className="mx-auto text-gray-400 stroke-1" />
                  <p className="text-sm font-semibold text-gray-800">
                    No {roleConfig.label.toLowerCase()} found
                  </p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    When a user with the role <strong className="text-black font-semibold">{roleConfig.id}</strong> logs in on the web portal or mobile app, their live authenticated session will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                        <th className="p-3.5 pl-5">User & Identity</th>
                        <th className="p-3.5">Device & Platform</th>
                        <th className="p-3.5">IP & Location</th>
                        <th className="p-3.5">Login Timestamp</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {roleSessions.map((session) => {
                        const isActive = session.status === "ACTIVE";
                        const isRevoking = actionLoadingId === session._id;
                        const isMobile = (session.device || "").toLowerCase().includes("mobile") || (session.device || "").toLowerCase().includes("app");

                        return (
                          <tr key={session._id} className="hover:bg-gray-50/70 transition-colors">
                            {/* USER & IDENTITY */}
                            <td className="p-3.5 pl-5">
                              <div className="font-bold text-black text-xs">
                                {session.userName || "User"}
                              </div>
                              <div className="text-gray-500 text-[11px] font-medium mt-0.5">
                                {session.userEmail}
                              </div>
                              {session.userId && (
                                <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                                  ID: {session.userId.slice(-6)}
                                </div>
                              )}
                            </td>

                            {/* DEVICE & PLATFORM */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                                {isMobile ? <Smartphone size={14} className="text-gray-600" /> : <Laptop size={14} className="text-gray-600" />}
                                <span>{session.device || "Browser Session"}</span>
                              </div>
                              {session.userAgent && (
                                <div className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5" title={session.userAgent}>
                                  {session.userAgent}
                                </div>
                              )}
                            </td>

                            {/* IP & LOCATION */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1 font-mono text-gray-800 text-[11px] font-medium">
                                <Globe size={12} className="text-gray-400" />
                                <span>{session.ipAddress || "127.0.0.1"}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                <MapPin size={11} className="text-gray-400" />
                                <span>{session.location || "India"}</span>
                              </div>
                            </td>

                            {/* LOGIN TIMESTAMP */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1 text-gray-800 font-medium">
                                <Clock size={12} className="text-gray-400" />
                                <span suppressHydrationWarning>{formatSessionDate(session.loginAt)}</span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5" suppressHydrationWarning>
                                Last active: {formatSessionDate(session.lastActiveAt)}
                              </div>
                            </td>

                            {/* STATUS */}
                            <td className="p-3.5">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black text-white uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300 uppercase tracking-wider">
                                  {session.status || "Expired"}
                                </span>
                              )}
                            </td>

                            {/* ACTIONS */}
                            <td className="p-3.5 pr-5 text-right">
                              {isActive ? (
                                <button
                                  onClick={() => handleRevokeSession(session._id, session.userEmail)}
                                  disabled={isRevoking}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-gray-800 font-bold text-[11px] rounded-lg border border-gray-300 transition-all shadow-sm"
                                >
                                  {isRevoking ? "Revoking..." : "Revoke Session"}
                                </button>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">
                                  Terminated
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
