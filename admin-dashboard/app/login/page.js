"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle2, 
  Cpu, 
  Activity, 
  Layers, 
  ArrowRight
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Unable to connect to the authentication service: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050608] text-white flex flex-col lg:flex-row select-none">
      
      {/* ─── LEFT BRAND & GOVERNANCE CANVAS (Desktop 58%) ─── */}
      <div className="relative flex-1 bg-gradient-to-br from-[#090A0F] via-[#050608] to-[#040405] p-6 sm:p-10 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-800/60">
        
        {/* Subtle Ambient Background Gradients & Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />
        <div className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-white/[0.02] rounded-full blur-[130px] pointer-events-none" />

        {/* Top Header: Official Logo + Security Status */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center border border-white/20 shadow-inner">
              <Image 
                src="/symbol-white.png" 
                alt="ZYPHOR Symbol" 
                width={30} 
                height={30} 
                className="object-contain" 
                priority 
              />
            </div>
            <div>
              <span className="font-black tracking-widest text-base text-white">ZYPHOR</span>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Master Admin Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure Connection</span>
          </div>
        </div>

        {/* Center Content: Executive Product Narrative */}
        <div className="relative z-10 my-12 lg:my-auto max-w-xl space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-semibold tracking-wider text-gray-300">
              <Shield size={12} className="text-white" />
              <span>Official Admin Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
              Platform Command &amp;
              <br />
              <span className="text-gray-400">Operations Control.</span>
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed font-normal pt-1">
              Central administration suite for ZYPHOR. Manage multi-role user accounts, verify certified device catalogs, dispatch doorstep repairs, and oversee escrow transactions.
            </p>
          </div>

          {/* Module Highlight Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm space-y-1.5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-white">
                <Layers size={16} className="text-gray-300" />
                <span className="text-xs font-bold">Role Governance</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Manage Customers, Retailers, Wholesalers, and Technicians.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm space-y-1.5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-white">
                <Cpu size={16} className="text-gray-300" />
                <span className="text-xs font-bold">Catalog Screening</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Automated device verification and IMEI security checks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm space-y-1.5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-white">
                <Activity size={16} className="text-gray-300" />
                <span className="text-xs font-bold">Session Security</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Real-time login governance with instant session management.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Platform Metrics & Compliance */}
        <div className="relative z-10 pt-6 border-t border-gray-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-gray-500 gap-2">
          <span>&copy; {new Date().getFullYear()} ZYPHOR Inc. All rights reserved.</span>
          <span>Enterprise Security &amp; Compliance</span>
        </div>
      </div>

      {/* ─── RIGHT LOGIN PORTAL (Desktop 42%) ─── */}
      <div className="w-full lg:w-[480px] xl:w-[540px] bg-[#0A0B10] p-6 sm:p-10 lg:p-16 flex flex-col justify-center relative shadow-2xl">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-white/5 text-gray-300 border border-white/10 inline-block">
              Administrator Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Suite
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Enter your authorized email and password to continue.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-gray-300 uppercase font-bold text-[10px] tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@zyphor.in"
                  className="w-full bg-[#12131A] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-medium text-xs placeholder-gray-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-gray-300 uppercase font-bold text-[10px] tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-gray-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#12131A] border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-medium text-xs placeholder-gray-500"
                />
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-white focus:ring-0 cursor-pointer accent-white"
                />
                <span className="text-[11px]">Keep me signed in</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-black font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 text-xs active:scale-[0.99] cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} className="text-black" />
                  <span>Sign In to Admin Suite</span>
                  <ArrowRight size={14} className="text-black" />
                </>
              )}
            </button>
          </form>

          {/* Footer Notice */}
          <div className="pt-6 border-t border-gray-800/70 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <CheckCircle2 size={14} className="text-gray-300" />
              <span>Encrypted Administrative Connection</span>
            </div>
            <p className="text-[10px] text-gray-500">
              Authorized access only. All administrator activities are logged for security.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
