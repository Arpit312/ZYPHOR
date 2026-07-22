"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanLine, Eye, EyeOff, User, Store, Warehouse, Wrench, Lock } from "lucide-react";

const ROLES = [
  {
    value: "customer",
    label: "Customer",
    icon: User,
    desc: "Buy phones",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    value: "retailer",
    label: "Retailer",
    icon: Store,
    desc: "Sell & earn",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    value: "wholesaler",
    label: "Wholesaler",
    icon: Warehouse,
    desc: "Bulk sales",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    value: "technician",
    label: "Technician",
    icon: Wrench,
    desc: "Repair & parts",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    value: "admin",
    label: "Admin",
    icon: Lock,
    desc: "Manage platform",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    hidden: true // Hidden from public, only for admins
  }
];

import AIAgreementModal from "@/components/shared/AIAgreementModal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRoles, setShowRoles] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter roles - hide admin from public
  const publicRoles = ROLES.filter(r => !r.hidden);
  const selectedRoleObj = ROLES.find(r => r.value === selectedRole);

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }
    setError("");
    setShowAgreement(true);
  }

  async function completeLogin() {
    setLoading(true);
    setShowAgreement(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  const RoleIcon = selectedRoleObj?.icon || User;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-700 text-3xl text-white mb-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-lg">
              <ScanLine className="h-6 w-6 text-white" />
            </div>
            ZYPHOR
          </Link>
          <h1 className="font-display font-700 text-2xl md:text-3xl text-white mt-4">Welcome back</h1>
          <p className="text-slate-300 text-sm md:text-base mt-2">Log in to India's verified phone marketplace</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <form onSubmit={handleFormSubmit} className="p-6 md:p-10 space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Role Selection - COMPACT RESPONSIVE GRID */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Select Your Role</label>
              
              {/* Mobile: Dropdown Version */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setShowRoles(!showRoles)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedRoleObj ? `border-${selectedRoleObj.color} bg-${selectedRoleObj.bgColor}` : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 bg-gradient-to-br ${selectedRoleObj?.color} rounded-lg`}>
                      <RoleIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{selectedRoleObj?.label}</p>
                      <p className="text-xs text-slate-600">{selectedRoleObj?.desc}</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-slate-600 transition-transform ${showRoles ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showRoles && (
                  <div className="absolute z-20 mt-2 w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200">
                    {publicRoles.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role.value);
                          setShowRoles(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${
                          selectedRole === role.value ? 'bg-slate-50 border-l-4 border-l-green-500' : ''
                        }`}
                      >
                        <div className={`p-2 bg-gradient-to-br ${role.color} rounded-lg`}>
                          <role.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-slate-900">{role.label}</p>
                          <p className="text-xs text-slate-600">{role.desc}</p>
                        </div>
                        {selectedRole === role.value && (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: Grid Version */}
              <div className="hidden md:grid grid-cols-4 gap-2 lg:gap-3">
                {publicRoles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                      selectedRole === role.value
                        ? `border-slate-900 ${role.bgColor} shadow-lg`
                        : `border-slate-200 hover:border-slate-300 bg-slate-50`
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${role.color}`}>
                      <role.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-xs md:text-sm text-slate-900">{role.label}</p>
                      <p className="text-xs text-slate-600 leading-tight">{role.desc}</p>
                    </div>
                    {selectedRole === role.value && (
                      <div className="absolute mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20m10-10H2" />
                  </svg>
                  Logging in…
                </span>
              ) : (
                `Log in as ${selectedRoleObj?.label}`
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs font-medium text-slate-600">New to ZYPHOR?</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Sign Up Link */}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="w-full border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 text-slate-900 font-semibold py-3 rounded-xl transition-all"
            >
              Create Free Account
            </button>
          </form>

          {/* Footer */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 md:px-10 py-4 border-t border-slate-200">
            <p className="text-center text-xs md:text-sm text-slate-600">
              ✓ Same login works on web & mobile app
              <br />
              ✓ Secure & encrypted • All roles supported
            </p>
          </div>
        </div>

        {/* Features Footer */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="font-semibold text-white">Buyers</p>
            <p className="text-slate-400 text-xs">Browse free</p>
          </div>
          <div>
            <p className="font-semibold text-white">Sellers</p>
            <p className="text-slate-400 text-xs">Earn money</p>
          </div>
          <div>
            <p className="font-semibold text-white">Verified</p>
            <p className="text-slate-400 text-xs">Trust score</p>
          </div>
        </div>
      </div>

      <AIAgreementModal
        isOpen={showAgreement}
        userDetails={{ email, role: selectedRole, action: "login" }}
        onAccept={completeLogin}
        onCancel={() => setShowAgreement(false)}
      />
    </div>
  );
}
