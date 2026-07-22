"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, ScanLine, Zap, ShieldCheck, Globe, ArrowRight, Sparkles } from "lucide-react";
import Container from "@/components/shared/Container";

const LANGUAGES = [
  { id: "Hinglish", label: "Hinglish", desc: "Hinglish mein suggestions paayein", flag: "🇮🇳", sub: "Mix of Hindi & English" },
  { id: "Hindi", label: "हिंदी (Hindi)", desc: "हिंदी में सुझाव पाएं", flag: "🇮🇳", sub: "शुद्ध हिंदी भाषा में" },
  { id: "English", label: "English", desc: "Get suggestions in English", flag: "🌐", sub: "Global English Language" }
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
  const [langChosen, setLangChosen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("Hinglish");
  const [messages, setMessages] = useState([]);
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

  // Handle mandatory language choice button click
  function chooseLanguage(langId) {
    setSelectedLang(langId);
    setLangChosen(true);

    let greeting = "";
    if (langId === "Hindi") {
      greeting = "नमस्ते! 👋 मैं हूँ ZYPHOR AI एडवाइज़र (हिंदी)।\n\nअपना बजट और ज़रूरत बताइए — गेमिंग, कैमरा, बैटरी, पढ़ाई — मैं लाइव कैटलॉग से आपके लिए TOP 3 बेस्ट-मैचिंग फ़ोन ढूँढूँगा।";
    } else if (langId === "English") {
      greeting = "Hello! 👋 I am your ZYPHOR AI Advisor (English).\n\nTell me your budget and requirements — gaming, camera, battery, study — I will find the TOP 3 best-matching verified phones from our live catalog for you.";
    } else {
      greeting = "Namaste! 👋 Main hoon ZYPHOR AI Advisor (Hinglish).\n\nApna budget aur zarurat batao — gaming, camera, battery, study — main live catalog se aapke liye TOP 3 best-matching verified phones dhundhunga.";
    }

    setMessages([
      {
        role: "ai",
        text: greeting
      }
    ]);
  }

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
    <section className="py-12 bg-paper min-h-screen">
      <Container className="max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-ink mb-4 shadow-md">
            <Zap className="h-8 w-8 text-signal-green" />
          </div>
          <h1 className="font-display font-700 text-3xl sm:text-4xl text-slate-850">AI Smartphone Advisor</h1>
          <p className="text-black/55 mt-2 text-sm">
            Live catalog · Real-time AI Trust Scores · Multi-language Assistant
          </p>
        </div>

        {/* STEP 1: MANDATORY LANGUAGE SELECTION SCREEN */}
        {!langChosen ? (
          <div className="bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-mono text-coral font-bold uppercase tracking-widest bg-coral/10 px-3 py-1 rounded-full">
                Step 1 of 2: Select Language
              </span>
              <h2 className="font-display font-700 text-2xl text-slate-850">
                Pehle apni bhasha (Language) choose karein:
              </h2>
              <p className="text-xs text-black/55 max-w-md mx-auto leading-relaxed">
                Choose your preferred language to start chatting with Zyphor AI Smartphone Advisor.
              </p>
            </div>

            {/* Mandatory Language Selection Buttons */}
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => chooseLanguage(lang.id)}
                  className="p-6 rounded-2xl border-2 border-black/10 hover:border-coral hover:bg-coral/5 text-left transition-all group flex flex-col justify-between hover:shadow-lg focus-ring"
                >
                  <div>
                    <div className="text-3xl mb-3">{lang.flag}</div>
                    <h3 className="font-display font-700 text-lg text-slate-850 group-hover:text-coral transition-colors">
                      {lang.label}
                    </h3>
                    <p className="text-xs font-medium text-black/60 mt-1">{lang.desc}</p>
                    <p className="text-[11px] text-black/40 mt-0.5">{lang.sub}</p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-coral group-hover:translate-x-1 transition-transform">
                    Start Chat <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* STEP 2: UNLOCKED AI ADVISOR CHAT INTERFACE */
          <div className="bg-white border border-black/[0.07] rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            
            {/* Header bar with current language indicator */}
            <div className="bg-ink text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Sparkles className="h-4 w-4 text-signal-green animate-pulse" />
                <span>ZYPHOR AI Advisor</span>
                <span className="text-white/40">•</span>
                <span className="text-signal-green font-mono bg-signal-green/20 px-2.5 py-0.5 rounded-full text-[11px]">
                  Language: {selectedLang}
                </span>
              </div>
              <button
                onClick={() => setLangChosen(false)}
                className="text-xs text-white/60 hover:text-white underline font-medium"
              >
                Change Language
              </button>
            </div>

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
        )}
      </Container>
    </section>
  );
}
