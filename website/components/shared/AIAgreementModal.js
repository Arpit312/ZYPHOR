"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, FileText, Sparkles, Lock, ArrowRight } from "lucide-react";

export default function AIAgreementModal({ isOpen, userDetails, onAccept, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [agreement, setAgreement] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (isOpen && userDetails) {
      setLoading(true);
      fetch("/api/ai/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.agreement) {
            setAgreement(data.agreement);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, userDetails]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-black/10">
        
        {/* Header */}
        <div className="bg-ink text-white p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-coral flex items-center justify-center text-white font-bold">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-700 text-lg text-white">AI Legal Agreement &amp; Terms</h2>
              <p className="text-xs text-white/60">Generated dynamically for {userDetails?.name || userDetails?.email}</p>
            </div>
          </div>
          <span className="font-mono text-xs bg-signal-green/20 text-signal-green border border-signal-green/30 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
            {userDetails?.role || "User"} Role
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-paper">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="h-12 w-12 rounded-full border-4 border-coral border-t-transparent animate-spin mx-auto"></div>
              <p className="font-display font-600 text-slate-850 text-base">
                AI is generating personalized agreement...
              </p>
              <p className="text-xs text-black/50 max-w-xs mx-auto">
                Analyzing role requirements, platform fee structures, and privacy policy for {userDetails?.email}
              </p>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="bg-white rounded-2xl p-5 border border-black/[0.08] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-coral font-display font-600 text-sm">
                  <FileText className="h-4 w-4" /> {agreement?.title || "ZYPHOR USER AGREEMENT"}
                </div>
                <p className="text-xs text-black/60 leading-relaxed">
                  <strong>Revenue &amp; Monetization Terms:</strong> {agreement?.monetizationSummary}
                </p>
              </div>

              {/* Clauses */}
              <div className="space-y-4">
                {agreement?.clauses?.map((clause, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-black/[0.06] space-y-2">
                    <h3 className="font-display font-600 text-sm text-slate-850">{clause.heading}</h3>
                    <p className="text-xs text-black/60 leading-relaxed">{clause.content}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="p-6 bg-white border-t border-black/5 shrink-0 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-coral rounded"
              />
              <span className="text-xs text-black/70 leading-normal">
                I, <strong className="text-slate-850">{userDetails?.name || userDetails?.email}</strong>, have read and agree to Zyphor&apos;s AI-generated Terms of Service, Privacy Policy, Escrow Rules, and Fee Structure.
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl border border-black/10 text-sm font-semibold text-black/60 hover:bg-black/5 transition-colors"
              >
                Decline
              </button>
              <button
                type="button"
                disabled={!accepted}
                onClick={onAccept}
                className="flex-1 py-3 px-4 rounded-xl bg-coral hover:bg-coral-dark text-white text-sm font-display font-600 transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-coral/20"
              >
                <CheckCircle2 className="h-4 w-4" /> Accept &amp; Proceed <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
