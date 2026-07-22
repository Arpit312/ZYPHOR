"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ShieldCheck, Star, MapPin, Zap, CreditCard, ChevronLeft, ChevronRight, TrendingDown, BadgeCheck } from "lucide-react";

import PhoneCard from "./PhoneCard";

export default function PhoneStoreClient({ initialPhones, brands, conditions }) {
  const [query, setQuery] = useState("");
  const [activeBrand, setActiveBrand] = useState("All");
  const [activeCondition, setActiveCondition] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...initialPhones];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.brand?.toLowerCase().includes(q) ||
        p.model?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q)
      );
    }

    if (activeBrand !== "All") {
      list = list.filter(p => p.brand?.toLowerCase() === activeBrand.toLowerCase());
    }

    if (activeCondition !== "All") {
      list = list.filter(p => p.conditionGrade === activeCondition);
    }

    if (sortBy === "price_low") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_high") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "trust") list.sort((a, b) => (b.verification?.trustScore || 0) - (a.verification?.trustScore || 0));

    return list;
  }, [initialPhones, query, activeBrand, activeCondition, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search iPhone, Samsung, OnePlus..."
            className="w-full bg-[#12121E] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-coral transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-[#12121E] border border-white/10 text-white/70 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-coral cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="trust">Highest Trust Score</option>
        </select>
      </div>

      {/* Brand Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {brands.map(b => (
          <button
            key={b}
            onClick={() => setActiveBrand(b)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeBrand === b
                ? "bg-coral text-white shadow-lg shadow-coral/20"
                : "bg-[#12121E] text-white/50 border border-white/10 hover:text-white hover:border-white/30"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Condition Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-white/40 text-xs font-mono uppercase tracking-wider">Condition:</span>
        {conditions.map(c => (
          <button
            key={c}
            onClick={() => setActiveCondition(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCondition === c
                ? "bg-white text-[#0A0A0F]"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto text-white/30 text-xs font-mono">
          {filtered.length} phone{filtered.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#12121E] border border-white/5 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display font-700 text-xl text-white mb-2">No phones found</h3>
          <p className="text-white/40 text-sm">Try a different brand, condition or search term.</p>
          <button
            onClick={() => { setQuery(""); setActiveBrand("All"); setActiveCondition("All"); }}
            className="mt-4 bg-coral text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-coral-dark"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(phone => (
            <PhoneCard key={phone._id} phone={phone} />
          ))}
        </div>
      )}
    </div>
  );
}
