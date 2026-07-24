"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import TrustBadge from "./TrustBadge";

function formatINR(n) {
  if (n == null) return "";
  return "₹" + Number(n).toLocaleString("en-IN");
}

export default function ListingCard({ listing }) {
  const images = listing.images?.length > 0 ? listing.images : ["/placeholder-device.svg"];
  const [currentImg, setCurrentImg] = useState(0);
  const verification = listing.verification || {};

  const prev = (e) => {
    e.preventDefault();
    setCurrentImg((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e) => {
    e.preventDefault();
    setCurrentImg((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const targetHref = `/${listing.listingType === "part" ? "parts" : "marketplace"}/${listing._id}`;

  return (
    <Link
      href={targetHref}
      className="group block bg-[#0E0E17]/90 rounded-2xl border border-white/10 overflow-hidden hover:border-coral/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 focus-ring"
    >
      {/* Image Container */}
      <div className="aspect-[4/3] bg-black/40 relative overflow-hidden flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentImg]}
          alt={listing.title || `${listing.brand} ${listing.model}`}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
          onError={(e) => { e.target.src = "/placeholder-device.svg"; }}
        />

        {/* Prev/Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-coral text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-coral text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 w-1.5 rounded-full transition-colors ${i === currentImg ? "bg-coral" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}

        {/* Condition badge */}
        <span className="absolute top-3 left-3 text-[10px] font-mono font-bold bg-black/80 text-coral border border-coral/30 px-2.5 py-0.5 rounded-md z-10 uppercase tracking-wider">
          {listing.conditionGrade || "OEM"}
        </span>

        {/* Part Badge */}
        {listing.listingType === "part" && (
          <span className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-signal-green/20 text-signal-green border border-signal-green/30 px-2 py-0.5 rounded-md z-10 uppercase tracking-wider">
            Spare Part
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-2">
          {images.map((img, i) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={(e) => { e.preventDefault(); setCurrentImg(i); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setCurrentImg(i); } }}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all ${
                i === currentImg ? "border-coral scale-105" : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="w-full h-full object-contain bg-black/40"
                onError={(e) => { e.target.src = "/placeholder-device.svg"; }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Info Block */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{listing.brand}</p>
          {listing.model && <p className="text-[10px] text-coral font-mono truncate">{listing.model}</p>}
        </div>
        <h3 className="font-display font-700 text-sm text-white mt-1 line-clamp-1 group-hover:text-coral transition-colors">
          {listing.title || `${listing.brand} ${listing.model}`}
        </h3>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-lg font-display font-800 text-white">{formatINR(listing.price)}</span>
          {listing.originalPrice && (
            <span className="text-xs text-white/40 line-through font-mono">{formatINR(listing.originalPrice)}</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/5">
          <TrustBadge score={verification.trustScore || 90} status={verification.status || "verified"} size={38} />
          {listing.city ? (
            <span className="text-[11px] text-white/50 flex items-center gap-1 font-mono">
              <MapPin className="h-3 w-3 text-coral" />
              {listing.city}
            </span>
          ) : (
            <span className="text-[10px] text-signal-green font-mono flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Tested OEM
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
