import Link from "next/link";
import { Building2 } from "lucide-react";

export default function BrandCard({ categorySlug, brand }) {
  return (
    <Link href={`/buy/${categorySlug}/${brand.slug}`}
      className="group block bg-white rounded-2xl border border-black/[0.06] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-ring">
      <div className="aspect-[4/3] bg-paper relative overflow-hidden flex items-center justify-center">
        {brand.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.image} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Building2 className="h-9 w-9 text-black/15" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-600 text-slate-850">{brand.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-black/40">{brand.count} listing{brand.count === 1 ? "" : "s"}</p>
          {brand.minPrice != null && <p className="text-xs font-medium text-coral">From ₹{Number(brand.minPrice).toLocaleString("en-IN")}</p>}
        </div>
      </div>
    </Link>
  );
}
