"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Smartphone } from "lucide-react";

export default function SearchBar({ variant = "navbar" }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const boxRef = useRef(null);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goTo = (r) => {
    setOpen(false); setQ("");
    router.push(`/buy/${r.categorySlug}/${r.brandSlug}/${r.modelSlug}`);
  };

  const isNavbar = variant === "navbar";

  return (
    <div ref={boxRef} className="relative w-full">
      <div className={`flex items-center gap-2 rounded-lg px-3 ${isNavbar ? "bg-white/10 border border-white/15 focus-within:border-white/30" : "bg-white border border-black/10 focus-within:border-coral"}`}>
        <Search className={`h-4 w-4 flex-shrink-0 ${isNavbar ? "text-white/40" : "text-black/30"}`} />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) {
              setOpen(false);
              router.push(`/store?q=${encodeURIComponent(q.trim())}`);
            }
          }}
          placeholder="Search iPhone 15, Galaxy S23…"
          className={`w-full bg-transparent py-2.5 text-sm focus:outline-none ${isNavbar ? "text-white placeholder:text-white/40" : "text-slate-850 placeholder:text-black/30"}`}
        />
        {loading && <Loader2 className={`h-4 w-4 animate-spin flex-shrink-0 ${isNavbar ? "text-white/40" : "text-black/30"}`} />}
        {q && !loading && (
          <button onClick={() => { setQ(""); setResults([]); }} className="flex-shrink-0">
            <X className={`h-4 w-4 ${isNavbar ? "text-white/40" : "text-black/30"}`} />
          </button>
        )}
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-black/[0.08] shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          {results.length === 0 && !loading && (
            <p className="px-4 py-4 text-sm text-black/40 text-center">No matching listings found.</p>
          )}
          {results.map((r, i) => (
            <button key={i} onClick={() => goTo(r)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-paper transition-colors text-left border-b border-black/[0.04] last:border-0">
              <div className="h-9 w-9 rounded-lg bg-paper flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-4 w-4 text-black/25" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-850 truncate">{r.label}</p>
                <p className="text-xs text-black/40">{r.category} · {r.count} listing{r.count === 1 ? "" : "s"}</p>
              </div>
              <p className="text-xs font-medium text-coral flex-shrink-0">₹{r.minPrice?.toLocaleString("en-IN")}+</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
