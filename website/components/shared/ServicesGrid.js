"use client";
import Link from "next/link";
import { Smartphone, Laptop, Watch, Headphones, MapPin, Recycle, Wrench, ShieldCheck, Zap, ArrowRight, HardDrive } from "lucide-react";

export default function ServicesGrid() {
  const services = [
    {
      title: "Buy Phones",
      icon: Smartphone,
      href: "/store",
      color: "from-coral/20 to-orange-500/10",
      textColor: "text-coral",
      borderColor: "border-coral/20",
      badge: "HOT"
    },
    {
      title: "Sell Device",
      icon: Recycle,
      href: "/sell",
      color: "from-emerald-500/20 to-emerald-400/10",
      textColor: "text-emerald-500",
      borderColor: "border-emerald-500/20"
    },
    {
      title: "Buy Laptops",
      icon: Laptop,
      href: "/coming-soon",
      color: "from-blue-500/20 to-cyan-500/10",
      textColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      badge: "Coming Soon"
    },
    {
      title: "Repair Phone",
      icon: Wrench,
      href: "/repair",
      color: "from-purple-500/20 to-pink-500/10",
      textColor: "text-purple-500",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Accessories",
      icon: Headphones,
      href: "/coming-soon",
      color: "from-amber-500/20 to-yellow-500/10",
      textColor: "text-amber-500",
      borderColor: "border-amber-500/20",
      badge: "Coming Soon"
    },
    {
      title: "Buy Parts",
      icon: HardDrive,
      href: "/parts",
      color: "from-cyan-500/20 to-blue-500/10",
      textColor: "text-cyan-500",
      borderColor: "border-cyan-500/20"
    },
    {
      title: "Smartwatches",
      icon: Watch,
      href: "/coming-soon",
      color: "from-rose-500/20 to-red-500/10",
      textColor: "text-rose-500",
      borderColor: "border-rose-500/20",
      badge: "Coming Soon"
    },
    {
      title: "Find Stores",
      icon: MapPin,
      href: "/stores",
      color: "from-slate-500/20 to-slate-400/10",
      textColor: "text-slate-600",
      borderColor: "border-slate-500/20",
      badge: "Coming Soon"
    },
  ];

  return (
    <section className="py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display font-800 text-3xl text-slate-850">Our Services</h2>
          <p className="text-black/55 text-sm mt-1">Everything you need in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5">
        {services.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="group relative bg-white border border-black/[0.06] rounded-[20px] p-5 flex flex-col items-center justify-center gap-4 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-black/[0.12]"
          >
            {s.badge && (
              <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm
                ${s.badge === "HOT" ? "bg-coral text-white" : "bg-black text-white"}`}>
                {s.badge}
              </span>
            )}
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${s.color} border ${s.borderColor} group-hover:scale-110 transition-transform duration-300`}>
              <s.icon className={`h-6 w-6 ${s.textColor}`} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold font-display text-slate-850 group-hover:text-coral transition-colors text-center leading-tight">
              {s.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
