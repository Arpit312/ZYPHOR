"use client";

import { useState } from "react";
import { ScanLine, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Search, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import Container from "@/components/shared/Container";
import Link from "next/link";

export default function IMEICheckPage() {
  const [imei, setImei] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    const clean = imei.replace(/\D/g, "");
    if (clean.length !== 15) {
      setError("Please enter a valid 15-digit IMEI number.");
      setResult(null);
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/imei/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imei: clean }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to verify IMEI.");
      }
    } catch {
      setError("Connection error while connecting to CEIR database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-paper min-h-screen">
      <Container className="max-w-2xl">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 bg-signal-green/10 text-signal-green border border-signal-green/20 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck size={14} /> Official CEIR Screening Layer
          </div>
          <h1 className="font-display font-800 text-3xl sm:text-4xl text-slate-850 tracking-tight">
            Free IMEI &amp; Anti-Theft Check
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto font-medium leading-relaxed">
            Verify any smartphone before you buy or sell. Screen against India&apos;s CEIR government theft blacklist, check 15-digit Luhn authenticity, and TAC allocation.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Enter 15-Digit IMEI Number
                </label>
                <span className="text-[11px] text-coral font-medium">
                  Dial *#06# on any phone to view IMEI
                </span>
              </div>
              <div className="relative">
                <ScanLine className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  maxLength={17}
                  value={imei}
                  onChange={(e) => {
                    setImei(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. 354892091234567"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono text-black placeholder-gray-400 focus:bg-white focus:outline-none focus:border-black transition-all font-semibold"
                />
              </div>
              {error && <p className="text-xs text-signal-red font-semibold mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Search size={15} />
              {loading ? "Screening CEIR Database…" : "Scan & Verify Device IMEI"}
            </button>
          </form>

          {/* Result Block */}
          {result && (
            <div className={`p-5 rounded-2xl border animate-scale-in space-y-4 ${
              result.isValid 
                ? "bg-signal-green/5 border-signal-green/20" 
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  result.isValid ? "bg-signal-green text-white" : "bg-signal-red text-white"
                }`}>
                  {result.isValid ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">
                    {result.isValid ? "Device Verified Clean ✓" : "Invalid or Blacklisted IMEI"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {result.message}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-3 border-t border-black/5 bg-white p-3.5 rounded-xl border">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Luhn Algorithm:</span>
                  <span className="font-bold text-black">{result.isValid ? "Passed (Valid 15-Digit)" : "Failed"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Blacklist Status:</span>
                  <span className={`font-bold ${result.isValid ? "text-signal-green" : "text-signal-red"}`}>
                    {result.blacklistStatus}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">TAC Brand Prefix:</span>
                  <span className="font-bold text-black">{result.tac || "Allocated"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">AI Trust Rating:</span>
                  <span className="font-bold text-black">{result.trustScore}/100</span>
                </div>
              </div>

              {result.isValid && (
                <div className="pt-1 flex gap-2">
                  <Link
                    href="/sell"
                    className="flex-1 py-2.5 bg-coral text-white rounded-xl text-xs font-bold text-center hover:bg-coral-dark transition-all"
                  >
                    Sell This Device &rarr;
                  </Link>
                  <Link
                    href="/marketplace"
                    className="flex-1 py-2.5 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold text-center hover:bg-gray-200 transition-all"
                  >
                    Browse Market
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Quick Guidance */}
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <HelpCircle size={14} className="text-gray-400" />
              <span>How does ZYPHOR protect buyers?</span>
            </div>
            <p className="leading-relaxed font-medium">
              Every phone listed on ZYPHOR undergoes automated GSMA TAC analysis and CEIR screening. Stolen, lost, or financed devices with unpaid EMI locks are immediately banned from entering the catalog.
            </p>
          </div>
        </div>

      </Container>
    </section>
  );
}
