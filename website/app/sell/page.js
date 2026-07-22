"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ScanLine, Loader2, AlertTriangle } from "lucide-react";
import Container from "@/components/shared/Container";
import TrustBadge from "@/components/shared/TrustBadge";

const STEPS = ["Basic Info", "Condition", "Verification", "Preview & Submit"];
const BRANDS = ["Apple", "Samsung", "Xiaomi", "OnePlus", "Vivo", "Oppo", "Realme", "Poco", "Motorola", "Nokia", "Other"];
const CATEGORIES = [
  { value: "Smartphone", label: "Smartphone" },
  { value: "Tablet", label: "Tablet" },
  { value: "Smartwatch", label: "Smartwatch" }
];

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-850 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-black/45">{hint}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50 ${className}`}
      {...props}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 bg-white"
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
    <section className="py-12">
      <Container className="max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display font-700 text-3xl text-slate-850">List your device</h1>
          <p className="text-black/55 mt-1 text-sm">AI verification included — free, takes under 2 minutes.</p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${i < step ? "bg-signal-green text-white" : i === step ? "bg-ink text-white" : "bg-black/[0.06] text-black/40"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-[11px] font-mono text-center hidden sm:block ${i === step ? "text-slate-850 font-medium" : "text-black/40"}`}>{s}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-black/[0.06] rounded-2xl p-7 shadow-sm">

          {/* STEP 0 – Basic Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display font-600 text-lg text-slate-850">Basic information</h2>

              <Field label="Product Images" hint="Upload clear images of your product (At least one is required)">
                <div className="flex flex-wrap gap-4 items-center mt-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-black/10">
                      <img src={img} alt="Product" className="object-cover w-full h-full" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-signal-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-signal-red-600 transition-colors">×</button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed border-black/20 rounded-lg flex flex-col items-center justify-center text-black/50 hover:bg-black/5 hover:border-black/30 cursor-pointer transition-colors">
                    {uploadingImage ? <Loader2 size={24} className="animate-spin text-coral" /> : <ScanLine size={24} />}
                    <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">{uploadingImage ? "Uploading" : "Upload"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
              </Field>

              <Field label="Listing type">
                <div className="flex gap-2">
                  {["device", "part"].map((t) => (
                    <button key={t} onClick={() => set("listingType", t)}
                      className={`flex-1 py-2.5 text-sm rounded-lg border capitalize transition-colors ${form.listingType === t ? "bg-ink text-white border-ink" : "border-black/10 text-black/65 hover:border-ink/30"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              {form.listingType === "device" && (
                <Field label="Category">
                  <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Select>
                </Field>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Brand">
                  <Select value={form.brand} onChange={(e) => set("brand", e.target.value)}>
                    <option value="">Select brand</option>
                    {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </Select>
                </Field>
                <Field label="Model">
                  <Input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. iPhone 14" />
                </Field>
              </div>
              <Field label="Listing title" hint="A clear title helps buyers find your listing faster.">
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Apple iPhone 14 128GB – Superb condition" />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={3} placeholder="Describe the phone honestly — usage, accessories included, reason for selling…"
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-coral/30" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Asking price (₹)">
                  <div className="relative">
                    <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="15000" />
                    <button type="button" onClick={getAiPrice} disabled={fetchingPrice} className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-xs font-semibold flex items-center gap-1 transition-colors">
                      {fetchingPrice ? <Loader2 size={12} className="animate-spin" /> : "AI Price"}
                    </button>
                  </div>
                  {aiPrice && (
                    <div className="mt-2 text-xs bg-indigo-50 text-indigo-800 p-2 rounded-lg border border-indigo-100">
                      <p><strong>AI Suggestion:</strong> ₹{aiPrice.recommendedPrice.toLocaleString()} (Min: ₹{aiPrice.minPrice.toLocaleString()} - Max: ₹{aiPrice.maxPrice.toLocaleString()})</p>
                      <button type="button" onClick={() => set("price", aiPrice.recommendedPrice.toString())} className="text-indigo-600 font-semibold underline mt-1">Use suggested price</button>
                    </div>
                  )}
                </Field>
                <Field label="Original price (₹)" hint="Optional — helps show savings">
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
              <Field label="City">
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Bhopal" />
              </Field>
            </div>
          )}

          {/* STEP 1 – Condition */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display font-600 text-lg text-slate-850">Condition details</h2>
              <Field label="Condition grade">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { grade: "Superb", desc: "Like new, no marks" },
                    { grade: "Good", desc: "Minor cosmetic wear" },
                    { grade: "Fair", desc: "Visible wear, fully working" }
                  ].map(({ grade, desc }) => (
                    <button key={grade} onClick={() => set("conditionGrade", grade)}
                      className={`p-3 rounded-xl border text-left transition-colors ${form.conditionGrade === grade ? "border-coral bg-coral/5" : "border-black/10 hover:border-black/20"}`}>
                      <p className="font-display font-600 text-sm">{grade}</p>
                      <p className="text-xs text-black/50 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Describe the condition honestly" hint="Be specific — mention scratches, battery health, missing accessories. Honest sellers get higher trust scores.">
                <textarea value={form.conditionClaim} onChange={(e) => set("conditionClaim", e.target.value)}
                  rows={4} placeholder="e.g. Used for 8 months. Battery health 89%. Minor scuff on the bottom-left corner. Comes with original charger and box."
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-coral/30" />
              </Field>
              <Field label="IMEI (15 digits)" hint="Dial *#06# on the phone. A valid IMEI adds 10+ points to your trust score.">
                <div className="relative">
                  <Input type="text" inputMode="numeric" maxLength={15}
                    value={form.imei} onChange={(e) => set("imei", e.target.value.replace(/\D/g, "").slice(0, 15))}
                    placeholder="Enter 15-digit IMEI" className="font-mono tracking-wider" />
                  <button type="button" onClick={checkImei} disabled={checkingImei || form.imei.length < 15} className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50">
                    {checkingImei ? <Loader2 size={12} className="animate-spin" /> : "AI Verify"}
                  </button>
                </div>
                {imeiStatus && (
                  <div className={`mt-2 text-xs p-2 rounded-lg border ${imeiStatus.valid ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
                    <p><strong>AI Analysis:</strong> {imeiStatus.message}</p>
                    {imeiStatus.ceirStatus && <p className="mt-0.5">CEIR Status: <span className="capitalize">{imeiStatus.ceirStatus}</span></p>}
                  </div>
                )}
              </Field>
              <Field label="Battery health %" hint="Go to Settings → Battery → Battery Health. Higher = more trust score.">
                <Input type="number" min={1} max={100}
                  value={form.batteryHealth} onChange={(e) => set("batteryHealth", e.target.value)}
                  placeholder="e.g. 89" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Photos submitted" hint="Up to 5 — front, back, sides, screen-on">
                  <Select value={form.photoCount} onChange={(e) => set("photoCount", e.target.value)}>
                    {[0,1,2,3,4,5].map((n) => <option key={n} value={n}>{n} photo{n !== 1 ? "s" : ""}</option>)}
                  </Select>
                </Field>
                <Field label="Video evidence" hint="Speaker test, screen touch test">
                  <Select value={form.videoCount} onChange={(e) => set("videoCount", e.target.value)}>
                    {[0,1,2,3].map((n) => <option key={n} value={n}>{n} video{n !== 1 ? "s" : ""}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="CEIR / IMEI blacklist status" hint="Check at ceir.gov.in or SMS KYM IMEI to 14422 before listing.">
                <Select value={form.ceir} onChange={(e) => set("ceir", e.target.value)}>
                  <option value="unknown">Unknown (not checked yet)</option>
                  <option value="white">White — clean and safe ✓</option>
                  <option value="grey">Grey — pending review</option>
                  <option value="black">Black — blocked / stolen ✗</option>
                </Select>
              </Field>
            </div>
          )}

          {/* STEP 2 – Verification */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display font-600 text-lg text-slate-850">AI Verification</h2>
              <p className="text-sm text-black/60 leading-relaxed">
                Our AI Verification Agent will now analyze your submitted details and compute a Trust Score.
                This score appears on your listing and helps buyers feel confident. It takes about 5 seconds.
              </p>

              {!verification && !verifying && (
                <button onClick={runVerification}
                  className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink-700 text-white font-display font-600 py-4 rounded-xl transition-colors focus-ring">
                  <ScanLine className="h-5 w-5 text-signal-green" />
                  Run AI Verification now
                </button>
              )}

              {verifying && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <Loader2 className="h-10 w-10 text-coral animate-spin" />
                  <p className="text-sm text-black/60 font-mono">Analyzing evidence… this takes 5–10 seconds</p>
                </div>
              )}

              {verification && (
                <div className="space-y-4">
                  <TrustBadge score={verification.trustScore} status={verification.status} size={72} />
                  {verification.aiSummary && (
                    <p className="text-sm text-black/65 leading-relaxed bg-paper rounded-xl p-4">
                      {verification.aiSummary}
                    </p>
                  )}
                  {verification.flags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {verification.flags.map((f) => (
                        <span key={f} className="text-xs font-mono px-2 py-1 bg-signal-amber/10 text-signal-amber border border-signal-amber/25 rounded">
                          {f.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                  {verification.status === "failed" && (
                    <div className="flex gap-2 text-sm text-signal-red bg-signal-red/8 border border-signal-red/20 rounded-xl px-4 py-3">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      This listing cannot be published. Please fix the issues above and re-verify.
                    </div>
                  )}
                  {verification.status !== "failed" && (
                    <p className="text-xs text-black/45 font-mono">
                      You can proceed to publish. {verification.status === "needs_review" ? "A team member will review before the listing goes live." : "Your listing will go live immediately."}
                    </p>
                  )}
                  <button onClick={runVerification} className="text-sm text-coral hover:underline focus-ring">
                    Re-run verification
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 – Preview */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display font-600 text-lg text-slate-850">Review &amp; publish</h2>
              <div className="bg-paper rounded-xl p-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-black/50">Brand / Model</span><span className="font-medium">{form.brand} {form.model}</span></div>
                <div className="flex justify-between"><span className="text-black/50">Category</span><span className="font-medium">{form.category}</span></div>
                <div className="flex justify-between"><span className="text-black/50">Price</span><span className="font-display font-700 text-slate-850">₹{Number(form.price).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-black/50">Condition</span><span className="font-medium">{form.conditionGrade}</span></div>
                {form.city && <div className="flex justify-between"><span className="text-black/50">City</span><span className="font-medium">{form.city}</span></div>}
              </div>
              {verification && (
                <TrustBadge score={verification.trustScore} status={verification.status} size={56} />
              )}
              <button
                onClick={submit}
                disabled={submitting || verification?.status === "failed"}
                className="w-full bg-coral hover:bg-coral-dark disabled:opacity-50 text-white font-display font-700 py-4 rounded-xl transition-colors focus-ring text-base"
              >
                {submitting ? "Publishing…" : "Publish listing"}
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-signal-red bg-signal-red/8 border border-signal-red/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {/* Nav buttons */}
          <div className="mt-7 flex gap-3">
            {step > 0 && (
              <button onClick={back} className="flex-1 border border-black/10 rounded-xl py-3 text-sm font-medium hover:bg-paper transition-colors focus-ring">
                Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={next}
                disabled={step === 2 && (!verification || verification.status === "failed")}
                className="flex-1 bg-ink hover:bg-ink-700 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-medium transition-colors focus-ring"
              >
                {step === 1 ? "Continue to verification" : "Continue"}
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
