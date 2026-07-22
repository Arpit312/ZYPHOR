"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, ScanLine, Zap, ShieldCheck } from "lucide-react";
import Container from "@/components/shared/Container";

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
      className="block bg-white border border-black/[0.06] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={rec.model} className="h-20 w-20 object-cover rounded-lg flex-shrink-0 bg-paper" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-black/40 uppercase">{rec.brand}</span>
            {rec.trustScore >= 80 && (
              <span className="flex items-center gap-1 text-xs text-signal-green font-mono">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <p className="font-display font-600 text-sm text-slate-850 mt-0.5 truncate">{rec.model}</p>
          <p className="text-base font-700 font-display text-slate-850">{formatINR(rec.price)}</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="text-xs font-mono text-signal-green">
              {rec.matchScore}% match
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-black/[0.06] px-4 py-3">
        <p className="text-xs text-black/65 leading-relaxed">{rec.whyItFits}</p>
        {rec.tradeoff && (
          <p className="text-xs text-signal-amber mt-1.5">⚠ {rec.tradeoff}</p>
        )}
      </div>
    </Link>
  );
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Namaste! 👋 Main hoon ZYPHOR AI Advisor.\n\nApna budget aur zarurat batao — gaming, camera, battery, study — main live catalog se aapke liye TOP 3 best-matching verified phones dhundhunga.\n\nHindi, Hinglish ya English — koi bhi language mein poochho!"
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
        body: JSON.stringify({ message: msg, catalog })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "ai", text: `Sorry, kuch error hua: ${data.error}` }]);
      } else {
        const recs = data.recommendations || [];
        setMessages((m) => [
          ...m,
          { role: "ai", text: recs.length > 0 ? `Yeh rehe aapke TOP ${recs.length} recommendations:` : "Maafi, is budget/zarurat ke liye abhi catalog mein suitable phone nahi mila. Apna budget thoda badaao ya zarurat change karo?", recommendations: recs }
        ]);
      }
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Network error. Please dobara try karo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-10">
      <Container className="max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-ink mb-4">
            <Zap className="h-7 w-7 text-signal-green" />
          </div>
          <h1 className="font-display font-700 text-3xl text-slate-850">AI Phone Advisor</h1>
          <p className="text-black/55 mt-2 text-sm">
            Live catalog · Responds in Hindi, Hinglish &amp; English · Completely free
          </p>
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
                <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-ink text-white rounded-br-sm"
                        : "bg-paper text-slate-850 rounded-bl-sm"
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
                <div className="bg-paper rounded-2xl rounded-bl-sm px-5 py-4">
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
                  className="text-xs px-3 py-1.5 border border-black/10 rounded-full text-black/60 hover:border-coral hover:text-coral transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-black/[0.07] px-4 py-3 flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Budget aur zarurat batao…"
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder-black/35"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="h-9 w-9 rounded-xl bg-coral hover:bg-coral-dark disabled:opacity-40 transition-colors flex items-center justify-center focus-ring"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-black/40">
          AI Advisor recommends only from ZYPHOR&apos;s live verified catalog.
        </p>
      </Container>
    </section>
  );
}
