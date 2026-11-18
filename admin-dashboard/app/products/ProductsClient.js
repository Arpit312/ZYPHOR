"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, X, Save, Loader2, UploadCloud, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductsClient({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Edit State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const filteredProducts = products.filter(p => {
    const brandModel = ((p.brand || "") + " " + (p.model || "") + " " + (p.title || "")).toLowerCase();
    const matchesSearch = brandModel.includes(search.toLowerCase());
    const matchesFilter = filter === "all" ? true : p.status === filter;
    const matchesType = typeFilter === "all" ? true : (p.listingType || "device") === typeFilter;
    return matchesSearch && matchesFilter && matchesType;
  });

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setProducts(products.map(p => p._id === id ? { ...p, status: newStatus } : p));
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Status update failed");
      router.refresh();
      showNotification(`Product marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      setProducts(products.map(p => p._id === id ? { ...p, status: currentStatus } : p));
      alert("Failed to update status");
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      setProducts(products.filter(p => p._id !== id));
      router.refresh();
      showNotification("Product deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      brand: product.brand || "",
      model: product.model || "",
      title: product.title || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      storage: product.storage || "128GB",
      ram: product.ram || "8GB",
      conditionGrade: product.conditionGrade || "Good",
      city: product.city || "Pan India",
      status: product.status || "active",
      listingType: product.listingType || "device",
      description: product.description || ""
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Update failed");
      }

      setProducts(products.map(p => p._id === editingProduct._id ? { ...p, ...editForm, price: Number(editForm.price) } : p));
      setEditingProduct(null);
      setEditForm(null);
      router.refresh();
      showNotification("Product updated successfully in real time!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving changes: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const showNotification = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  return (
    <div>
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle size={16} className="text-gray-300" />
          <span className="text-xs font-semibold tracking-wide">{feedbackMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2.5">
            <Package className="text-black" size={28} />
            Products & Catalog Management
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Real-time synced across ZYPHOR Website, App & Marketplace ({products.length} live products)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/products/upload" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-all text-xs">
            <UploadCloud size={15} className="text-gray-700" /> Bulk Upload CSV
          </Link>
          <Link href="/products/add" className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-all text-xs">
            <Plus size={15} /> Add Single Item
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input 
            type="text" 
            placeholder="Search by brand, model or title..." 
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-black placeholder-gray-400 text-xs font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2.5">
          <select 
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="sold">Sold</option>
          </select>
          <select 
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="device">Phones / Devices</option>
            <option value="part">Spare Parts</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 pl-5 font-bold text-[10px] uppercase tracking-wider text-gray-500">Product / Details</th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-gray-500">Price (INR)</th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-gray-500">Live Status</th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-gray-500">Type</th>
              <th className="p-4 pr-5 font-bold text-[10px] uppercase tracking-wider text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                <td className="p-4 pl-5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0">
                    {product.images && product.images[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={product.images[0]} alt="" className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs text-center">No img</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-black text-xs">{product.brand} {product.model}</div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      {product.conditionGrade || "Good"} • {product.storage || "N/A"} • {product.city || "Pan India"}
                    </div>
                  </div>
                </td>
                <td className="p-4 font-black text-black text-xs">
                  ₹{Number(product.price || 0).toLocaleString("en-IN")}
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleStatus(product._id, product.status)} 
                    className={`px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all ${
                      product.status === 'active' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {product.status === 'active' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                    {product.status}
                  </button>
                </td>
                <td className="p-4 text-[11px] font-semibold text-gray-700 capitalize">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-300 uppercase text-[10px] font-bold">
                    {product.listingType || "device"}
                  </span>
                </td>
                <td className="p-4 pr-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenEdit(product)} 
                      title="Edit Product"
                      className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => deleteProduct(product._id)} 
                      title="Delete Product"
                      className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray-400">
                  <div className="max-w-md mx-auto space-y-3">
                    <Package size={28} className="mx-auto text-gray-300 stroke-1" />
                    <p className="text-sm font-bold text-gray-800">No products currently in catalog (0 Products)</p>
                    <p className="text-xs text-gray-500">All dummy products have been removed. Use the buttons above to publish real devices or bulk upload CSV files.</p>
                    <div className="flex justify-center gap-2.5 pt-2">
                      <Link href="/products/upload" className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-xl border border-gray-300">
                        Bulk Upload CSV
                      </Link>
                      <Link href="/products/add" className="text-xs font-bold bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl">
                        + Add First Product
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingProduct && editForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 border border-gray-200 animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <Edit className="text-black" size={18} /> Edit Product / Part
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  ID: {editingProduct._id} • Changes update immediately on Website & App
                </p>
              </div>
              <button 
                onClick={() => { setEditingProduct(null); setEditForm(null); }}
                className="text-gray-400 hover:text-black p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Apple iPhone 13 (128GB - Midnight Black)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-black bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.originalPrice}
                    onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Condition Grade</label>
                  <select
                    value={editForm.conditionGrade}
                    onChange={(e) => setEditForm({ ...editForm, conditionGrade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  >
                    <option value="Superb">Superb (Like New)</option>
                    <option value="Good">Good (Minor signs)</option>
                    <option value="Fair">Fair (Noticeable wear)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Storage</label>
                  <input
                    type="text"
                    value={editForm.storage}
                    onChange={(e) => setEditForm({ ...editForm, storage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">RAM</label>
                  <input
                    type="text"
                    value={editForm.ram}
                    onChange={(e) => setEditForm({ ...editForm, ram: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">City / Region</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  >
                    <option value="active">Active (Visible in Marketplace)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Listing Type</label>
                  <select
                    value={editForm.listingType}
                    onChange={(e) => setEditForm({ ...editForm, listingType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                  >
                    <option value="device">Device / Smartphone</option>
                    <option value="part">Spare Part</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setEditingProduct(null); setEditForm(null); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  {savingEdit ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  Save Changes Real-Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
