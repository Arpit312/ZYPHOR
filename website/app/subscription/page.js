"use client";
import { useState } from "react";
import { Check, Zap, Shield, Crown, AlertCircle } from "lucide-react";
import { SUBSCRIPTION_PLANS, ROLES_NEEDING_SUBSCRIPTION } from "@/lib/billing";

const PLAN_ICONS = { basic: Zap, pro: Shield, enterprise: Crown };
const PLAN_COLORS = { basic: "coral", pro: "signal-green", enterprise: "signal-amber" };

export default function SubscriptionPage() {
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (planKey) => {
    setLoading(planKey);
    setMessage("");
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billingCycle: cycle }),
      });
      const data = await res.json();
      if (data.subscription) {
        setMessage(`✅ ${data.message || "Subscription activated!"}`);
        setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
      } else {
        setMessage(`❌ ${data.error || "Something went wrong"}`);
      }
    } catch {
      setMessage("❌ Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="bg-paper min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="font-mono text-xs tracking-widest text-coral uppercase">For Sellers</span>
          <h1 className="font-display font-700 text-4xl text-slate-850 mt-2">
            Choose your seller plan
          </h1>
          <p className="text-black/50 mt-3 max-w-xl mx-auto">
            Customers browse and buy for free. Retailers, wholesalers and technicians need a plan to list products.
            All plans include AI-verified listings.
          </p>

          {/* Free badge */}
          <div className="inline-flex items-center gap-2 bg-signal-green/10 text-signal-green border border-signal-green/20 rounded-full px-4 py-1.5 mt-4 text-sm font-medium">
            <Check className="h-4 w-4" />
            Customers browse & buy for FREE — always
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setCycle("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${cycle === "monthly" ? "bg-coral text-white" : "text-black/50 hover:text-black"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("yearly")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${cycle === "yearly" ? "bg-coral text-white" : "text-black/50 hover:text-black"}`}
          >
            Yearly
            <span className="ml-2 bg-signal-green/20 text-signal-green text-xs px-1.5 py-0.5 rounded">Save 17%</span>
          </button>
        </div>

        {message && (
          <div className={`text-center mb-6 px-4 py-3 rounded-lg border ${message.startsWith("✅") ? "bg-signal-green/10 border-signal-green/30 text-signal-green" : "bg-signal-red/10 border-signal-red/30 text-signal-red"}`}>
            {message}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const Icon = PLAN_ICONS[key];
            const price = plan[cycle];
            const isPopular = key === "pro";
            return (
              <div key={key} className={`bg-white rounded-2xl border-2 p-8 relative ${isPopular ? "border-coral shadow-xl shadow-coral/10" : "border-black/[0.07]"}`}>
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                )}
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${key === "basic" ? "bg-coral/10" : key === "pro" ? "bg-signal-green/10" : "bg-signal-amber/10"}`}>
                  <Icon className={`h-6 w-6 ${key === "basic" ? "text-coral" : key === "pro" ? "text-signal-green" : "text-signal-amber"}`} />
                </div>

                <h3 className="font-display font-700 text-xl text-slate-850">{plan.label}</h3>
                <div className="mt-3 mb-6">
                  <span className="font-display font-700 text-4xl text-slate-850">₹{price.toLocaleString()}</span>
                  <span className="text-black/40 text-sm ml-1">/{cycle === "yearly" ? "year" : "month"}</span>
                  {cycle === "yearly" && (
                    <p className="text-xs text-signal-green mt-1">≈ ₹{Math.round(price/12).toLocaleString()}/mo</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-black/70">
                      <Check className="h-4 w-4 text-signal-green flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={loading === key}
                  className={`w-full py-3 rounded-xl font-display font-600 text-sm transition-all ${isPopular ? "bg-coral hover:bg-coral-dark text-white" : "bg-ink text-white hover:bg-ink/90"} disabled:opacity-60`}
                >
                  {loading === key ? "Processing..." : `Get ${plan.label}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Platform fee note */}
        <div className="mt-12 bg-ink/5 border border-ink/10 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-black/40 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-850 text-sm mb-1">Platform Service Charge</p>
              <p className="text-black/55 text-sm leading-relaxed">
                When you sell through ZYPHOR, a <strong>3% platform fee + 18% GST</strong> on the fee is deducted
                from your sale amount. A proper GST invoice is generated for every transaction.
                Example: Sell for ₹30,000 → Platform earns ₹900 + ₹162 GST = ₹1,062 → You receive ₹28,938.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
