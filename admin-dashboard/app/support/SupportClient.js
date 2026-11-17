"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  Send, 
  Search, 
  X, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  Check
} from "lucide-react";

export default function SupportClient({ initialTickets }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets || []);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Selected Ticket for View / Reply
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("resolved");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [feedback, setFeedback] = useState("");

  const showNotification = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesCategory = categoryFilter === "all" ? true : t.category === categoryFilter;
    const matchesStatus = statusFilter === "all" ? true : t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" ? true : t.priority === priorityFilter;

    const searchLower = search.toLowerCase();
    const matchesSearch = 
      (t.subject || "").toLowerCase().includes(searchLower) ||
      (t.content || "").toLowerCase().includes(searchLower) ||
      (t.senderName || t.sender?.name || "").toLowerCase().includes(searchLower) ||
      (t.senderEmail || t.sender?.email || "").toLowerCase().includes(searchLower);

    return matchesCategory && matchesStatus && matchesPriority && matchesSearch;
  });

  // Calculate Metrics
  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const urgentCount = tickets.filter(t => t.priority === "urgent" || t.priority === "high").length;

  const handleOpenTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || "");
    setSelectedStatus("resolved");
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmittingReply(true);

    try {
      const res = await fetch("/api/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket._id,
          adminReply: replyText,
          status: selectedStatus,
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(prev => prev.map(t => t._id === selectedTicket._id ? {
          ...t,
          adminReply: replyText,
          status: selectedStatus,
          adminRepliedAt: new Date().toISOString()
        } : t));

        showNotification("Reply saved and ticket updated!");
        setSelectedTicket(null);
        router.refresh();
      } else {
        alert("Failed to submit reply: " + (data.error || "Unknown"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingReply(false);
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
            <HelpCircle className="text-black" size={28} />
            Support, Complaints & Inquiry Hub
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Resolve customer queries, buyer grievances, seller payout questions & repair disputes
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Open Tickets</span>
            <Clock size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{openCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Awaiting admin review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Urgent & High</span>
            <Clock size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{urgentCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Requires priority action</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">In Progress</span>
            <HelpCircle size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{inProgressCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Being handled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Resolved</span>
            <CheckCircle size={18} className="text-gray-700" />
          </div>
          <p className="text-2xl font-black text-black">{resolvedCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Successfully completed</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search subject, user, question..."
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-black placeholder-gray-400 text-xs font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="complaint">Complaints</option>
            <option value="issue">Technical Issues</option>
            <option value="payout">Payout & Escrow</option>
            <option value="inquiry">Product Inquiries</option>
            <option value="general">General</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* TICKETS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4 pl-5">Priority & Cat</th>
                <th className="p-4">Sender / User</th>
                <th className="p-4">Subject & Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    No support tickets found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 pl-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.priority === "urgent" ? "bg-black text-white" :
                          t.priority === "high" ? "bg-gray-800 text-white" :
                          "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}>
                          {t.priority || "medium"}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-gray-400">
                          {t.category || "general"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-black">{t.sender?.name || t.senderName || "User"}</div>
                      <div className="text-[11px] text-gray-500 font-medium">{t.sender?.email || t.senderEmail || "No email"}</div>
                      <span className="inline-block uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 mt-0.5 border border-gray-200">
                        {t.sender?.role || t.senderRole || "customer"}
                      </span>
                    </td>

                    <td className="p-4 max-w-md">
                      <div className="font-bold text-black">{t.subject}</div>
                      <p className="text-gray-500 line-clamp-1 mt-0.5 font-medium">{t.content}</p>
                      {t.adminReply && (
                        <div className="mt-1 text-[11px] text-gray-800 font-bold flex items-center gap-1">
                          <Check size={12} className="text-black" /> Replied by Admin
                        </div>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === "open" ? "bg-black text-white" :
                        t.status === "in_progress" ? "bg-gray-200 text-gray-800 border border-gray-300" :
                        t.status === "resolved" ? "bg-gray-100 text-gray-700 border border-gray-300" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {t.status || "open"}
                      </span>
                    </td>

                    <td className="p-4 text-gray-400 whitespace-nowrap text-[11px] font-mono">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 pr-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenTicketModal(t)}
                        className="bg-gray-100 hover:bg-black hover:text-white text-gray-800 border border-gray-300 px-3 py-1.5 rounded-xl font-bold text-xs transition-all"
                      >
                        {t.adminReply ? "View / Update" : "Reply & Resolve"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & REPLY MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                    {selectedTicket.priority} Priority
                  </span>
                  <span className="text-xs uppercase font-semibold text-gray-400">
                    Category: {selectedTicket.category}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-black mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            {/* SENDER INFO BOX */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-gray-400" />
                <span className="font-semibold text-black">{selectedTicket.sender?.name || selectedTicket.senderName}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded">
                  {selectedTicket.sender?.role || selectedTicket.senderRole}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                <span>{selectedTicket.sender?.email || selectedTicket.senderEmail}</span>
              </div>
              {selectedTicket.sender?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-400" />
                  <span>{selectedTicket.sender.phone}</span>
                </div>
              )}
            </div>

            {/* MESSAGE BODY */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Inquiry / Grievance Content</label>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-black leading-relaxed whitespace-pre-wrap font-medium">
                {selectedTicket.content}
              </div>
            </div>

            {/* PREVIOUS REPLY IF ANY */}
            {selectedTicket.adminReply && (
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-xs">
                <div className="text-[11px] font-bold text-black flex items-center gap-1.5 mb-1">
                  <CheckCircle size={14} /> Official Admin Response:
                </div>
                <p className="text-gray-800 whitespace-pre-wrap font-medium">{selectedTicket.adminReply}</p>
                {selectedTicket.adminRepliedAt && (
                  <div className="text-[10px] text-gray-500 mt-2 font-mono">
                    Sent on {new Date(selectedTicket.adminRepliedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* REPLY FORM */}
            <form onSubmit={handleSendReply} className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Write Official Response to User
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your official resolution or update for the customer/seller..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs bg-gray-50 focus:bg-white text-black font-medium"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Update Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
                  >
                    <option value="resolved">Mark as Resolved</option>
                    <option value="in_progress">Keep In Progress</option>
                    <option value="closed">Close Ticket</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {submittingReply ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    Submit Official Response
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
