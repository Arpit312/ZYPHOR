"use client";

import { useState } from "react";
import { ScanLine, ShieldCheck, ShieldX, AlertTriangle, ExternalLink } from "lucide-react";
import Container from "@/components/shared/Container";
import toast from "react-hot-toast";

export default function IMEICheckPage() {
  const [imei, setIMEI] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🛡️ Custom Tailwind Toast Function for 429 Rate Limit
  const showRateLimitToast = () => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex border border-amber-200 ring-1 ring-black/5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-slate-850">
                Daily Verification Limit Reached
              </p>
              <p className="mt-1 text-xs text-black/60 leading-relaxed">
                Aapki aaj ki free limit (5 requests) khatam ho gayi hai. Kal firse try karein ya Pro subscription par upgrade karein!
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-black/5">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-semibold text-coral hover:text-coral-dark focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: "top-center"
    });
  };

  async function check() {
    const digits = imei.replace(/\D/g, "");
    if (digits.length !== 15) {
      toast.error("Please enter a valid 15-digit IMEI");
      setError("Please enter exactly 15 digits.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/verify-imei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imei: digits })
      });

      // 429 Rate Limit Handling
      if (res.status === 429) {
        setLoading(false);
        showRateLimitToast();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        toast.success("IMEI Safety Verification Complete!");
        setResult(data);
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-16 bg-paper min-h-screen">
      <Container className="max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-signal-green/10 border border-signal-green/25 mb-5">
            <ScanLine className="h-8 w-8 text-signal-green" />
          </div>
          <h1 className="font-display font-700 text-3xl sm:text-4xl text-slate-850">
            Free AI IMEI Check
          </h1>
          <p className="mt-3 text-black/55 leading-relaxed text-sm">
            Validate any phone&apos;s 15-digit IMEI format, GSMA TAC brand record, and AI CEIR blacklist safety.
            Always secure. Escrow protection ready.
          </p>
        </div>

        {/* Tool */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-7 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-2">
            Find IMEI: dial <strong className="text-slate-850">*#06#</strong> on the phone
          </p>
          <div className="flex gap-3 mt-1">
            <input
              type="text"
              inputMode="numeric"
              maxLength={15}
              value={imei}
              onChange={(e) => { setIMEI(e.target.value.replace(/\D/g, "").slice(0, 15)); setResult(null); setError(""); }}
              placeholder="Enter 15-digit IMEI"
              className="flex-1 font-mono text-lg border-2 border-black/10 focus:border-coral/50 focus:ring-2 focus:ring-coral/20 rounded-xl px-4 py-3 outline-none transition-colors tracking-widest"
            />
            <button
              onClick={check}
              disabled={loading || imei.replace(/\D/g, "").length !== 15}
              className="bg-coral hover:bg-coral-dark text-white font-display font-600 px-6 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-ring text-sm shrink-0"
            >
              {loading ? "Checking…" : "Verify IMEI"}
            </button>
          </div>

          {error && <p className="text-xs text-signal-red mt-2 font-mono">{error}</p>}

          {/* Results */}
          {result && (
            <div className="mt-6 pt-6 border-t border-black/[0.06] space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                {result.valid ? (
                  <div className="h-10 w-10 rounded-full bg-signal-green/10 border border-signal-green/25 text-signal-green flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-signal-red/10 border border-signal-red/25 text-signal-red flex items-center justify-center shrink-0">
                    <ShieldX className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-display font-600 text-slate-850">
                    {result.valid ? "Luhn Algorithm Passed" : "Invalid IMEI Format"}
                  </h3>
                  <p className="text-xs text-black/55">{result.message}</p>
                </div>
              </div>

              <div className="bg-paper rounded-xl p-4 border border-black/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-black/40">Brand / Model:</span>
                  <span className="font-bold text-slate-850">{result.brand || "Apple / Samsung"} {result.model || ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/40">CEIR Status:</span>
                  <span className={`font-bold uppercase ${result.ceirStatus === "white" ? "text-signal-green" : "text-signal-red"}`}>
                    {result.ceirStatus || "WHITE LIST"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
