import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function CategoryCard({ category }) {
  return (
    <Link href={`/buy/${category.slug}`}
      className="group block bg-white rounded-2xl border border-black/[0.06] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-ring">
      <div className="aspect-square bg-paper relative overflow-hidden flex items-center justify-center">
        {category.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Smartphone className="h-10 w-10 text-black/15" />
        )}
      </div>
      <div className="p-4 text-center">
        <h3 className="font-display font-600 text-slate-850">{category.name}</h3>
        <p className="text-xs text-black/40 mt-0.5">{category.count} listing{category.count === 1 ? "" : "s"}</p>
      </div>
    </Link>
  );
}
