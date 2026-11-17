"use client";
import { useState } from "react";
import { Users, Search, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Mail, Phone, Building } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UsersClient({ initialUsers }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const filteredUsers = users.filter(u => {
    // Exclude master admin from marketplace user management
    if (u.role === "admin") return false;
    const text = ((u.name || "") + " " + (u.email || "") + " " + (u.businessName || "") + " " + (u.phone || "")).toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleVerifiedSeller = async (userId, currentVal) => {
    setUpdatingId(userId);
    try {
      const newVal = !currentVal;
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedSeller: newVal })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, verifiedSeller: newVal } : u));
        router.refresh();
        showFeedback(`Seller verification ${newVal ? "enabled" : "revoked"}`);
      } else {
        alert("Failed to update seller verification");
      }
    } catch {
      alert("Failed to update seller verification");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleAccess = async (userId, isCurrentlyActive) => {
    setUpdatingId(userId);
    try {
      const newActive = !isCurrentlyActive;
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive, isAccessGranted: newActive })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: newActive, isAccessGranted: newActive } : u));
        router.refresh();
        showFeedback(`User account ${newActive ? "activated" : "suspended"}`);
      } else {
        alert("Failed to update user access status");
      }
    } catch {
      alert("Failed to update user access");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        router.refresh();
        showFeedback(`User role changed to ${newRole.toUpperCase()}`);
      } else {
        alert("Failed to update user role");
      }
    } catch {
      alert("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      {feedbackMsg && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle size={16} className="text-gray-300" />
          <span className="text-xs font-semibold tracking-wide">{feedbackMsg}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2.5">
          <Users className="text-black" size={28} />
          User Governance & Access Control
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          Manage roles, seller verification, and platform access across Website &amp; Mobile App (4 Marketplace Roles)
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or business name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-black placeholder-gray-400 text-xs font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-800 bg-gray-50 focus:bg-white cursor-pointer"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles (4)</option>
          <option value="retailer">Retailers</option>
          <option value="wholesaler">Wholesalers</option>
          <option value="technician">Technicians</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-4 pl-5">User Details</th>
                <th className="p-4">Role Assignment</th>
                <th className="p-4">Plan & Status</th>
                <th className="p-4">Seller Badge</th>
                <th className="p-4 pr-5">Account Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const isActive = user.isActive !== false;
                const isVerified = Boolean(user.verifiedSeller);

                return (
                  <tr key={user._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 pl-5">
                      <div className="font-bold text-sm text-black">{user.name || "User"}</div>
                      <div className="text-gray-500 flex items-center gap-1 mt-0.5 text-xs font-medium">
                        <Mail size={12} className="text-gray-400" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-gray-400 flex items-center gap-1 mt-0.5 text-[11px]">
                          <Phone size={12} /> {user.phone}
                        </div>
                      )}
                      {user.businessName && (
                        <div className="text-gray-700 flex items-center gap-1 mt-0.5 font-medium text-[11px]">
                          <Building size={12} className="text-gray-400" /> {user.businessName}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <select
                        value={user.role || "customer"}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={updatingId === user._id}
                        className="text-[11px] font-bold uppercase rounded-lg px-2.5 py-1.5 border border-gray-300 bg-gray-100 text-gray-900 cursor-pointer"
                      >
                        <option value="customer">Customer</option>
                        <option value="retailer">Retailer</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="technician">Technician</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-black capitalize text-xs">
                        {user.subscription?.plan || "Free"}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5 capitalize">
                        {user.subscription?.status || "inactive"}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleVerifiedSeller(user._id, isVerified)}
                        disabled={updatingId === user._id}
                        className={`px-3 py-1 flex items-center gap-1 text-[11px] font-semibold rounded-full border transition-all ${
                          isVerified 
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {isVerified ? <ShieldCheck size={13} className="text-white" /> : <ShieldAlert size={13} className="text-gray-400" />}
                        {isVerified ? "Verified" : "Unverified"}
                      </button>
                    </td>

                    <td className="p-4 pr-5">
                      <button
                        onClick={() => toggleAccess(user._id, isActive)}
                        disabled={updatingId === user._id}
                        className={`px-3 py-1 flex items-center gap-1 text-[11px] font-semibold rounded-full border transition-all ${
                          isActive
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                        }`}
                      >
                        {isActive ? <CheckCircle size={13} className="text-white" /> : <XCircle size={13} className="text-gray-500" />}
                        {isActive ? "Active" : "Suspended"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
