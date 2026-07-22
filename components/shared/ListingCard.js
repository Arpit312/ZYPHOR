import Link from "next/link";
import { MapPin } from "lucide-react";
import TrustBadge from "./TrustBadge";

function formatINR(n) {
  if (n == null) return "";
  return "₹" + Number(n).toLocaleString("en-IN");
}

export default function ListingCard({ listing }) {
  const img = listing.images?.[0] || "/placeholder-device.svg";
  const verification = listing.verification || {};

  return (
    <Link
      href={`/${listing.listingType === "part" ? "parts" : "marketplace"}/${listing._id}`}
      className="group block bg-white rounded-xl border border-black/[0.06] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-ring"
    >
      <div className="aspect-[4/3] bg-paper relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={listing.title || `${listing.brand} ${listing.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 text-[11px] font-mono bg-ink/85 text-white px-2 py-1 rounded">
          {listing.conditionGrade}
        </span>
      </div>

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
