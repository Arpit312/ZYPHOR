"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <Link
      href={`/${listing.listingType === "part" ? "parts" : "marketplace"}/${listing._id}`}
      className="group block bg-white rounded-2xl border border-black/[0.06] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 focus-ring"
    >
      {/* Image Carousel */}
      <div className="aspect-[4/3] bg-paper relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentImg]}
          alt={listing.title || `${listing.brand} ${listing.model}`}
          className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = "/placeholder-device.svg"; }}
        />

        {/* Prev/Next arrows — only if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                className={`block h-1.5 w-1.5 rounded-full transition-colors ${i === currentImg ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}

        {/* Condition badge */}
        <span className="absolute top-3 left-3 text-[11px] font-mono bg-ink/80 text-white px-2 py-1 rounded z-10">
          {listing.conditionGrade}
        </span>
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
                i === currentImg ? "border-coral scale-105" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="w-full h-full object-contain bg-paper"
                onError={(e) => { e.target.src = "/placeholder-device.svg"; }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        <p className="text-xs text-black/40 font-mono uppercase tracking-wide">{listing.brand}</p>
        <h3 className="font-display font-600 text-base text-slate-850 mt-0.5 line-clamp-1">
          {listing.title || `${listing.brand} ${listing.model}`}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-display font-700 text-slate-850">{formatINR(listing.price)}</span>
          {listing.originalPrice && (
            <span className="text-xs text-black/35 line-through">{formatINR(listing.originalPrice)}</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <TrustBadge score={verification.trustScore || 0} status={verification.status || "not_verified"} size={42} />
          {listing.city && (
            <span className="text-xs text-black/45 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.city}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
