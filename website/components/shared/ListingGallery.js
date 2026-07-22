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
              className={`w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 transition-all bg-[#0F0F1A] ${
                i === active
                  ? "border-coral shadow-[0_0_15px_rgba(255,111,97,0.3)] scale-105"
                  : "border-white/10 hover:border-white/30 hover:bg-[#1A1A2E]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${brand} ${model} view ${i + 1}`}
                className="w-full h-full object-contain p-2"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling?.style.removeProperty("display"); }}
              />
              {/* Fallback Icon */}
              <div className="hidden h-full w-full flex items-center justify-center text-white/20">
                <Smartphone className="h-6 w-6" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Image Area */}
      <div className="flex-1 order-1 md:order-2 h-full flex items-center">
        <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] bg-gradient-to-br from-[#12121E] to-[#0A0A0F] rounded-3xl border border-white/10 overflow-hidden shadow-2xl group flex items-center justify-center">
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
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling?.style.removeProperty("display"); }}
              />
              {/* Fallback Text */}
              <div className="hidden absolute inset-0 flex items-center justify-center flex-col gap-3">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                    <Smartphone className="h-10 w-10" />
                 </div>
                 <p className="text-white/30 font-mono text-xs uppercase">{brand} {model}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                <Smartphone className="h-12 w-12" />
              </div>
              <p className="text-white/30 font-mono text-sm tracking-widest uppercase">No Image Provided</p>
            </div>
          )}

          {/* Nav arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-coral border border-white/10 hover:border-coral text-white backdrop-blur-md rounded-2xl p-3 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-coral border border-white/10 hover:border-coral text-white backdrop-blur-md rounded-2xl p-3 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-mono px-3 py-1.5 rounded-xl flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-3.5 w-3.5 text-coral" /> {zoomed ? "Click to reset" : "Click to zoom"}
          </div>

          {/* Image counter */}
          {imgs.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold font-mono px-3 py-1 rounded-xl">
              {active + 1} / {imgs.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
