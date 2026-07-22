"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export default function FilterSidebar({ facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = {
    condition: searchParams.get("condition") || "",
    storage:   searchParams.get("storage") || "",
    ram:       searchParams.get("ram") || "",
    minPrice:  searchParams.get("minPrice") || "",
    maxPrice:  searchParams.get("maxPrice") || "",
    sort:      searchParams.get("sort") || "newest",
  };

  const update = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => router.push(pathname);

  const hasActive = current.condition || current.storage || current.ram || current.minPrice || current.maxPrice;

  const Body = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-600 text-sm text-slate-850 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h3>
        {hasActive && <button onClick={clearAll} className="text-xs text-coral hover:underline">Clear all</button>}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-black/50 mb-2 uppercase tracking-wide">Sort by</label>
        <select value={current.sort} onChange={(e) => update("sort", e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm bg-paper focus:outline-none focus:border-coral">
          <option value="newest">Newest first</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="trust">Trust Score</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-medium text-black/50 mb-2 uppercase tracking-wide">
          Price range {facets?.minPrice != null && `(₹${facets.minPrice.toLocaleString("en-IN")} – ₹${facets.maxPrice.toLocaleString("en-IN")})`}
        </label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" defaultValue={current.minPrice}
            onBlur={(e) => update("minPrice", e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm bg-paper focus:outline-none focus:border-coral" />
          <input type="number" placeholder="Max" defaultValue={current.maxPrice}
            onBlur={(e) => update("maxPrice", e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm bg-paper focus:outline-none focus:border-coral" />
        </div>
      </div>

      {/* Condition */}
      {facets?.conditions?.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-black/50 mb-2 uppercase tracking-wide">Condition</label>
          <div className="flex flex-wrap gap-2">
            {facets.conditions.map(c => (
              <button key={c} onClick={() => update("condition", current.condition === c ? "" : c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${current.condition === c ? "bg-coral text-white border-coral" : "border-black/10 text-black/60 hover:border-coral"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Storage */}
      {facets?.storages?.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-black/50 mb-2 uppercase tracking-wide">Storage</label>
          <div className="flex flex-wrap gap-2">
            {facets.storages.map(s => (
              <button key={s} onClick={() => update("storage", current.storage === s ? "" : s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${current.storage === s ? "bg-coral text-white border-coral" : "border-black/10 text-black/60 hover:border-coral"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RAM */}
      {facets?.rams?.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-black/50 mb-2 uppercase tracking-wide">RAM</label>
          <div className="flex flex-wrap gap-2">
            {facets.rams.map(r => (
              <button key={r} onClick={() => update("ram", current.ram === r ? "" : r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${current.ram === r ? "bg-coral text-white border-coral" : "border-black/10 text-black/60 hover:border-coral"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 border border-black/10 rounded-lg px-4 py-2.5 text-sm font-medium mb-4 bg-white">
        <SlidersHorizontal className="h-4 w-4" /> Filters {hasActive && <span className="h-1.5 w-1.5 rounded-full bg-coral" />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border border-black/[0.06] rounded-2xl p-5 h-fit sticky top-20">
        {Body}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-5 overflow-y-auto">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1"><X className="h-5 w-5" /></button>
            <div className="mt-8">{Body}</div>
          </div>
        </div>
      )}
    </>
  );
}
