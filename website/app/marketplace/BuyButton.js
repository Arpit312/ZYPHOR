"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

export default function BuyButton({ listingId, price, status }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleBuy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { router.push("/login"); return; }
        setError(data.error || "Failed to place order.");
      } else {
        setDone(true);
        router.push("/dashboard/orders");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-signal-green/10 border border-signal-green/25 rounded-xl p-4 text-signal-green font-medium text-sm">
        ✓ Order placed! Redirecting to your orders…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleBuy}
        disabled={loading || status === "failed"}
        className="w-full bg-coral hover:bg-coral-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-display font-700 text-base py-4 rounded-xl focus-ring"
      >
        {loading ? "Processing…" : `Buy now — ${formatINR(price)}`}
      </button>

      <div className="flex items-center gap-2 text-xs text-black/45">
        <Lock className="h-3.5 w-3.5" />
        Payment held in escrow until you confirm delivery
        <ShieldCheck className="h-3.5 w-3.5 text-signal-green ml-auto" />
      </div>

      {error && (
        <p className="text-sm text-signal-red bg-signal-red/8 border border-signal-red/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {status === "failed" && (
        <p className="text-xs text-signal-red">
          This listing has failed AI verification and cannot be purchased.
        </p>
      )}
    </div>
  );
}
