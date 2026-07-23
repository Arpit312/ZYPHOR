"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    storage: "128GB",
    ram: "8GB",
    price: "",
    conditionGrade: "Good",
    city: "Mumbai",
    status: "active",
    listingType: "device",
    sellerId: "admin",
    images: [] 
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await res.json();
      
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url]
        }));
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push("/products");
        router.refresh();
      } else {
        alert("Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-3xl font-bold">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        {/* IMAGE UPLOAD SECTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
          <div className="flex flex-wrap gap-4 items-center">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                <Image src={img} alt="Product" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
              {uploading ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
              <span className="text-xs mt-1">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <input required type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="e.g. Apple" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <input required type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="e.g. iPhone 13" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
            <input required type="number" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. 45000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Storage</label>
            <select className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.storage} onChange={e => setFormData({...formData, storage: e.target.value})}>
              <option>64GB</option>
              <option>128GB</option>
              <option>256GB</option>
              <option>512GB</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RAM</label>
            <select className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})}>
              <option>4GB</option>
              <option>6GB</option>
              <option>8GB</option>
              <option>12GB</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <select className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.conditionGrade} onChange={e => setFormData({...formData, conditionGrade: e.target.value})}>
              <option>Superb</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
            <select className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.listingType} onChange={e => setFormData({...formData, listingType: e.target.value})}>
              <option value="device">Device</option>
              <option value="part">Part</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg flex justify-center items-center gap-2 font-bold transition-colors">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {loading ? "Saving Product..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
