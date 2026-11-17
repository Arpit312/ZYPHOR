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
    title: "",
    description: "",
    storage: "128GB",
    ram: "8GB",
    price: "",
    originalPrice: "",
    conditionGrade: "Good",
    city: "Delhi NCR",
    status: "active",
    listingType: "device",
    partCategory: "display",
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
      
      if (res.ok && data.url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url]
        }));
      } else {
        alert("Upload error: " + (data.error || "Please verify Cloudinary credentials"));
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
    setLoading(true);

    try {
      const payload = {
        ...formData,
        title: formData.title || `${formData.brand} ${formData.model} (${formData.storage})`,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        images: formData.images.length > 0 ? formData.images : ["/placeholder-device.svg"]
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/products");
        router.refresh();
      } else {
        alert("Failed to add product: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products" className="text-gray-400 hover:text-black transition-colors p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">Add New Catalog Product</h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Will automatically appear in real time on ZYPHOR Website & Mobile App
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        
        {/* IMAGE UPLOAD SECTION */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-2">
            Product Images
          </label>
          <div className="flex flex-wrap gap-4 items-center">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                <Image src={img} alt="Product" fill className="object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)} 
                  className="absolute top-1 right-1 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
              {uploading ? <Loader2 size={22} className="animate-spin text-black" /> : <ImageIcon size={22} />}
              <span className="text-[11px] mt-1 font-semibold">{uploading ? "Uploading..." : "Add Image"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Tip: If no image uploaded, a verified placeholder device image will be assigned automatically.
          </p>
        </div>

        {/* TYPE & CATEGORY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Listing Type</label>
            <select 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-semibold" 
              value={formData.listingType} 
              onChange={e => setFormData({...formData, listingType: e.target.value})}
            >
              <option value="device">Smartphone / Mobile Device</option>
              <option value="part">Spare Part / Accessory</option>
            </select>
          </div>
          {formData.listingType === "part" ? (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Part Category</label>
              <select 
                className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-semibold" 
                value={formData.partCategory} 
                onChange={e => setFormData({...formData, partCategory: e.target.value})}
              >
                <option value="display">Display Screen / AMOLED</option>
                <option value="battery">Original Battery</option>
                <option value="camera">Camera Module</option>
                <option value="speaker">Loudspeaker / Ringer</option>
                <option value="calling_speaker">Top Calling Receiver</option>
                <option value="motor">Vibration Motor</option>
                <option value="tempered_glass">Tempered Glass</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Device Category</label>
              <input 
                type="text" 
                className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 text-black font-medium" 
                value="Smartphone" 
                readOnly 
              />
            </div>
          )}
        </div>

        {/* BRAND & MODEL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Brand *</label>
            <input 
              required 
              type="text" 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium" 
              value={formData.brand} 
              onChange={e => setFormData({...formData, brand: e.target.value})} 
              placeholder="e.g. Apple, Samsung, OnePlus" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Model *</label>
            <input 
              required 
              type="text" 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium" 
              value={formData.model} 
              onChange={e => setFormData({...formData, model: e.target.value})} 
              placeholder="e.g. iPhone 15 Pro, Galaxy S24" 
            />
          </div>
        </div>

        {/* TITLE */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Listing Title</label>
          <input 
            type="text" 
            className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder="e.g. Apple iPhone 15 Pro (128GB - Natural Titanium)" 
          />
        </div>

        {/* PRICING & SPECS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Selling Price (₹) *</label>
            <input 
              required 
              type="number" 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-xs font-black text-black bg-gray-50 focus:bg-white" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})} 
              placeholder="e.g. 45000" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Original MRP (₹)</label>
            <input 
              type="number" 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium" 
              value={formData.originalPrice} 
              onChange={e => setFormData({...formData, originalPrice: e.target.value})} 
              placeholder="e.g. 79900" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Condition</label>
            <select 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-semibold" 
              value={formData.conditionGrade} 
              onChange={e => setFormData({...formData, conditionGrade: e.target.value})}
            >
              <option value="Superb">Superb (Like New)</option>
              <option value="Good">Good (Minor signs)</option>
              <option value="Fair">Fair (Noticeable wear)</option>
            </select>
          </div>
        </div>

        {formData.listingType === "device" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Storage</label>
              <select 
                className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-semibold" 
                value={formData.storage} 
                onChange={e => setFormData({...formData, storage: e.target.value})}
              >
                <option>64GB</option>
                <option>128GB</option>
                <option>256GB</option>
                <option>512GB</option>
                <option>1TB</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">RAM</label>
              <select 
                className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-semibold" 
                value={formData.ram} 
                onChange={e => setFormData({...formData, ram: e.target.value})}
              >
                <option>4GB</option>
                <option>6GB</option>
                <option>8GB</option>
                <option>12GB</option>
                <option>16GB</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">City</label>
              <input 
                type="text" 
                className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium" 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
                placeholder="e.g. Mumbai, Delhi, Bengaluru" 
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Description</label>
          <textarea 
            rows={3} 
            className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-gray-50 focus:bg-white text-black font-medium" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            placeholder="Official condition remarks, battery health percentage, warranty info, etc." 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl flex justify-center items-center gap-2 font-bold shadow-md transition-all text-xs"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? "Publishing to Shared Catalog..." : "Publish Product (Sync Across Website & App)"}
        </button>
      </form>
    </div>
  );
}
