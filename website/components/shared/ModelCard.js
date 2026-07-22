import Link from "next/link";
import { ShieldCheck, Smartphone } from "lucide-react";

export default function ModelCard({ categorySlug, brandSlug, model }) {
  return (
    <Link href={`/buy/${categorySlug}/${brandSlug}/${model.slug}`}
      className="group block bg-white rounded-2xl border border-black/[0.06] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-ring">
      <div className="aspect-[4/3] bg-paper relative overflow-hidden flex items-center justify-center">
        {model.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={model.image} alt={model.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Smartphone className="h-9 w-9 text-black/15" />
        )}
        {model.avgTrust > 0 && (
          <span className="absolute top-3 left-3 flex items-center gap-1 text-[11px] font-mono bg-ink/85 text-white px-2 py-1 rounded">
            <ShieldCheck className="h-3 w-3 text-signal-green" />{model.avgTrust}%
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-600 text-slate-850 line-clamp-1">{model.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-black/40">{model.count} listing{model.count === 1 ? "" : "s"}</p>
          <p className="text-sm font-display font-700 text-slate-850">₹{Number(model.minPrice).toLocaleString("en-IN")}+</p>
        </div>
      </div>
    </Link>
  );
}
