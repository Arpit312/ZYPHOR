"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const go = (p) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p);
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button onClick={() => go(page - 1)} disabled={page <= 1}
        className="h-9 w-9 flex items-center justify-center rounded-lg border border-black/10 disabled:opacity-30 hover:bg-black/5 transition-colors focus-ring">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {start > 1 && <span className="px-2 text-black/30">…</span>}
      {pages.map(p => (
        <button key={p} onClick={() => go(p)}
          className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors focus-ring ${p === page ? "bg-coral text-white" : "border border-black/10 hover:bg-black/5 text-black/60"}`}>
          {p}
        </button>
      ))}
      {end < totalPages && <span className="px-2 text-black/30">…</span>}
      <button onClick={() => go(page + 1)} disabled={page >= totalPages}
        className="h-9 w-9 flex items-center justify-center rounded-lg border border-black/10 disabled:opacity-30 hover:bg-black/5 transition-colors focus-ring">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
