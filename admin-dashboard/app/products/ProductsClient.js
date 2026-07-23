"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductsClient({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, inactive

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.brand + " " + p.model).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ? true : p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    // Optimistic update
    setProducts(products.map(p => p._id === id ? { ...p, status: newStatus } : p));
    
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      // Revert on error
      setProducts(products.map(p => p._id === id ? { ...p, status: currentStatus } : p));
    }
  };

  const deleteProduct = async (id) => {
    if(!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p._id !== id));
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Products Management</h2>
        <Link href="/products/add" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
          <Plus size={20} /> Add Product
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by brand or model..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-sm text-gray-600">Product</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Price</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Type</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-gray-100 border overflow-hidden relative">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt="" className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs text-center">No img</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{product.brand} {product.model}</div>
                    <div className="text-xs text-gray-500">{product.conditionGrade} • {product.storage}</div>
                  </div>
                </td>
                <td className="p-4 font-medium text-emerald-600">₹{product.price}</td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(product._id, product.status)} className={`px-3 py-1 flex items-center gap-1 text-xs font-semibold rounded-full border transition-colors ${product.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                    {product.status === 'active' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                    {product.status}
                  </button>
                </td>
                <td className="p-4 text-sm text-gray-600 capitalize">{product.listingType || "device"}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                    <button onClick={() => deleteProduct(product._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No products found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
