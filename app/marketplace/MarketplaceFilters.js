"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const BRANDS = ["Apple", "Samsung", "Xiaomi", "OnePlus", "Vivo", "Oppo", "Realme", "Poco"];
const CITIES = ["Bhopal", "Indore", "Jaipur", "Delhi", "Mumbai", "Bangalore", "Kanpur"];
const GRADES = ["Superb", "Good", "Fair"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "trust", label: "Highest trust score" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" }
];

export default function MarketplaceFilters({ current = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const push = useCallback(
    (updates) => {
      const params = new URLSearchParams(current);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [current, pathname, router]
  );

  const Filter = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wide text-black/50 mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
          <input
            type="text"
            defaultValue={current.q || ""}
            placeholder="Brand, model…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50"
            onKeyDown={(e) => { if (e.key === "Enter") push({ q: e.target.value, page: null }); }}
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wide text-black/50 mb-2">Sort by</label>
        <select
          defaultValue={current.sort || "newest"}
          onChange={(e) => push({ sort: e.target.value })}
          className="w-full py-2.5 px-3 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wide text-black/50 mb-2">Brand</label>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => push({ brand: current.brand === b ? null : b })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${current.brand === b ? "bg-ink text-white border-ink" : "border-black/15 text-black/60 hover:border-ink/40"}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Grade */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wide text-black/50 mb-2">Condition</label>
        <div className="flex flex-col gap-2">
          {GRADES.map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="grade"
                value={g}
                checked={current.grade === g}
                onChange={() => push({ grade: g })}
                className="accent-coral"
              />
              <span className="text-sm text-black/70">{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wide text-black/50 mb-2">Price (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={current.minPrice || ""}
            onBlur={(e) => push({ minPrice: e.target.value || null })}
            className="w-full py-2 px-3 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={current.maxPrice || ""}
            onBlur={(e) => push({ maxPrice: e.target.value || null })}
            className="w-full py-2 px-3 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wide text-black/50 mb-2">City</label>
        <select
          defaultValue={current.city || ""}
          onChange={(e) => push({ city: e.target.value || null })}
          className="w-full py-2.5 px-3 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Clear */}
      {Object.keys(current).length > 0 && (
        <button
          onClick={() => router.push(pathname)}
          className="w-full flex items-center justify-center gap-2 text-sm text-coral border border-coral/30 rounded-lg py-2.5 hover:bg-coral/5 transition-colors"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium border border-black/15 rounded-lg px-4 py-2.5 mb-4 focus-ring"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {open ? "Hide" : "Show"} filters
        </button>
        {open && (
          <div className="bg-white border border-black/[0.06] rounded-xl p-5 mb-4">{Filter}</div>
        )}
      </div>
      {/* Desktop */}
      <div className="hidden lg:block bg-white border border-black/[0.06] rounded-xl p-5">
        {Filter}
      </div>
    </>
  );
}
