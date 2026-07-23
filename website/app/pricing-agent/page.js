"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Zap, CheckCircle, Upload, Video, ShieldCheck, Image as ImageIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const CONDITIONS = ["Superb", "Good", "Fair"];
const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Motorola", "Realme", "Vivo", "Oppo", "Nothing", "Google"];

export default function PricingAgentPage() {
  const [form, setForm] = useState({
    brand: "Samsung",
    model: "Galaxy S23",
    storage: "128GB",
    ram: "8GB",
    condition: "Good",
    batteryHealth: 85,
    city: "Delhi",
    videoUrl: ""
  });
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      toast.error("You can upload a maximum of 3 device photos.");
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} photo(s) added for AI inspection!`);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });

      if (res.status === 429) {
        toast.error("Daily valuation limit reached. Please try again tomorrow!");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        toast.error(data.error);
      } else {
        setResult(data);
        toast.success("AI Price & Physical Inspection Complete!");
      }
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TrendIcon = result?.marketTrend === "rising" ? TrendingUp : result?.marketTrend === "falling" ? TrendingDown : Minus;
  const trendColor = result?.marketTrend === "rising" ? "text-signal-green" : result?.marketTrend === "falling" ? "text-signal-red" : "text-amber-500";

  return (
    <div className="bg-paper min-h-screen">
      {/* Hero Banner (DARK) */}
      <div className="relative overflow-hidden bg-ink border-b border-white/5">
        <Container className="relative py-12 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full px-4 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase mb-4">
            <Zap className="h-3.5 w-3.5" />
            AI Resale Price &amp; Inspection Agent
          </div>
          <h1 className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-3">
            Predict Real-World <span className="text-coral">Resale Price</span>
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Upload device photos and video inspection clip for an accurate AI visual condition analysis &amp; precision valuation bonus.
          </p>
        </Container>
      </div>

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-600 text-lg text-slate-850 mb-5">Enter Device &amp; Media Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">Brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm bg-paper outline-none focus:border-coral"
                  >
                    {BRANDS.map((b) => <option key={b}>{b}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="e.g. Galaxy S23"
                    className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-coral"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">Storage</label>
                  <input
                    type="text"
                    value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })}
                    placeholder="128GB"
                    className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">RAM</label>
                  <input
                    type="text"
                    value={form.ram}
                    onChange={(e) => setForm({ ...form, ram: e.target.value })}
                    placeholder="8GB"
                    className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-coral"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">Declared Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm bg-paper outline-none focus:border-coral"
                  >
                    {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">Battery Health (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={form.batteryHealth}
                    onChange={(e) => setForm({ ...form, batteryHealth: Number(e.target.value) })}
                    className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-coral"
                  />
                </div>
              </div>

              {/* 📸 Image Upload Option */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-850 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-coral" /> Device Photos (Max 3)
                  </span>
                  <span className="text-[11px] text-coral font-mono font-bold">+5% AI Bonus</span>
                </label>
                <div className="flex gap-2 items-center">
                  {images.map((img, i) => (
                    <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden border border-black/10 group shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Uploaded device" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <label className="h-16 flex-1 border-2 border-dashed border-black/15 hover:border-coral rounded-xl flex items-center justify-center cursor-pointer bg-paper hover:bg-coral/5 transition-colors">
                      <div className="flex items-center gap-2 text-xs font-medium text-black/60">
                        <Upload className="h-4 w-4 text-coral" />
                        <span>Upload Photo ({images.length}/3)</span>
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* 🎥 Video Clip Link Option */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-850 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-coral" /> Video Inspection Clip Link (Optional)
                  </span>
                  <span className="text-[11px] text-coral font-mono font-bold">+5% AI Bonus</span>
                </label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/shorts/... or Google Drive link"
                  className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-coral"
                />
                <p className="text-[11px] text-black/40 mt-1">
                  Provide a short video clip link showing screen &amp; body condition.
                </p>
              </div>

              {error && <p className="text-xs text-signal-red font-mono">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coral hover:bg-coral-dark text-white font-display font-600 py-3 rounded-xl transition-colors disabled:opacity-40 shadow-sm"
              >
                {loading ? "Analyzing Device & Media..." : "Calculate Real Market Price"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div>
            {result ? (
              <div className="bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-black/5 pb-4">
                  <div>
                    <span className="text-xs font-mono text-black/40 uppercase tracking-widest">
                      {form.brand} {form.model}
                    </span>
                    <h2 className="font-display font-700 text-2xl text-slate-850 mt-0.5">
                      ₹{result.recommendedPrice?.toLocaleString("en-IN")}
                    </h2>
                    <p className="text-xs text-signal-green font-semibold mt-0.5">AI Recommended Price</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-signal-green/10 text-signal-green">
                      <ShieldCheck className="h-3.5 w-3.5" /> Visual Rating: {result.visualRating || 94}/100
                    </span>
                    <p className="text-[11px] text-black/40 mt-1">Based on Media Inspection</p>
                  </div>
                </div>

                {/* Media Analysis Note */}
                {result.mediaAnalysisNote && (
                  <div className="bg-coral/5 border border-coral/20 rounded-xl p-3.5 text-xs text-slate-850 font-medium leading-relaxed">
                    📸 <strong>AI Inspection Note:</strong> {result.mediaAnalysisNote}
                  </div>
                )}

                {/* Range cards */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-paper rounded-xl p-3 border border-black/5">
                    <p className="text-[11px] text-black/40 font-mono">Min Price</p>
                    <p className="font-display font-700 text-sm text-slate-850 mt-1">₹{result.minPrice?.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-paper rounded-xl p-3 border border-black/5">
                    <p className="text-[11px] text-black/40 font-mono">Max Price</p>
                    <p className="font-display font-700 text-sm text-slate-850 mt-1">₹{result.maxPrice?.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-paper rounded-xl p-3 border border-black/5">
                    <p className="text-[11px] text-black/40 font-mono">Quick Sale</p>
                    <p className="font-display font-700 text-sm text-slate-850 mt-1">₹{result.quickSalePrice?.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Market trend & demand */}
                <div className="flex justify-between items-center bg-paper rounded-xl p-4 border border-black/5 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                    <span className="text-black/60">Trend:</span>
                    <span className={`font-bold capitalize ${trendColor}`}>{result.marketTrend}</span>
                  </div>
                  <div>
                    <span className="text-black/60">Demand:</span>{" "}
                    <span className="font-bold text-slate-850 capitalize">{result.demandLevel}</span>
                  </div>
                </div>

                {/* Key Factors */}
                {result.factors?.length > 0 && (
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-2">Valuation Factors</p>
                    <ul className="space-y-1.5">
                      {result.factors.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-black/70">
                          <CheckCircle className="h-3.5 w-3.5 text-signal-green shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tip */}
                {result.tip && (
                  <div className="bg-paper border border-black/5 rounded-xl p-3.5 text-xs text-black/65">
                    <strong className="text-slate-850 font-display">Selling Tip:</strong> {result.tip}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-black/[0.07] rounded-2xl p-8 text-center text-black/40 text-sm">
                <Zap className="h-10 w-10 text-coral/40 mx-auto mb-3" />
                Fill in device details, upload 3 photos &amp; video link to generate instant AI market price report.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
