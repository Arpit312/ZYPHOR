"use client";
import { useState } from "react";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export default function ListingGallery({ images, brand, model }) {
  const imgs = images?.length > 0 ? images : ["/placeholder-device.svg"];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const prev = () => setActive((i) => (i === 0 ? imgs.length - 1 : i - 1));
  const next = () => setActive((i) => (i === imgs.length - 1 ? 0 : i + 1));

  return (
    <div className="flex gap-4">
      {/* Left thumbnail strip — exactly like Flipkart */}
      {imgs.length > 1 && (
        <div className="flex flex-col gap-2 shrink-0">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all bg-paper ${
                i === active
                  ? "border-coral shadow-md scale-105"
                  : "border-black/10 hover:border-black/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${brand} ${model} view ${i + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = "/placeholder-device.svg"; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Area */}
      <div className="flex-1">
        <div className="relative aspect-square bg-white rounded-2xl border border-black/[0.07] overflow-hidden shadow-sm group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgs[active]}
            alt={`${brand} ${model}`}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              zoomed ? "scale-150 cursor-zoom-out" : "group-hover:scale-105 cursor-zoom-in"
            }`}
            onClick={() => setZoomed((z) => !z)}
            onError={(e) => { e.target.src = "/placeholder-device.svg"; }}
          />

          {/* Nav arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-850 shadow-md rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-850 shadow-md rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-3 w-3" /> Click to zoom
          </div>

          {/* Image counter */}
          {imgs.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-mono px-2.5 py-1 rounded-full">
              {active + 1} / {imgs.length}
            </div>
          )}
        </div>

        {/* Dot indicators (bottom) */}
        {imgs.length > 1 && (
          <div className="flex gap-2 justify-center mt-3">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-coral" : "w-2 bg-black/20 hover:bg-black/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
