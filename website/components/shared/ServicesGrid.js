"use client";
import Link from "next/link";
import { Smartphone, Laptop, Watch, Headphones, MapPin, Recycle, Wrench, ShieldCheck, Zap, ArrowRight, HardDrive } from "lucide-react";

export default function ServicesGrid() {
  const services = [
    {
      title: "Buy Phones",
      icon: Smartphone,
      href: "/store",
      color: "from-coral/20 to-orange-500/5",
      textColor: "text-coral",
      borderColor: "border-coral/20",
      badge: "HOT"
    },
    {
      title: "Sell Device",
      icon: Recycle,
      href: "/sell",
      color: "from-emerald-500/20 to-emerald-400/5",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20"
    },
    {
      title: "Buy Laptops",
      icon: Laptop,
      href: "#laptops",
      color: "from-blue-500/20 to-cyan-500/5",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/20",
      badge: "Coming Soon"
    },
    {
      title: "Repair Phone",
      icon: Wrench,
      href: "/repair",
      color: "from-purple-500/20 to-pink-500/5",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Buy Accessories",
      icon: Headphones,
      href: "/store",
      color: "from-amber-500/20 to-yellow-500/5",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/20",
      badge: "Sale"
    },
    {
      title: "Buy Parts",
      icon: HardDrive,
      href: "/parts",
      color: "from-cyan-500/20 to-blue-500/5",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/20"
    },
    {
      title: "Smartwatches",
      icon: Watch,
      href: "/store",
      color: "from-rose-500/20 to-red-500/5",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/20"
    },
    {
      title: "Find Stores",
      icon: MapPin,
      href: "/stores",
      color: "from-white/10 to-white/5",
      textColor: "text-white/70",
      borderColor: "border-white/10"
    },
  ];

  return (
    <section className="py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display font-800 text-3xl text-slate-850">Our Services</h2>
          <p className="text-black/55 text-sm mt-1">Everything you need in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {services.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className={`group relative bg-gradient-to-br ${s.color.replace('white/10', 'black/5').replace('white/5', 'black/5')} border ${s.borderColor.replace('white/10', 'black/10')} rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg`}
          >
            {s.badge && (
              <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full whitespace-nowrap
                ${s.badge === "HOT" ? "bg-coral text-white" : s.badge === "Coming Soon" ? "bg-blue-500 text-white" : "bg-amber-500 text-black"}`}>
                {s.badge}
              </span>
            )}
            <div className={`p-3 rounded-xl bg-white border border-black/5 group-hover:scale-110 transition-transform shadow-sm`}>
              <s.icon className={`h-6 w-6 ${s.textColor.replace('white/70', 'slate-850')}`} strokeWidth={1.5} />
            </div>
            <span className="text-[11px] font-semibold font-mono text-center text-slate-850 group-hover:text-coral leading-tight">
              {s.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
