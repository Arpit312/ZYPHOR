"use client";
import { useState } from "react";
import { ZoomIn, ChevronLeft, ChevronRight, Smartphone } from "lucide-react";

export default function ListingGallery({ images, brand, model }) {
  const imgs = images?.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const prev = () => setActive((i) => (i === 0 ? imgs.length - 1 : i - 1));
  const next = () => setActive((i) => (i === imgs.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Left thumbnail strip — exactly like premium e-commerce */}
      {imgs.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide pb-2 md:pb-0 shrink-0 order-2 md:order-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 transition-all bg-white ${
                i === active
                  ? "border-coral shadow-[0_4px_12px_rgba(255,111,97,0.2)] scale-105"
                  : "border-black/[0.08] hover:border-black/20 hover:bg-black/5"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${brand} ${model} view ${i + 1}`}
                className="w-full h-full object-contain p-2"
                onError={(e) => { e.target.src = "/placeholder-device.svg"; e.target.onerror = null; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Area */}
      <div className="flex-1 order-1 md:order-2 h-full flex items-center">
        <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] bg-white rounded-3xl border border-black/[0.06] overflow-hidden shadow-sm group flex items-center justify-center">
          {imgs.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={active}
                src={imgs[active]}
                alt={`${brand} ${model}`}
                className={`w-full h-full object-contain p-8 transition-transform duration-500 ease-out ${
                  zoomed ? "scale-150 cursor-zoom-out" : "group-hover:scale-[1.03] cursor-zoom-in"
                }`}
                onClick={() => setZoomed((z) => !z)}
                onError={(e) => { e.target.src = "/placeholder-device.svg"; e.target.onerror = null; }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 bg-black/5 rounded-full flex items-center justify-center text-black/20">
                <Smartphone className="h-12 w-12" />
              </div>
              <p className="text-black/40 font-mono text-sm tracking-widest uppercase">No Image Provided</p>
            </div>
          )}

          {/* Nav arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-coral border border-black/10 hover:border-coral text-slate-850 hover:text-white backdrop-blur-md rounded-2xl p-3 transition-all opacity-0 group-hover:opacity-100 shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-coral border border-black/10 hover:border-coral text-slate-850 hover:text-white backdrop-blur-md rounded-2xl p-3 transition-all opacity-0 group-hover:opacity-100 shadow-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-black/10 text-slate-850 text-xs font-mono px-3 py-1.5 rounded-xl flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <ZoomIn className="h-3.5 w-3.5 text-coral" /> {zoomed ? "Click to reset" : "Click to zoom"}
          </div>

          {/* Image counter */}
          {imgs.length > 1 && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-black/10 text-slate-850 text-[10px] font-bold font-mono px-3 py-1 rounded-xl shadow-sm">
              {active + 1} / {imgs.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
