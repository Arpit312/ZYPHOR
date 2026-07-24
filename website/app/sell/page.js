"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ScanLine, Loader2, AlertTriangle, Sparkles, ShieldCheck, Upload, Trash2, ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import TrustBadge from "@/components/shared/TrustBadge";

const STEPS = ["Basic Info", "Condition", "AI Verification", "Review & Publish"];
const BRANDS = ["Apple", "Samsung", "Xiaomi", "OnePlus", "Vivo", "Oppo", "Realme", "Poco", "Motorola", "Nokia", "Other"];
const CATEGORIES = [
  { value: "Smartphone", label: "Smartphone" },
  { value: "Tablet", label: "Tablet" },
  { value: "Smartwatch", label: "Smartwatch" }
];

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-mono text-white/60 uppercase tracking-wider mb-2">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-white/40">{hint}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-coral transition-all ${className}`}
      {...props}
    />
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-coral transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    listingType: "device", category: "Smartphone", brand: "", model: "",
    title: "", description: "", price: "", originalPrice: "",
    conditionGrade: "Good", conditionClaim: "", imei: "", storage: "",
    ram: "", city: "", batteryHealth: "", photoCount: "2", videoCount: "1",
    ceir: "unknown", emiEligible: true, tags: [], images: []
  });
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [aiPrice, setAiPrice] = useState(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [imeiStatus, setImeiStatus] = useState(null);
  const [checkingImei, setCheckingImei] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const next = () => { setError(""); setStep((s) => Math.min(s + 1, 3)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  async function runVerification() {
    setVerifying(true); setError("");
    try {
      const res = await fetch("/api/ai/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionClaim: form.conditionClaim, conditionGrade: form.conditionGrade,
          imei: form.imei, batteryHealth: form.batteryHealth ? Number(form.batteryHealth) : null,
          photoCount: Number(form.photoCount), videoCount: Number(form.videoCount),
          price: Number(form.price), brand: form.brand, model: form.model, ceir: form.ceir
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setVerification(data.verification);
    } catch (e) { setError(e.message); }
    finally { setVerifying(false); }
  }

  async function submit() {
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || undefined, verification })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { router.push("/login?next=/sell"); return; }
        throw new Error(data.error || "Failed to create listing");
      }
      router.push(`/marketplace/${data.listing._id}`);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  async function getAiPrice() {
    if (!form.brand || !form.model) {
      setError("Please enter brand and model to get a price suggestion.");
      return;
    }
    setFetchingPrice(true);
    setError("");
    try {
      const res = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          brand: form.brand, model: form.model, 
          storage: form.storage, ram: form.ram, 
          condition: form.conditionGrade, city: form.city 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch AI price");
      setAiPrice(data);
    } catch (e) { setError(e.message); }
    finally { setFetchingPrice(false); }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      
      if (res.ok) {
        set("images", [...form.images, data.url]);
      } else {
        setError("Upload failed: " + data.error);
      }
    } catch (err) {
      setError("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage(index) {
    set("images", form.images.filter((_, i) => i !== index));
  }

  async function checkImei() {
    if (!form.imei || form.imei.length < 15) {
      setError("Please enter a valid 15-digit IMEI.");
      return;
    }
    setCheckingImei(true);
    setError("");
    try {
      const res = await fetch("/api/ai/verify-imei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imei: form.imei })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check IMEI");
      setImeiStatus(data);
      if (data.ceirStatus) set("ceir", data.ceirStatus);
    } catch (e) { setError(e.message); }
    finally { setCheckingImei(false); }
  }

  return (
    <div className="min-h-screen bg-[#07070C] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-coral/15 via-purple-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 py-12">
        <Container className="max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs font-mono font-semibold px-4 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-coral" />
              AI-Guided Listing Portal
            </div>
            <h1 className="font-display font-800 text-3xl sm:text-5xl text-white tracking-tight">
              Sell Your Device on <span className="text-coral">ZYPHOR</span>
            </h1>
            <p className="text-white/50 text-sm max-w-lg mx-auto">
              Automated AI verification, CEIR blacklist check, and instant valuation — free & takes under 2 minutes.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                <div 
                  className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    i < step 
                      ? "bg-signal-green text-white shadow-lg shadow-signal-green/20" 
                      : i === step 
                      ? "bg-coral text-white shadow-lg shadow-coral/30 border border-coral" 
                      : "bg-white/5 border border-white/10 text-white/40"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-[11px] font-mono text-center hidden sm:block ${i === step ? "text-coral font-semibold" : "text-white/40"}`}>{s}</span>
              </div>
            ))}
          </div>

          {/* Main Form Glass Card */}
          <div className="bg-[#0E0E17]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative">

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm font-medium">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* STEP 0 – Basic Info */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="font-display font-700 text-xl text-white">Basic Information</h2>

                <Field label="Product Images" hint="Upload clear images of your device (Front, Back, Sides)">
                  <div className="flex flex-wrap gap-4 items-center mt-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 group">
                        <img src={img} alt="Product" className="object-cover w-full h-full" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)} 
                          className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 border-2 border-dashed border-white/20 hover:border-coral/60 rounded-2xl flex flex-col items-center justify-center text-white/50 hover:text-white hover:bg-white/5 cursor-pointer transition-all">
                      {uploadingImage ? <Loader2 size={24} className="animate-spin text-coral" /> : <Upload size={20} />}
                      <span className="text-[10px] font-mono mt-1.5 uppercase tracking-wider">{uploadingImage ? "Uploading..." : "Upload"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </Field>

                <Field label="Listing Type">
                  <div className="flex gap-3">
                    {["device", "part"].map((t) => (
                      <button 
                        key={t} 
                        type="button"
                        onClick={() => set("listingType", t)}
                        className={`flex-1 py-3 text-sm font-display font-600 rounded-xl border capitalize transition-all ${
                          form.listingType === t 
                            ? "bg-coral border-coral text-white shadow-lg shadow-coral/20" 
                            : "bg-[#141422] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                        }`}
                      >
                        {t === "device" ? "📱 Full Device" : "🔧 Spare Part"}
                      </button>
                    ))}
                  </div>
                </Field>

                {form.listingType === "device" && (
                  <Field label="Category">
                    <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-[#141422]">{c.label}</option>)}
                    </Select>
                  </Field>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Brand">
                    <Select value={form.brand} onChange={(e) => set("brand", e.target.value)}>
                      <option value="" className="bg-[#141422]">Select brand</option>
                      {BRANDS.map((b) => <option key={b} value={b} className="bg-[#141422]">{b}</option>)}
                    </Select>
                  </Field>
                  <Field label="Model">
                    <Input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. iPhone 14 Pro Max" />
                  </Field>
                </div>

                <Field label="Listing Title" hint="A clear title helps buyers find your listing faster.">
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Apple iPhone 14 128GB – Superb condition with box" />
                </Field>

                <Field label="Description">
                  <textarea 
                    value={form.description} 
                    onChange={(e) => set("description", e.target.value)}
                    rows={3} 
                    placeholder="Describe the phone honestly — usage duration, accessories included, reason for selling…"
                    className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-coral transition-all resize-none" 
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Asking Price (₹)">
                    <div className="relative">
                      <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="15000" />
                      <button 
                        type="button" 
                        onClick={getAiPrice} 
                        disabled={fetchingPrice} 
                        className="absolute right-2 top-2 bottom-2 px-3 bg-coral/20 text-coral hover:bg-coral/30 border border-coral/30 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all"
                      >
                        {fetchingPrice ? <Loader2 size={12} className="animate-spin" /> : "⚡ AI Price"}
                      </button>
                    </div>
                    {aiPrice && (
                      <div className="mt-2 text-xs bg-white/5 text-coral p-3 rounded-xl border border-coral/30">
                        <p><strong>AI Recommended:</strong> ₹{aiPrice.recommendedPrice.toLocaleString()} (Min: ₹{aiPrice.minPrice.toLocaleString()} - Max: ₹{aiPrice.maxPrice.toLocaleString()})</p>
                        <button type="button" onClick={() => set("price", aiPrice.recommendedPrice.toString())} className="text-white font-semibold underline mt-1 block">Apply suggested price</button>
                      </div>
                    )}
                  </Field>

                  <Field label="Original Price (₹)" hint="Optional — shows buyer discount">
                    <Input type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="22000" />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Storage">
                    <Input value={form.storage} onChange={(e) => set("storage", e.target.value)} placeholder="128GB" />
                  </Field>
                  <Field label="RAM">
                    <Input value={form.ram} onChange={(e) => set("ram", e.target.value)} placeholder="6GB" />
                  </Field>
                </div>

                <Field label="City / Location">
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Mumbai, Bhopal, Delhi" />
                </Field>
              </div>
            )}

            {/* STEP 1 – Condition */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display font-700 text-xl text-white">Condition & IMEI Screening</h2>
                
                <Field label="Condition Grade">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { grade: "Superb", desc: "Like new, zero scratches" },
                      { grade: "Good", desc: "Minor cosmetic wear" },
                      { grade: "Fair", desc: "Visible wear, 100% working" }
                    ].map(({ grade, desc }) => (
                      <button 
                        key={grade} 
                        type="button"
                        onClick={() => set("conditionGrade", grade)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          form.conditionGrade === grade 
                            ? "border-coral bg-coral/10 text-white shadow-lg shadow-coral/10" 
                            : "border-white/10 bg-[#141422] text-white/60 hover:border-white/20"
                        }`}
                      >
                        <p className="font-display font-700 text-sm text-white">{grade}</p>
                        <p className="text-xs text-white/50 mt-1">{desc}</p>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Honest Condition Claim" hint="Mention any hairline scratches, battery health, or missing accessories. Honest listings get higher Trust Scores.">
                  <textarea 
                    value={form.conditionClaim} 
                    onChange={(e) => set("conditionClaim", e.target.value)}
                    rows={4} 
                    placeholder="e.g. Used for 8 months. Battery health 89%. Minor scuff on bottom edge. Includes original box & charger."
                    className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-coral transition-all resize-none" 
                  />
                </Field>

                <Field label="15-Digit IMEI Number" hint="Dial *#06# on phone. A verified clean IMEI adds +10 Trust Score.">
                  <div className="relative">
                    <Input 
                      type="text" 
                      inputMode="numeric" 
                      maxLength={15}
                      value={form.imei} 
                      onChange={(e) => set("imei", e.target.value.replace(/\D/g, "").slice(0, 15))}
                      placeholder="Enter 15-digit IMEI" 
                      className="font-mono tracking-wider" 
                    />
                    <button 
                      type="button" 
                      onClick={checkImei} 
                      disabled={checkingImei || form.imei.length < 15} 
                      className="absolute right-2 top-2 bottom-2 px-3 bg-signal-green/20 text-signal-green hover:bg-signal-green/30 border border-signal-green/30 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      {checkingImei ? <Loader2 size={12} className="animate-spin" /> : "⚡ Check CEIR"}
                    </button>
                  </div>
                  {imeiStatus && (
                    <div className={`mt-2.5 text-xs p-3 rounded-xl border ${imeiStatus.valid ? 'bg-signal-green/10 text-signal-green border-signal-green/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                      <p><strong>AI Status:</strong> {imeiStatus.message}</p>
                      {imeiStatus.ceirStatus && <p className="mt-1 font-mono uppercase">CEIR Database Status: {imeiStatus.ceirStatus}</p>}
                    </div>
                  )}
                </Field>

                <Field label="Battery Health %" hint="Check Settings → Battery → Battery Health">
                  <Input 
                    type="number" 
                    min={1} 
                    max={100}
                    value={form.batteryHealth} 
                    onChange={(e) => set("batteryHealth", e.target.value)}
                    placeholder="e.g. 89" 
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Photos Uploaded">
                    <Select value={form.photoCount} onChange={(e) => set("photoCount", e.target.value)}>
                      {[0,1,2,3,4,5].map((n) => <option key={n} value={n} className="bg-[#141422]">{n} Photo{n !== 1 ? "s" : ""}</option>)}
                    </Select>
                  </Field>
                  <Field label="Video Evidence">
                    <Select value={form.videoCount} onChange={(e) => set("videoCount", e.target.value)}>
                      {[0,1,2,3].map((n) => <option key={n} value={n} className="bg-[#141422]">{n} Video{n !== 1 ? "s" : ""}</option>)}
                    </Select>
                  </Field>
                </div>
              </div>
            )}

            {/* STEP 2 – Verification */}
            {step === 2 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-coral/10 border border-coral/30 flex items-center justify-center text-coral mx-auto">
                  <ScanLine className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="font-display font-800 text-2xl text-white">AI Trust Score Verification</h2>
                  <p className="text-white/50 text-sm max-w-md mx-auto mt-2 leading-relaxed">
                    Our AI Verification Agent will analyze your evidence and compute a Trust Score (0–100) for buyers.
                  </p>
                </div>

                {!verification && !verifying && (
                  <button 
                    type="button"
                    onClick={runVerification}
                    className="w-full bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 text-white font-display font-700 text-base py-4 rounded-2xl shadow-lg shadow-coral/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ScanLine className="h-5 w-5" />
                    Compute AI Trust Score Now
                  </button>
                )}

                {verifying && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <Loader2 className="h-12 w-12 text-coral animate-spin" />
                    <p className="text-sm text-white/60 font-mono">AI analyzing evidence & CEIR blacklist status...</p>
                  </div>
                )}

                {verification && (
                  <div className="space-y-5 bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
                    <div className="flex items-center justify-center">
                      <TrustBadge score={verification.trustScore} status={verification.status} size={72} />
                    </div>
                    {verification.aiSummary && (
                      <p className="text-sm text-white/80 leading-relaxed bg-[#141422] rounded-xl p-4 border border-white/10 font-mono">
                        {verification.aiSummary}
                      </p>
                    )}
                    {verification.status === "failed" && (
                      <div className="flex gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        Verification failed. Please revise listing details.
                      </div>
                    )}
                    <button type="button" onClick={runVerification} className="text-xs font-mono text-coral hover:underline block mx-auto">
                      Re-run AI Verification
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 – Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display font-700 text-xl text-white">Review &amp; Publish Listing</h2>
                
                <div className="bg-[#141422] border border-white/10 rounded-2xl p-6 space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 font-mono">Brand &amp; Model</span>
                    <span className="font-semibold text-white">{form.brand} {form.model}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 font-mono">Asking Price</span>
                    <span className="font-display font-800 text-coral text-base">₹{Number(form.price || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 font-mono">Condition Grade</span>
                    <span className="font-semibold text-white">{form.conditionGrade}</span>
                  </div>
                  {form.city && (
                    <div className="flex justify-between">
                      <span className="text-white/40 font-mono">City</span>
                      <span className="font-semibold text-white">{form.city}</span>
                    </div>
                  )}
                </div>

                {verification && (
                  <div className="flex justify-center">
                    <TrustBadge score={verification.trustScore} status={verification.status} size={64} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting || verification?.status === "failed"}
                  className="w-full bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 disabled:opacity-50 text-white font-display font-700 py-4 rounded-2xl shadow-lg shadow-coral/20 transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2 font-mono">
                      <Loader2 className="h-5 w-5 animate-spin" /> Publishing to Marketplace...
                    </span>
                  ) : (
                    <>
                      <span>Publish Listing Now</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="mt-8 flex gap-3 pt-4 border-t border-white/10">
              {step > 0 && (
                <button 
                  type="button" 
                  onClick={back} 
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3.5 text-sm font-display font-600 transition-all"
                >
                  Back
                </button>
              )}
              {step < 3 && (
                <button
                  type="button"
                  onClick={next}
                  disabled={step === 2 && (!verification || verification.status === "failed")}
                  className="flex-1 bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 disabled:opacity-40 text-white rounded-xl py-3.5 text-sm font-display font-700 shadow-lg shadow-coral/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>{step === 1 ? "Continue to AI Verification" : "Continue"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>
        </Container>
      </div>
    </div>
  );
}
