"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, ScanLine, Zap, ShieldCheck, Globe } from "lucide-react";
import Container from "@/components/shared/Container";

const LANGUAGES = [
  { id: "Hinglish", label: "Hinglish (Default)", flag: "🇮🇳" },
  { id: "Hindi", label: "हिंदी (Hindi)", flag: "🇮🇳" },
  { id: "English", label: "English", flag: "🌐" }
];

const QUICK_PROMPTS = [
  "Budget ₹12,000, gaming ke liye best phone?",
  "Camera wala phone under ₹20,000",
  "Student ke liye ₹8,000 mein long battery phone",
  "Best flagship under ₹45,000 for creators"
];

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function RecommendationCard({ rec, catalog }) {
  const listing = catalog.find((l) => l._id === rec.id);
  const img = listing?.images?.[0] || "/placeholder-device.svg";

  return (
    <Link
      href={listing ? `/marketplace/${rec.id}` : "#"}
      className="block bg-white border border-black/[0.06] rounded-xl overflow-hidden hover:shadow-md transition-all"
    >
      <div className="flex gap-4 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={rec.model} className="h-20 w-20 object-cover rounded-lg flex-shrink-0 bg-paper border border-black/5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs text-black/40 uppercase">{rec.brand}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-signal-green bg-signal-green/10 px-2 py-0.5 rounded-full font-mono">
              <ShieldCheck className="h-3 w-3" /> Trust Score: {rec.trustScore || 90}/100
            </span>
          </div>
          <p className="font-display font-600 text-sm text-slate-850 truncate">{rec.model}</p>
          <p className="text-base font-700 font-display text-slate-850 mt-0.5">{formatINR(rec.price)}</p>
        </div>
      </div>
      <div className="border-t border-black/[0.06] px-4 py-3 bg-paper">
        <p className="text-xs text-slate-850 leading-relaxed font-medium">{rec.whyItFits}</p>
        {rec.tradeoff && (
          <p className="text-xs text-amber-600 mt-1.5 font-medium">⚠ Tradeoff: {rec.tradeoff}</p>
        )}
      </div>
    </Link>
  );
}

export default function AIAdvisorPage() {
  const [selectedLang, setSelectedLang] = useState("Hinglish");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Namaste! 👋 Main hoon ZYPHOR AI Advisor.\n\nApna budget aur zarurat batao — gaming, camera, battery, study — main live catalog se aapke liye TOP 3 best-matching verified phones dhundhunga.\n\nHindi, Hinglish ya English — niche apni language choose karo aur poochho!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/api/listings?type=device&limit=40&sort=trust")
      .then((r) => r.json())
      .then((d) => setCatalog(d.listings || []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, language: selectedLang })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "ai", text: `Error: ${data.error}` }]);
      } else {
        const recs = data.recommendations || [];
        setMessages((m) => [
          ...m,
          {
            role: "ai",
            text: recs.length > 0
              ? `Yeh rehe aapke TOP ${recs.length} recommendations (${selectedLang}):`
              : "Maafi, is budget ke liye live catalog mein phone nahi mila.",
            recommendations: recs
          }
        ]);
      }
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Network error. Please dobara try karo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-10 bg-paper min-h-screen">
      <Container className="max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-ink mb-4 shadow-md">
            <Zap className="h-7 w-7 text-signal-green" />
          </div>
          <h1 className="font-display font-700 text-3xl text-slate-850">AI Smartphone Advisor</h1>
          <p className="text-black/55 mt-2 text-sm">
            Live catalog · Multi-language support · Real-time Trust Scores
          </p>

          {/* Language Selector Buttons */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-black/50 font-medium flex items-center gap-1 mr-1">
              <Globe className="h-3.5 w-3.5" /> Language:
            </span>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedLang === lang.id
                    ? "bg-coral text-white shadow-sm"
                    : "bg-white text-black/60 hover:text-black border border-black/10"
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden shadow-sm">
          <div className="h-[480px] overflow-y-auto p-5 space-y-5" id="chat-scroll">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                {msg.role === "ai" && (
                  <div className="h-8 w-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ScanLine className="h-4 w-4 text-signal-green" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-ink text-white rounded-br-sm"
                        : "bg-paper text-slate-850 rounded-bl-sm border border-black/5"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.recommendations?.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {msg.recommendations.map((rec, ri) => (
                        <RecommendationCard key={ri} rec={rec} catalog={catalog} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
                  <ScanLine className="h-4 w-4 text-signal-green" />
                </div>
                <div className="bg-paper rounded-2xl rounded-bl-sm px-5 py-4 border border-black/5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 bg-black/20 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-xs bg-paper hover:bg-black/5 text-black/60 rounded-full px-3 py-1.5 transition-colors border border-black/5"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-3 bg-paper border-t border-black/[0.06] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask in ${selectedLang} (e.g. Best gaming phone under ₹25,000)...`}
              className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-coral hover:bg-coral-dark text-white px-5 rounded-xl transition-colors disabled:opacity-40 focus-ring flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}
