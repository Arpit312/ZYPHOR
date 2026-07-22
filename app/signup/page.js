"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanLine, Store, Users, Wrench, ShieldCheck } from "lucide-react";

import AIAgreementModal from "@/components/shared/AIAgreementModal";

const ROLES = [
  { value: "customer", label: "Buyer / Seller", icon: <ShieldCheck className="h-5 w-5" />, desc: "Buy or sell phones and parts" },
  { value: "retailer", label: "Retailer", icon: <Store className="h-5 w-5" />, desc: "Manage inventory & list devices" },
  { value: "wholesaler", label: "Wholesaler", icon: <Users className="h-5 w-5" />, desc: "Sell in bulk to retailers" },
  { value: "technician", label: "Technician", icon: <Wrench className="h-5 w-5" />, desc: "Accept verification & repair jobs" }
];

function SignupFormContent() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") || "customer");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", businessName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);
  const router = useRouter();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setShowAgreement(true);
  }

  async function completeSignup() {
    setLoading(true);
    setShowAgreement(false);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed."); return; }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-700 text-2xl text-slate-850 mb-2">
            <ScanLine className="h-6 w-6 text-signal-green" />
            ZYPHOR
          </Link>
          <h1 className="font-display font-700 text-xl text-slate-850 mt-4">Create your account</h1>
          <p className="text-black/50 text-sm mt-1">Join India&apos;s most trusted phone marketplace</p>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-white border border-black/[0.06] rounded-2xl p-7 shadow-sm space-y-5">

          {/* Role picker */}
          <div>
            <label className="block text-sm font-medium text-slate-850 mb-3">I want to join as</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`p-3 rounded-xl border text-left transition-colors ${role === r.value ? "border-coral bg-coral/5" : "border-black/10 hover:border-black/20"}`}>
                  <div className={`mb-1 ${role === r.value ? "text-coral" : "text-black/50"}`}>{r.icon}</div>
                  <p className="font-display font-600 text-sm text-slate-850">{r.label}</p>
                  <p className="text-xs text-black/45 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-850 mb-1.5">Full name</label>
              <input required type="text" value={form.name} onChange={set("name")} placeholder="Arjun Sharma"
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-850 mb-1.5">City</label>
              <input type="text" value={form.city} onChange={set("city")} placeholder="Bhopal"
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-850 mb-1.5">Email</label>
            <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
              className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30" />
          </div>

          {["retailer", "wholesaler"].includes(role) && (
            <div>
              <label className="block text-sm font-medium text-slate-850 mb-1.5">Business / shop name</label>
              <input type="text" value={form.businessName} onChange={set("businessName")} placeholder="e.g. TechZone Mobile Store"
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-850 mb-1.5">Password</label>
            <input required type="password" value={form.password} onChange={set("password")} placeholder="At least 8 characters"
              minLength={8}
              className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30" />
          </div>

          {error && <p className="text-sm text-signal-red bg-signal-red/8 border border-signal-red/20 rounded-lg px-4 py-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-coral hover:bg-coral-dark disabled:opacity-50 text-white font-display font-600 py-3 rounded-xl transition-colors focus-ring">
            {loading ? "Creating account…" : "Create account — free"}
          </button>
        </form>

        <p className="text-center text-xs text-black/40 mt-4">
          Already have an account? <Link href="/login" className="text-coral hover:underline font-medium">Log in</Link>
        </p>
      </div>

      <AIAgreementModal
        isOpen={showAgreement}
        userDetails={{ name: form.name, email: form.email, role, action: "signup" }}
        onAccept={completeSignup}
        onCancel={() => setShowAgreement(false)}
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-black/50">
        Loading Signup Portal…
      </div>
    }>
      <SignupFormContent />
    </Suspense>
  );
}

