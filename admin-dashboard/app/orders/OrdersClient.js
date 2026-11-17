"use client";
import { useState } from "react";
import { ShoppingCart, Search, CheckCircle, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersClient({ initialOrders }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [escrowFilter, setEscrowFilter] = useState("all");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const filteredOrders = orders.filter(o => {
    const text = ((o.bill?.billNumber || "") + " " + (o.buyer?.name || "") + " " + (o.listing?.model || "") + " " + (o.deliveryAddress || "")).toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : o.orderStatus === statusFilter;
    const matchesEscrow = escrowFilter === "all" ? true : o.escrowStatus === escrowFilter;
    return matchesSearch && matchesStatus && matchesEscrow;
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    setLoadingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        router.refresh();
        showFeedback(`Order status updated to ${newStatus}`);
      } else {
        alert("Failed to update status");
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const updateEscrowStatus = async (orderId, newEscrow) => {
    setLoadingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, escrowStatus: newEscrow })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, escrowStatus: newEscrow } : o));
        router.refresh();
        showFeedback(`Escrow funds status set to ${newEscrow.toUpperCase()}`);
      } else {
        alert("Failed to update escrow status");
      }
    } catch {
      alert("Failed to update escrow");
    } finally {
      setLoadingId(null);
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
          <ShoppingCart className="text-black" size={28} />
          Orders & Escrow Financial Settlement
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          Monitor transactions, invoices, platform commission & release escrow funds to sellers ({orders.length} total orders)
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search by invoice number, buyer name, or phone model..."
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-black placeholder-gray-400 text-xs font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Order Statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="disputed">Disputed</option>
        </select>
        <select
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
          value={escrowFilter}
          onChange={(e) => setEscrowFilter(e.target.value)}
        >
          <option value="all">All Escrow Statuses</option>
          <option value="held">Funds Held</option>
          <option value="released">Released to Seller</option>
          <option value="refunded">Refunded to Buyer</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-4 pl-5">Order / Invoice</th>
                <th className="p-4">Item & Parties</th>
                <th className="p-4">Price & Platform Fee</th>
                <th className="p-4">Escrow Action</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4 pr-5 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 pl-5">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="font-mono font-bold text-xs text-black hover:underline text-left block"
                    >
                      {order.bill?.billNumber || `ORD-${order._id.slice(-6).toUpperCase()}`}
                    </button>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-black">
                      {order.listing?.brand} {order.listing?.model || "Item"}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Buyer: <span className="font-semibold text-black">{order.buyer?.name || "Customer"}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Seller: <span className="font-semibold text-black">{order.seller?.businessName || order.seller?.name || "Store"}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-black text-black text-sm">
                      ₹{Number(order.amount || order.bill?.listingPrice || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Fee: ₹{order.bill?.platformFee || 0} (3%) • GST: ₹{order.bill?.gstOnFee || 0}
                    </div>
                    <div className="text-[10px] text-gray-700 font-bold">
                      Seller Payout: ₹{order.bill?.sellerReceives || (order.amount ? Math.round(order.amount * 0.9646) : 0)}
                    </div>
                  </td>

                  <td className="p-4">
                    <select
                      value={order.escrowStatus || "held"}
                      onChange={(e) => updateEscrowStatus(order._id, e.target.value)}
                      disabled={loadingId === order._id}
                      className="text-[11px] font-bold uppercase rounded-lg px-2.5 py-1.5 border border-gray-300 bg-gray-100 text-gray-900 cursor-pointer"
                    >
                      <option value="held">Held (In Escrow)</option>
                      <option value="released">Release to Seller</option>
                      <option value="refunded">Refund to Buyer</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <select
                      value={order.orderStatus || "placed"}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={loadingId === order._id}
                      className="border border-gray-200 text-xs rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 bg-gray-50 cursor-pointer"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="disputed">Disputed</option>
                    </select>
                  </td>

                  <td className="p-4 pr-5 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-gray-800 font-bold text-xs transition-all inline-flex items-center gap-1 border border-gray-300"
                    >
                      <FileText size={12} /> View Bill
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED BILL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-scale-in">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Official Platform Bill</span>
                <h3 className="font-bold text-lg text-black font-mono">
                  {selectedOrder.bill?.billNumber || `ORD-${selectedOrder._id.slice(-6).toUpperCase()}`}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Device Item:</span>
                <span className="font-bold text-black">{selectedOrder.listing?.brand} {selectedOrder.listing?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Buyer Name:</span>
                <span className="font-semibold text-black">{selectedOrder.buyer?.name} ({selectedOrder.buyer?.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Seller Name:</span>
                <span className="font-semibold text-black">{selectedOrder.seller?.businessName || selectedOrder.seller?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Delivery Address:</span>
                <span className="text-gray-700 text-right max-w-xs">{selectedOrder.deliveryAddress || "Standard Pan-India Shipping"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Payment Mode:</span>
                <span className="font-bold uppercase text-black">{selectedOrder.paymentMethod || "UPI / Razorpay"}</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-3.5 text-xs space-y-2">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Buyer Paid:</span>
                <span className="font-black text-black">₹{Number(selectedOrder.amount || selectedOrder.bill?.listingPrice || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform Commission (3%):</span>
                <span className="text-gray-800 font-semibold">- ₹{selectedOrder.bill?.platformFee || Math.round(Number(selectedOrder.amount || 0) * 0.03)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST on Commission (18%):</span>
                <span className="text-gray-800 font-semibold">- ₹{selectedOrder.bill?.gstOnFee || Math.round((Number(selectedOrder.amount || 0) * 0.03) * 0.18)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm text-black">
                <span>Seller Bank Payout:</span>
                <span className="font-black">₹{selectedOrder.bill?.sellerReceives || (selectedOrder.amount ? Math.round(selectedOrder.amount * 0.9646) : 0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-black text-white">
                Escrow: {selectedOrder.escrowStatus || "held"}
              </span>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800"
              >
                Close Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
