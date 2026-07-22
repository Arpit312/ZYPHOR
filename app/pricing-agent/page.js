"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Zap, CheckCircle } from "lucide-react";

const CONDITIONS = ["Superb", "Good", "Fair"];
const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Motorola", "Realme", "Vivo", "Oppo", "Nothing", "Google"];

export default function PricingAgentPage() {
  const [form, setForm] = useState({ brand: "Samsung", model: "Galaxy S23", storage: "128GB", ram: "8GB", condition: "Good", batteryHealth: 85, city: "Delhi" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TrendIcon = result?.marketTrend === "rising" ? TrendingUp : result?.marketTrend === "falling" ? TrendingDown : Minus;
  const trendColor = result?.marketTrend === "rising" ? "text-signal-green" : result?.marketTrend === "falling" ? "text-signal-red" : "text-signal-amber";

  return (
    <main className="bg-paper min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-signal-amber/10 text-signal-amber border border-signal-amber/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            AI Pricing Agent
          </div>
          <h1 className="font-display font-700 text-4xl text-slate-850">Get the perfect selling price</h1>
          <p className="text-black/50 mt-3">Our AI analyzes your device specs and current market trends to suggest the optimal price.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
            <h2 className="font-display font-600 text-lg text-slate-850 mb-5">Enter device details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black/60 mb-1">Brand</label>
                <select value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm bg-paper">
                  {BRANDS.map(b => <option key={b}>{b}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/60 mb-1">Model</label>
                <input value={form.model} onChange={e => setForm({...form, model: e.target.value})}
                  placeholder="e.g. Galaxy S23, iPhone 14" required
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm bg-paper" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black/60 mb-1">Storage</label>
                  <select value={form.storage} onChange={e => setForm({...form, storage: e.target.value})}
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm bg-paper">
                    {["64GB","128GB","256GB","512GB","1TB"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/60 mb-1">RAM</label>
                  <select value={form.ram} onChange={e => setForm({...form, ram: e.target.value})}
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm bg-paper">
                    {["4GB","6GB","8GB","12GB","16GB"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/60 mb-1">Condition</label>
                <div className="flex gap-2">
                  {CONDITIONS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, condition: c})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.condition === c ? "bg-coral text-white border-coral" : "border-black/10 text-black/60 hover:border-coral"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/60 mb-1">Battery Health: <strong>{form.batteryHealth}%</strong></label>
                <input type="range" min="50" max="100" value={form.batteryHealth}
                  onChange={e => setForm({...form, batteryHealth: Number(e.target.value)})}
                  className="w-full accent-coral" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/60 mb-1">City</label>
                <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                  placeholder="e.g. Mumbai" className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm bg-paper" />
              </div>
              {error && <p className="text-signal-red text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-coral hover:bg-coral-dark text-white font-display font-600 py-3 rounded-xl transition-colors disabled:opacity-60">
                {loading ? "Analyzing market…" : "Get Price Recommendation"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div>
            {!result && !loading && (
              <div className="bg-white border border-black/[0.07] rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="font-display font-600 text-lg text-slate-850">AI Price Analysis</h3>
                <p className="text-black/40 text-sm mt-2">Fill in device details and get an instant market-based price recommendation.</p>
              </div>
            )}
            {loading && (
              <div className="bg-white border border-black/[0.07] rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4 animate-pulse">🤖</div>
                <h3 className="font-display font-600 text-lg text-slate-850">Analyzing market data…</h3>
                <p className="text-black/40 text-sm mt-2">Checking current resale prices across India</p>
              </div>
            )}
            {result && (
              <div className="space-y-4">
                {/* Price cards */}
                <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-600 text-lg text-slate-850">Price Recommendation</h3>
                    <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                      <TrendIcon className="h-4 w-4" />
                      {result.marketTrend}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-paper rounded-xl p-4 text-center">
                      <p className="text-xs text-black/40 mb-1">Market Range</p>
                      <p className="font-display font-700 text-slate-850">₹{result.minPrice?.toLocaleString()} – ₹{result.maxPrice?.toLocaleString()}</p>
                    </div>
                    <div className="bg-coral/5 border border-coral/20 rounded-xl p-4 text-center">
                      <p className="text-xs text-coral mb-1">Recommended</p>
                      <p className="font-display font-700 text-2xl text-coral">₹{result.recommendedPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-signal-green/5 border border-signal-green/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-signal-green mb-0.5">Quick Sale Price</p>
                    <p className="font-display font-600 text-signal-green text-lg">₹{result.quickSalePrice?.toLocaleString()}</p>
                    <p className="text-xs text-black/30 mt-0.5">Sell faster — 10% below market</p>
                  </div>
                </div>

                {/* Factors */}
                <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
                  <h4 className="font-medium text-sm text-black/60 mb-3">Key Price Factors</h4>
                  <ul className="space-y-2">
                    {result.factors?.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-black/70">
                        <CheckCircle className="h-4 w-4 text-signal-green flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {result.tip && (
                    <div className="mt-4 bg-signal-amber/8 border border-signal-amber/20 rounded-lg p-3">
                      <p className="text-xs font-medium text-signal-amber mb-1">💡 Seller Tip</p>
                      <p className="text-sm text-black/70">{result.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
