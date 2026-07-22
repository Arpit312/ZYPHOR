"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Smartphone, ArrowRight } from "lucide-react";

export default function MegaMenu() {
  const [menu, setMenu] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    fetch("/api/catalog/menu").then(r => r.json()).then(d => {
      setMenu(d.menu || []);
      setActiveCat(d.menu?.[0]?.slug || null);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const openMenu = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const closeMenu = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };

  const currentCat = menu.find(c => c.slug === activeCat);

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <Link href="/store" className="flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-md text-coral hover:text-white hover:bg-white/5 transition-colors focus-ring">
        STORE <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Link>

      {open && loaded && (
        <div className="absolute top-full left-0 mt-1 w-[640px] max-w-[90vw] bg-[#12121E] rounded-2xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(255,111,97,0.3)] overflow-hidden flex z-50">
          {menu.length === 0 ? (
            <div className="p-8 text-center w-full bg-[#0A0A0F]">
              <Smartphone className="h-10 w-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">No listings yet. Be the first to list a device!</p>
              <Link href="/sell" className="inline-block mt-3 text-sm text-coral font-medium hover:underline">List a device →</Link>
            </div>
          ) : (
            <>
              {/* Categories column */}
              <div className="w-44 bg-paper border-r border-black/[0.06] py-2 flex-shrink-0">
                {menu.map(cat => (
                  <button key={cat.slug} onMouseEnter={() => setActiveCat(cat.slug)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${activeCat === cat.slug ? "bg-white text-coral font-medium" : "text-slate-850/80 hover:bg-white/60"}`}>
                    {cat.name}
                    <span className="text-[10px] text-black/30">{cat.count}</span>
                  </button>
                ))}
              </div>

              {/* Brands grid */}
              <div className="flex-1 p-5">
                <p className="text-xs font-medium text-black/40 uppercase tracking-wide mb-3">{currentCat?.name} Brands</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentCat?.brands.map(brand => (
                    <Link key={brand.slug} href={`/buy/${currentCat.slug}/${brand.slug}`} onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-paper transition-colors group">
                      <span className="text-sm text-slate-850">{brand.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-black/20 group-hover:text-coral group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
                <Link href={`/buy/${currentCat?.slug}`} onClick={() => setOpen(false)}
                  className="mt-4 flex items-center gap-1 text-sm font-medium text-coral hover:underline">
                  View all {currentCat?.name} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
