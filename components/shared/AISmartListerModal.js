"use client";
import { useState } from "react";
import { Sparkles, X, CheckCircle2, ShieldCheck, Video, FileText, Package } from "lucide-react";

export default function AISmartListerModal({ isOpen, onClose, onSuccess, userRole = "customer" }) {
  const [rawSpecs, setRawSpecs] = useState("");
  const [condition, setCondition] = useState("Superb");
  const [price, setPrice] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [hasBill, setHasBill] = useState(true);
  const [hasBox, setHasBox] = useState(true);
  const [hasCharger, setHasCharger] = useState(true);
  const [itemType, setItemType] = useState("smartphone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doneData, setDoneData] = useState(null);

  if (!isOpen) return null;

  async function handleAutoList(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDoneData(null);
    try {
      const res = await fetch("/api/ai/auto-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawSpecs,
          condition,
          price,
          videoUrl,
          hasBill,
          hasBox,
          hasCharger,
          itemType
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate AI listing.");
        return;
      }
      setDoneData(data);
      if (onSuccess) onSuccess(data.listing);
    } catch (err) {
      setError(err.message || "Failed to call AI lister.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-black/10">
        
        {/* Header */}
        <div className="bg-ink text-white p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-coral flex items-center justify-center text-white font-bold">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-700 text-lg text-white">Gemini AI Auto-Listing Assistant</h2>
              <p className="text-xs text-white/60">
                {userRole === "customer" ? "3 Free Trial Listings Included (Then ₹99/mo)" : "Included in B2B Pro Subscription"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-paper">
          {doneData ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-signal-green/10 border border-signal-green/30 text-signal-green flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display font-700 text-xl text-slate-850">Product Successfully Listed on Zyphor Marketplace!</h3>
              <p className="text-xs text-black/60 max-w-sm mx-auto">
                AI verified trust score: <strong className="text-signal-green font-mono">{doneData.listing?.verification?.trustScore}/100</strong>
              </p>
              <button
                onClick={onClose}
                className="mt-4 bg-coral hover:bg-coral-dark text-white font-display font-600 px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Close &amp; View Dashboard Status
              </button>
            </div>
          ) : (
            <form onSubmit={handleAutoList} className="space-y-4">
              
              {/* Category picker */}
              <div>
                <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">Item Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {["smartphone", "parts"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setItemType(cat)}
                      className={`p-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                        itemType === cat ? "border-coral bg-coral/5 text-coral" : "border-black/10 text-black/60"
                      }`}
                    >
                      {cat === "smartphone" ? "📱 Smartphone" : "🔧 Spare Part"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specs */}
              <div>
                <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-1.5">
                  Device / Part Details &amp; Name
                </label>
                <input
                  required
                  type="text"
                  value={rawSpecs}
                  onChange={(e) => setRawSpecs(e.target.value)}
                  placeholder="e.g. iPhone 13 128GB Midnight Blue or iPhone 13 Original Screen Assembly"
                  className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-1.5">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full border border-black/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                  >
                    <option value="Superb">Superb (Like New)</option>
                    <option value="Good">Good (Minor scratch)</option>
                    <option value="Fair">Fair (Cosmetic wear)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-1.5">Asking Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                  />
                </div>
              </div>

              {/* Accessories Checkbox */}
              <div>
                <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">Verified Items Included</label>
                <div className="flex gap-4 text-xs font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hasBill} onChange={(e) => setHasBill(e.target.checked)} className="accent-coral" />
                    Original Bill
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hasBox} onChange={(e) => setHasBox(e.target.checked)} className="accent-coral" />
                    Original Box
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hasCharger} onChange={(e) => setHasCharger(e.target.checked)} className="accent-coral" />
                    Charger
                  </label>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-1.5">360° Video Link (Optional)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/shorts/... or Drive link"
                  className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coral hover:bg-coral-dark text-white font-display font-600 py-3.5 rounded-xl transition-all focus-ring shadow-lg shadow-coral/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4 animate-spin" />
                {loading ? "AI is generating & verifying listing..." : "Generate & Add to Marketplace"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
