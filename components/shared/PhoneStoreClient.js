"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ShieldCheck, Star, MapPin, Zap, CreditCard, ChevronLeft, ChevronRight, TrendingDown, BadgeCheck } from "lucide-react";

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function PhoneCard({ phone }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = phone.images?.length > 0 ? phone.images : [];
  const trust = phone.verification?.trustScore || 0;

  const conditionColors = {
    Superb: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Good: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Fair: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };

  return (
    <Link
      href={`/marketplace/${phone._id}`}
      className="group block bg-[#12121E] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-coral/40 hover:shadow-2xl hover:shadow-coral/10 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] overflow-hidden">
        {images.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imgIdx}
              src={images[imgIdx]}
              alt={`${phone.brand} ${phone.model}`}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.style.display = "none"; e.target.nextSibling?.style.removeProperty("display"); }}
            />
            {/* Fallback text */}
            <div className="hidden absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">📱</div>
                <p className="text-white/30 text-xs">{phone.brand} {phone.model}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">📱</span>
          </div>
        )}

        {/* Image dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-5 bg-coral" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${conditionColors[phone.conditionGrade] || conditionColors.Good}`}>
            {phone.conditionGrade}
          </span>
          {phone.verification?.status === "verified" && (
            <span className="bg-coral/20 border border-coral/40 text-coral text-[10px] font-mono font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" /> AI Verified
            </span>
          )}
        </div>

        {/* Hover prev/next */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setImgIdx(i => (i === 0 ? images.length - 1 : i - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setImgIdx(i => (i === images.length - 1 ? 0 : i + 1)); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mb-0.5">{phone.brand}</p>
        <h3 className="font-display font-700 text-white text-sm line-clamp-1 mb-1">
          {phone.title || `${phone.brand} ${phone.model}`}
        </h3>

        {/* Specs row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {phone.storage && (
            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">{phone.storage}</span>
          )}
          {phone.ram && (
            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">{phone.ram} RAM</span>
          )}
          {phone.city && (
            <span className="text-[10px] font-mono text-white/40 flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />{phone.city}
            </span>
          )}
        </div>

        {/* Price + Trust */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display font-700 text-xl text-white">{formatINR(phone.price)}</p>
            {phone.originalPrice && (
              <p className="text-white/30 text-xs line-through">{formatINR(phone.originalPrice)}</p>
            )}
          </div>
          <div className="text-right">
            <div className={`text-xs font-mono font-bold ${trust >= 80 ? "text-emerald-400" : trust >= 50 ? "text-amber-400" : "text-red-400"}`}>
              Trust {trust}%
            </div>
            {phone.emiEligible && (
              <div className="text-[10px] text-white/40 font-mono flex items-center gap-0.5 justify-end mt-0.5">
                <CreditCard className="h-3 w-3" /> EMI
              </div>
            )}
          </div>
        </div>

        {/* Buy button */}
        <button className="w-full mt-3 bg-coral/10 hover:bg-coral text-coral hover:text-white border border-coral/30 hover:border-coral font-display font-600 text-xs py-2.5 rounded-xl transition-all duration-200">
          View Details & Buy
        </button>
      </div>
    </Link>
  );
}

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
