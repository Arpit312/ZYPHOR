"use client";
import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import PhoneCard from "./PhoneCard";

export default function StorefrontCarousel({ title, subtitle, items = [], viewAllLink }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="py-12 border-t border-black/[0.05]">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display font-800 text-3xl text-slate-850">{title}</h2>
          {subtitle && <p className="text-black/55 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {viewAllLink && (
            <Link href={viewAllLink} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-coral hover:text-coral-dark transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-full bg-white hover:bg-coral border border-black/10 hover:border-coral text-slate-850 hover:text-white transition-all focus-ring shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-full bg-white hover:bg-coral border border-black/10 hover:border-coral text-slate-850 hover:text-white transition-all focus-ring shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {items.map((item, i) => (
            <div key={item._id || i} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
              <PhoneCard phone={item} />
            </div>
          ))}
        </div>
      </div>

      {viewAllLink && (
        <div className="mt-6 sm:hidden">
          <Link href={viewAllLink} className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-black/10 rounded-xl text-sm font-semibold text-slate-850 hover:bg-black/5 transition-colors shadow-sm">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
