"use client";
import { useState } from "react";
import { 
  FileText, 
  Search, 
  Download, 
  ShieldAlert, 
  User, 
  Clock, 
  Wrench, 
  Store, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  RefreshCw
} from "lucide-react";

export default function LogsClient({ initialLogs, initialRoleStats }) {
  const [logs, setLogs] = useState(initialLogs || []);
  const [roleStats, setRoleStats] = useState(initialRoleStats || {});
  const [selectedRole, setSelectedRole] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Filter logs
  const filtered = logs.filter(l => {
    const matchesRole = selectedRole === "all" ? true : l.role === selectedRole;
    const matchesStatus = statusFilter === "all" ? true : l.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      (l.userName || "").toLowerCase().includes(searchLower) ||
      (l.userEmail || "").toLowerCase().includes(searchLower) ||
      (l.action || "").toLowerCase().includes(searchLower) ||
      (l.details || "").toLowerCase().includes(searchLower) ||
      (l.entity || "").toLowerCase().includes(searchLower);

    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
        if (data.roleStats) setRoleStats(data.roleStats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zyphor_audit_logs_${selectedRole}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return <ShieldAlert size={14} className="text-gray-800" />;
      case "retailer": return <Store size={14} className="text-gray-800" />;
      case "wholesaler": return <Building2 size={14} className="text-gray-800" />;
      case "technician": return <Wrench size={14} className="text-gray-800" />;
      default: return <User size={14} className="text-gray-800" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2.5">
            <FileText className="text-black" size={28} />
            Role-Based Audit & Activity Logs
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Real-time tracking of platform activity, logins, catalog updates & permissions grouped by role
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
            <Download size={13} className="text-white" /> Export Logs (JSON)
          </button>
        </div>
      </div>

      {/* ROLE STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedRole(selectedRole === "admin" ? "all" : "admin")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRole === "admin" ? "bg-black text-white border-black shadow-md" : "bg-white border-gray-200 text-black hover:border-gray-400 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedRole === "admin" ? "text-gray-300" : "text-gray-500"}`}>Admin</span>
            <ShieldAlert size={16} className={selectedRole === "admin" ? "text-white" : "text-gray-700"} />
          </div>
          <div className={`text-2xl font-black ${selectedRole === "admin" ? "text-white" : "text-black"}`}>{roleStats.admin || 0}</div>
          <div className={`text-[11px] font-medium mt-1 truncate ${selectedRole === "admin" ? "text-gray-300" : "text-gray-500"}`}>Master Governance</div>
        </button>

        <button
          onClick={() => setSelectedRole(selectedRole === "retailer" ? "all" : "retailer")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRole === "retailer" ? "bg-black text-white border-black shadow-md" : "bg-white border-gray-200 text-black hover:border-gray-400 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedRole === "retailer" ? "text-gray-300" : "text-gray-500"}`}>Retailer</span>
            <Store size={16} className={selectedRole === "retailer" ? "text-white" : "text-gray-700"} />
          </div>
          <div className={`text-2xl font-black ${selectedRole === "retailer" ? "text-white" : "text-black"}`}>{roleStats.retailer || 0}</div>
          <div className={`text-[11px] font-medium mt-1 truncate ${selectedRole === "retailer" ? "text-gray-300" : "text-gray-500"}`}>Store Operators</div>
        </button>

        <button
          onClick={() => setSelectedRole(selectedRole === "wholesaler" ? "all" : "wholesaler")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRole === "wholesaler" ? "bg-black text-white border-black shadow-md" : "bg-white border-gray-200 text-black hover:border-gray-400 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedRole === "wholesaler" ? "text-gray-300" : "text-gray-500"}`}>Wholesaler</span>
            <Building2 size={16} className={selectedRole === "wholesaler" ? "text-white" : "text-gray-700"} />
          </div>
          <div className={`text-2xl font-black ${selectedRole === "wholesaler" ? "text-white" : "text-black"}`}>{roleStats.wholesaler || 0}</div>
          <div className={`text-[11px] font-medium mt-1 truncate ${selectedRole === "wholesaler" ? "text-gray-300" : "text-gray-500"}`}>Bulk Suppliers</div>
        </button>

        <button
          onClick={() => setSelectedRole(selectedRole === "technician" ? "all" : "technician")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRole === "technician" ? "bg-black text-white border-black shadow-md" : "bg-white border-gray-200 text-black hover:border-gray-400 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedRole === "technician" ? "text-gray-300" : "text-gray-500"}`}>Technician</span>
            <Wrench size={16} className={selectedRole === "technician" ? "text-white" : "text-gray-700"} />
          </div>
          <div className={`text-2xl font-black ${selectedRole === "technician" ? "text-white" : "text-black"}`}>{roleStats.technician || 0}</div>
          <div className={`text-[11px] font-medium mt-1 truncate ${selectedRole === "technician" ? "text-gray-300" : "text-gray-500"}`}>Doorstep Repairs</div>
        </button>

        <button
          onClick={() => setSelectedRole(selectedRole === "customer" ? "all" : "customer")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRole === "customer" ? "bg-black text-white border-black shadow-md" : "bg-white border-gray-200 text-black hover:border-gray-400 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedRole === "customer" ? "text-gray-300" : "text-gray-500"}`}>Customer</span>
            <User size={16} className={selectedRole === "customer" ? "text-white" : "text-gray-700"} />
          </div>
          <div className={`text-2xl font-black ${selectedRole === "customer" ? "text-white" : "text-black"}`}>{roleStats.customer || 0}</div>
          <div className={`text-[11px] font-medium mt-1 truncate ${selectedRole === "customer" ? "text-gray-300" : "text-gray-500"}`}>Buyers & Inquirers</div>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search action, email, name, entity or details..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black placeholder-gray-400 focus:bg-white font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedRole("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              selectedRole === "all" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Roles ({logs.length})
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          >
            <option value="all">All Outcomes</option>
            <option value="SUCCESS">Success Only</option>
            <option value="WARNING">Warnings</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4 pl-5">Timestamp</th>
                <th className="p-4">Role</th>
                <th className="p-4">User & IP</th>
                <th className="p-4">Action & Target</th>
                <th className="p-4">Activity Description</th>
                <th className="p-4 pr-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    No activity logs recorded matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 pl-5 text-gray-600 whitespace-nowrap" suppressHydrationWarning>
                      <div className="flex items-center gap-1.5 font-medium text-gray-800" suppressHydrationWarning>
                        <Clock size={13} className="text-gray-400" />
                        <span suppressHydrationWarning>
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "—"}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5" suppressHydrationWarning>
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "—"}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-gray-100 text-gray-900 border border-gray-300">
                        {getRoleIcon(log.role)}
                        {log.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-black">{log.userName || "System"}</div>
                      <div className="text-[11px] text-gray-500 font-medium">{log.userEmail || "no-email"}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{log.ipAddress}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-black uppercase tracking-wide text-[11px]">
                        {log.action}
                      </div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 mt-1 border border-gray-200">
                        {log.entity}
                      </span>
                    </td>

                    <td className="p-4 text-gray-700 max-w-md">
                      <p className="line-clamp-2 leading-relaxed font-medium">{log.details}</p>
                    </td>

                    <td className="p-4 pr-5 text-center whitespace-nowrap">
                      {log.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <CheckCircle2 size={11} /> Success
                        </span>
                      ) : log.status === "WARNING" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-800 bg-gray-200 border border-gray-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <AlertTriangle size={11} /> Warn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-gray-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <XCircle size={11} /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
