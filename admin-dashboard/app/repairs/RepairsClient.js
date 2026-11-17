"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Search, 
  X, 
  Loader2, 
  ShieldCheck
} from "lucide-react";

export default function RepairsClient({ initialTickets, initialTechnicians }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets || []);
  const [technicians, setTechnicians] = useState(initialTechnicians || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit / Assignment Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editForm, setEditForm] = useState({
    assignedTechnician: "",
    status: "pending",
    estimatedPrice: 0,
    adminNotes: ""
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const showNotification = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  const filtered = tickets.filter(t => {
    const matchesStatus = statusFilter === "all" ? true : t.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      (t.ticketNumber || "").toLowerCase().includes(searchLower) ||
      (t.brand || "").toLowerCase().includes(searchLower) ||
      (t.model || "").toLowerCase().includes(searchLower) ||
      (t.issue || "").toLowerCase().includes(searchLower) ||
      (t.pincode || "").toLowerCase().includes(searchLower) ||
      (t.user?.name || "").toLowerCase().includes(searchLower) ||
      (t.contactPhone || "").toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const pendingCount = tickets.filter(t => t.status === "pending").length;
  const assignedCount = tickets.filter(t => t.status === "assigned").length;
  const inRepairCount = tickets.filter(t => t.status === "in_repair").length;
  const completedCount = tickets.filter(t => t.status === "completed").length;

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setEditForm({
      assignedTechnician: ticket.assignedTechnician?._id || "",
      status: ticket.status || "pending",
      estimatedPrice: ticket.estimatedPrice || 0,
      adminNotes: ticket.adminNotes || ""
    });
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSaving(true);

    try {
      const res = await fetch("/api/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket._id,
          ...editForm
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Repair ticket updated successfully!");
        setSelectedTicket(null);
        router.refresh();

        const refreshRes = await fetch("/api/repairs");
        const refreshData = await refreshRes.json();
        if (refreshData.tickets) setTickets(refreshData.tickets);
      } else {
        alert("Update failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
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
            <Wrench className="text-black" size={28} />
            Doorstep Repair Operations
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Dispatch certified technicians, manage doorstep mobile repairs & monitor completion
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Pending Dispatch</span>
            <Clock size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Needs technician assign</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Assigned Techs</span>
            <User size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{assignedCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Scheduled for visit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">In Repair</span>
            <Wrench size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{inRepairCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Active doorstep work</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Completed</span>
            <CheckCircle size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{completedCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Repaired & verified</p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search ticket #, device, pincode, phone..."
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-black placeholder-gray-400 text-xs font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          >
            <option value="all">All Statuses ({tickets.length})</option>
            <option value="pending">Pending Assignment</option>
            <option value="assigned">Assigned</option>
            <option value="in_repair">In Repair</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* REPAIRS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4 pl-5">Ticket & Date</th>
                <th className="p-4">Device & Stated Issue</th>
                <th className="p-4">Customer & Address</th>
                <th className="p-4">Technician</th>
                <th className="p-4">Est. Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    No repair tickets found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 pl-5 whitespace-nowrap">
                      <div className="font-bold text-black font-mono text-[11px]">{t.ticketNumber || t._id.slice(-6)}</div>
                      <div className="flex items-center gap-1 text-gray-500 text-[10px] mt-0.5">
                        <Calendar size={12} className="text-gray-400" />
                        {t.preferredDate ? new Date(t.preferredDate).toLocaleDateString() : new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-black">{t.brand} {t.model}</div>
                      <p className="text-gray-500 line-clamp-1 mt-0.5 font-medium">{t.issue}</p>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-black">{t.user?.name || "Customer"}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                        <Phone size={12} className="text-gray-400" />
                        {t.contactPhone || t.user?.phone || "—"}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        {t.address ? `${t.address} (${t.pincode})` : `Pincode: ${t.pincode}`}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {t.assignedTechnician ? (
                        <div>
                          <div className="font-bold text-black flex items-center gap-1">
                            <ShieldCheck size={13} className="text-gray-800" />
                            {t.assignedTechnician.name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">{t.assignedTechnician.phone || t.assignedTechnician.email}</div>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-black text-black whitespace-nowrap">
                      ₹{Number(t.estimatedPrice || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === "completed" ? "bg-black text-white" :
                        t.status === "in_repair" ? "bg-gray-800 text-white" :
                        t.status === "assigned" ? "bg-gray-200 text-gray-900 border border-gray-300" :
                        t.status === "cancelled" ? "bg-gray-100 text-gray-500" :
                        "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="p-4 pr-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenModal(t)}
                        className="bg-gray-100 hover:bg-black hover:text-white text-gray-800 border border-gray-300 px-3 py-1.5 rounded-xl font-bold text-xs transition-all"
                      >
                        Manage & Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANAGE TICKET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Doorstep Ticket Management</span>
                <h3 className="font-bold text-lg text-black">
                  {selectedTicket.brand} {selectedTicket.model} ({selectedTicket.ticketNumber})
                </h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs space-y-1.5">
              <div><strong className="text-black">Issue:</strong> {selectedTicket.issue}</div>
              <div><strong className="text-black">Customer:</strong> {selectedTicket.user?.name} | {selectedTicket.contactPhone}</div>
              <div><strong className="text-black">Address:</strong> {selectedTicket.address} (PIN: {selectedTicket.pincode})</div>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[10px] tracking-wider text-gray-600 mb-1.5">Assign Certified Technician</label>
                <select
                  value={editForm.assignedTechnician}
                  onChange={(e) => setEditForm({ ...editForm, assignedTechnician: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white text-black font-medium"
                >
                  <option value="">-- Leave Unassigned --</option>
                  {technicians.map(tech => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name} ({tech.city || "Pan India"}) — Rating: {tech.trustRating || "4.8"}★
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[10px] tracking-wider text-gray-600 mb-1.5">Repair Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white text-black font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_repair">In Repair</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-[10px] tracking-wider text-gray-600 mb-1.5">Est. Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.estimatedPrice}
                    onChange={(e) => setEditForm({ ...editForm, estimatedPrice: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white font-bold text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] tracking-wider text-gray-600 mb-1.5">Admin / Technician Remarks</label>
                <textarea
                  rows={3}
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  placeholder="Notes on replacement part used, warranty period, or visit schedule..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white text-black placeholder-gray-400 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
