"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ScanLine, Eye, EyeOff, User, Store, Building2, Wrench, ShieldCheck,
  Lock, ArrowRight, CheckCircle2, Sparkles, AlertCircle, Mail, Key
} from "lucide-react";
import AIAgreementModal from "@/components/shared/AIAgreementModal";

const ROLES = [
  {
    value: "customer",
    label: "Customer / Buyer",
    badge: "Personal",
    icon: User,
    desc: "Browse & buy AI-verified phones & spare parts",
    accent: "coral",
    glowColor: "from-coral/20 to-amber-500/10",
    borderActive: "border-coral text-coral",
  },
  {
    value: "retailer",
    label: "Retailer Store",
    badge: "B2C Business",
    icon: Store,
    desc: "List devices, manage inventory & accept orders",
    accent: "signal-green",
    glowColor: "from-signal-green/20 to-emerald-500/10",
    borderActive: "border-signal-green text-signal-green",
  },
  {
    value: "wholesaler",
    label: "Wholesaler",
    badge: "Bulk B2B",
    icon: Building2,
    desc: "Bulk device supply & wholesale parts distribution",
    accent: "signal-amber",
    glowColor: "from-signal-amber/20 to-yellow-500/10",
    borderActive: "border-signal-amber text-signal-amber",
  },
  {
    value: "technician",
    label: "Technician / Repair",
    badge: "Services",
    icon: Wrench,
    desc: "Accept repair jobs & offer spare parts installation",
    accent: "purple-400",
    glowColor: "from-purple-500/20 to-indigo-500/10",
    borderActive: "border-purple-400 text-purple-400",
  },
  {
    value: "admin",
    label: "Master Administrator",
    badge: "Control",
    icon: Lock,
    desc: "Platform governance, user access & system controls",
    accent: "signal-red",
    glowColor: "from-signal-red/20 to-rose-500/10",
    borderActive: "border-signal-red text-signal-red",
    hidden: true
  }
];

// Quick demo login helper accounts
const DEMO_ACCOUNTS = [
  { role: "customer", email: "customer@zyphor.in", label: "Customer" },
  { role: "retailer", email: "retailer@zyphor.in", label: "Retailer" },
  { role: "wholesaler", email: "wholesaler@zyphor.in", label: "Wholesaler" },
  { role: "technician", email: "tech@zyphor.in", label: "Technician" },
  { role: "admin", email: "admin@zyphor.in", label: "Admin" },
];

function LoginFormContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const publicRoles = ROLES.filter(r => !r.hidden);
  const activeRoleObj = ROLES.find(r => r.value === selectedRole) || ROLES[0];

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your registered email address and password.");
      return;
    }
    setError("");
    setShowAgreement(true);
  }

  function applyDemoAccount(account) {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword("Password@123");
    setError("");
  }

  async function completeLogin() {
    setLoading(true);
    setShowAgreement(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim(), role: selectedRole })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please verify your email and password.");
        return;
      }

      const next = searchParams.get("next") || searchParams.get("redirect") || "/dashboard";
      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(next);
      }
      router.refresh();
    } catch (err) {
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07070C] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-coral/15 via-purple-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 container-x py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-display font-800 text-xl tracking-tight text-white hover:opacity-90 transition-opacity">
          <div className="p-2 bg-coral/10 border border-coral/30 rounded-xl text-coral">
            <ScanLine className="h-5 w-5" />
          </div>
          <span>ZYPHOR<span className="text-coral">.</span></span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
          <ShieldCheck className="h-4 w-4 text-signal-green" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 container-x py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          
          {/* Top Title Block */}
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs font-mono font-semibold px-4 py-1.5 rounded-full mb-2">
              <Sparkles className="h-3.5 w-3.5 text-coral" />
              Unified Access Portal
            </div>
            <h1 className="font-display font-800 text-3xl sm:text-4xl text-white tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Select your role and enter credentials to access your verified dashboard.
            </p>
          </div>

          {/* Glass Card */}
          <div className="bg-[#0E0E17]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80 relative">
            
            {/* Quick Demo Login Preset Bar */}
            <div className="mb-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
              <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest mb-2 px-1">
                ⚡ Demo 1-Click Login Fill:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => applyDemoAccount(acc)}
                    className={`text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
                      selectedRole === acc.role
                        ? "bg-coral/20 border-coral text-coral font-bold"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-3">
                  Account Type / Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {publicRoles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setSelectedRole(r.value); setError(""); }}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 text-center ${
                          isSelected
                            ? `bg-white/[0.08] ${r.borderActive} shadow-lg shadow-black/50 scale-[1.02]`
                            : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white hover:border-white/20"
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? "text-coral" : "text-white/40"}`} />
                        <span className="font-display font-600 text-xs text-white leading-tight mb-0.5">
                          {r.label.split(" ")[0]}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">{r.badge}</span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-coral border-2 border-[#0E0E17]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Role Description Box */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-white/60 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-signal-green shrink-0" />
                  <span>{activeRoleObj.desc}</span>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@zyphor.in"
                    className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-white/50 uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-mono text-coral hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#141422] border border-white/10 focus:border-coral rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-3.5 text-white/30 hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 text-white font-display font-700 text-sm py-4 rounded-xl shadow-lg shadow-coral/20 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-mono">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Authenticating Session…
                  </span>
                ) : (
                  <>
                    <span>Sign In as {activeRoleObj.label}</span>
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

              {/* Signup Redirect Button */}
              <Link
                href="/signup"
                className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-600 text-sm py-3.5 rounded-xl transition-all"
              >
                Create New Free Account
              </Link>
            </form>
          </div>

          {/* Footer Security Badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs font-mono text-white/40">
            <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl">
              <span className="block text-white font-semibold">🔒 Encrypted</span>
              <span>AES-256 Auth</span>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl">
              <span className="block text-white font-semibold">⚡ AI Verified</span>
              <span>Anti-Fraud System</span>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl">
              <span className="block text-white font-semibold">📱 Single Sign-On</span>
              <span>Web & Mobile Ready</span>
            </div>
          </div>
        </div>
      </main>

      {/* AI Agreement Modal */}
      <AIAgreementModal
        isOpen={showAgreement}
        userDetails={{ email, role: selectedRole, action: "login" }}
        onAccept={completeLogin}
        onCancel={() => setShowAgreement(false)}
      />

      {/* Simple Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5 text-center text-xs font-mono text-white/30">
        © 2026 ZYPHOR Technologies. All rights reserved.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070C] flex items-center justify-center text-white font-mono text-sm">
        Loading Access Portal…
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
