"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ScanLine, Store, Users, Wrench, ShieldCheck, ArrowRight,
  UserCheck, Mail, Key, User, MapPin, Building, AlertCircle
} from "lucide-react";
import AIAgreementModal from "@/components/shared/AIAgreementModal";

const ROLES = [
  { value: "customer", label: "Buyer / Seller", icon: ShieldCheck, desc: "Buy or sell phones & spare parts" },
  { value: "retailer", label: "Retailer", icon: Store, desc: "List inventory & sell devices" },
  { value: "wholesaler", label: "Wholesaler", icon: Users, desc: "Bulk device & parts supply" },
  { value: "technician", label: "Technician", icon: Wrench, desc: "Verification & repair jobs" }
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
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
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
      // 1. Create User Document in MongoDB
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }

      // 2. Auto Sign-In with NextAuth Credentials
      await signIn("credentials", {
        redirect: false,
        email: form.email.trim(),
        password: form.password.trim(),
        role,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#07070C] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-10%] right-1/4 w-[600px] h-[500px] bg-gradient-to-b from-coral/15 via-purple-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 container-x py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-display font-800 text-xl tracking-tight text-white hover:opacity-90 transition-opacity">
          <div className="p-2 bg-coral/10 border border-coral/30 rounded-xl text-coral">
            <ScanLine className="h-5 w-5" />
          </div>
          <span>ZYPHOR<span className="text-coral">.</span></span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
          <UserCheck className="h-4 w-4 text-signal-green" />
          <span>Free Registration</span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 container-x py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          
          {/* Top Title Block */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="font-display font-800 text-3xl sm:text-4xl text-white tracking-tight">
              Join India's AI Mobile Ecosystem
            </h1>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Create your account in seconds to buy, sell, or repair verified smartphones.
            </p>
          </div>

          {/* Glass Card */}
          <div className="bg-[#0E0E17]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80">
            
            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2.5">
                  I want to register as
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-white/[0.08] border-coral text-white shadow-lg"
                            : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-coral" : "text-white/40"}`} />
                          <span className="font-display font-600 text-xs text-white">{r.label}</span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-tight">{r.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Arjun Sharma"
                      className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                    <input
                      type="text"
                      value={form.city}
                      onChange={set("city")}
                      placeholder="Bhopal / Delhi"
                      className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Business Name (for Retailer/Wholesaler) */}
              {["retailer", "wholesaler"].includes(role) && (
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
                    Business / Store Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={set("businessName")}
                      placeholder="TechZone Mobile Hub"
                      className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="arjun@zyphor.in"
                    className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
                  Password * (Min 8 Characters)
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    placeholder="••••••••••••"
                    className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 text-white font-display font-700 text-sm py-4 rounded-xl shadow-lg shadow-coral/20 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-mono">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Creating Free Account…
                  </span>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <Link
                href="/login"
                className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-600 text-sm py-3.5 rounded-xl transition-all"
              >
                Already Have an Account? Sign In
              </Link>
            </form>
          </div>
        </div>
      </main>

      <AIAgreementModal
        isOpen={showAgreement}
        userDetails={{ name: form.name, email: form.email, role, action: "signup" }}
        onAccept={completeSignup}
        onCancel={() => setShowAgreement(false)}
      />

      <footer className="relative z-10 py-6 border-t border-white/5 text-center text-xs font-mono text-white/30">
        © 2026 ZYPHOR Technologies. All rights reserved.
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070C] flex items-center justify-center text-white font-mono text-sm">
        Loading Signup Portal…
      </div>
    }>
      <SignupFormContent />
    </Suspense>
  );
}
