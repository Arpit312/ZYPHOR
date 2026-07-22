import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/** items: [{ label, href }] — last item has no href (current page) */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-black/45 mb-5">
      <Link href="/" className="flex items-center gap-1 hover:text-coral transition-colors focus-ring rounded">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-black/25" />
          {item.href ? (
            <Link href={item.href} className="hover:text-coral transition-colors focus-ring rounded">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-850 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
