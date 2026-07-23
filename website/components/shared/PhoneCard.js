"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, CreditCard, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

export default function PhoneCard({ phone, className = "" }) {
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
      className={`group block bg-white border border-black/[0.08] rounded-2xl overflow-hidden hover:border-coral/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${className}`}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] bg-paper overflow-hidden shrink-0 border-b border-black/[0.04]">
        {images.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imgIdx}
              src={images[imgIdx]}
              alt={`${phone.brand} ${phone.model}`}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = "/placeholder-device.svg"; e.target.onerror = null; }}
            />
          </>
        ) : (
          <div className="absolute inset-0 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/placeholder-device.svg" alt="No image" className="w-full h-full object-contain opacity-50" />
          </div>
        )}

        {/* Image dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-5 bg-coral" : "w-1.5 bg-black/20"}`}
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
            <span className="bg-coral/10 border border-coral/30 text-coral text-[10px] font-mono font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" /> AI Verified
            </span>
          )}
        </div>

        {/* Hover prev/next */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setImgIdx(i => (i === 0 ? images.length - 1 : i - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-slate-850 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-black/10 hover:bg-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setImgIdx(i => (i === images.length - 1 ? 0 : i + 1)); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-slate-850 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-black/10 hover:bg-white"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-black/40 text-[10px] font-mono uppercase tracking-widest mb-0.5">{phone.brand}</p>
        <h3 className="font-display font-700 text-slate-850 text-sm line-clamp-1 mb-1">
          {phone.title || `${phone.brand} ${phone.model}`}
        </h3>

        {/* Specs row */}
        <div className="flex flex-wrap gap-1.5 mb-3 mt-1">
          {phone.storage && (
            <span className="text-[10px] font-mono text-black/60 bg-black/5 border border-black/5 px-2 py-0.5 rounded">{phone.storage}</span>
          )}
          {phone.ram && (
            <span className="text-[10px] font-mono text-black/60 bg-black/5 border border-black/5 px-2 py-0.5 rounded">{phone.ram} RAM</span>
          )}
          {phone.city && (
            <span className="text-[10px] font-mono text-black/60 flex items-center gap-0.5 ml-1">
              <MapPin className="h-2.5 w-2.5 text-black/40" />{phone.city}
            </span>
          )}
        </div>

        <div className="mt-auto">
          {/* Price + Trust */}
          <div className="flex items-end justify-between">
            <div>
              <p className="font-display font-700 text-xl text-slate-850">{formatINR(phone.price)}</p>
              {phone.originalPrice && (
                <p className="text-black/40 text-xs line-through">{formatINR(phone.originalPrice)}</p>
              )}
            </div>
            <div className="text-right">
              <div className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${trust >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : trust >= 50 ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                Trust {trust}%
              </div>
              {phone.emiEligible && (
                <div className="text-[10px] text-black/40 font-mono flex items-center gap-0.5 justify-end mt-1">
                  <CreditCard className="h-3 w-3" /> EMI
                </div>
              )}
            </div>
          </div>

          {/* Buy button */}
          <button className="w-full mt-4 bg-coral hover:bg-coral-dark text-white font-display font-600 text-xs py-2.5 rounded-xl transition-all duration-200 shadow-sm focus-ring">
            View Details & Buy
          </button>
        </div>
      </div>
    </Link>
  );
}
