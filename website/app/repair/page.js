import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Link from "next/link";
import { Wrench, ShieldCheck, Clock, MapPin, Smartphone, Battery, Cpu, CheckCircle2, ChevronRight } from "lucide-react";

export default function RepairPage() {
  const services = [
    { title: "Screen Replacement", desc: "Original & high-grade OLED/LCD screens with warranty.", icon: <Smartphone className="h-6 w-6 text-coral" />, price: "Starting ₹1,499" },
    { title: "Battery Replacement", desc: "100% genuine health battery packs installed at doorstep.", icon: <Battery className="h-6 w-6 text-signal-green" />, price: "Starting ₹899" },
    { title: "Motherboard & IC Repair", desc: "Expert micro-soldering for dead or water-damaged phones.", icon: <Cpu className="h-6 w-6 text-cyan-400" />, price: "Starting ₹1,999" },
    { title: "Camera & Lens Repair", desc: "Fix blurry focus, broken glass, or sensor errors.", icon: <Wrench className="h-6 w-6 text-amber-400" />, price: "Starting ₹999" },
  ];

  return (
    <div className="bg-paper min-h-screen">
      {/* Hero Banner (LIGHT) */}
      <div className="relative overflow-hidden bg-paper border-b border-black/[0.05]">
        <Container className="relative py-12 text-center z-10">
          <span className="text-[10px] font-mono font-bold text-coral bg-coral/10 border border-coral/20 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">
            Verified Doorstep Service
          </span>
          <h1 className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl text-slate-850 leading-tight mb-3">
            Book a <span className="text-coral">Repair</span>
          </h1>
          <p className="text-black/60 text-sm max-w-xl mx-auto mb-8">
            Get your device fixed by certified technicians at your doorstep. Fast, reliable, and verified.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/repair/book"
              className="bg-coral hover:bg-coral-dark text-white font-display font-600 px-7 py-3.5 rounded-xl transition-all shadow-sm focus-ring inline-flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" /> Book Repair Now
            </Link>
            <Link
              href="/stores"
              className="border border-black/10 bg-white hover:border-black/20 text-slate-850 hover:bg-black/5 font-display font-600 px-7 py-3.5 rounded-xl transition-all focus-ring inline-flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" /> Find Repair Store
            </Link>
          </div>
        </Container>
      </div>

      {/* Services Grid */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Expert Fixes"
            title="Our Repair Services"
            subtitle="Transparent pricing with zero hidden fees. Includes doorstep service charge."
            align="center"
            className="mb-14"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-black/[0.06] hover:shadow-lg transition-all flex flex-col justify-between group">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-paper flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <h3 className="font-display font-600 text-lg text-slate-850 mb-2">{s.title}</h3>
                  <p className="text-black/55 text-sm leading-relaxed mb-6">{s.desc}</p>
                </div>
                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-850">{s.price}</span>
                  <Link href="/repair/book" className="text-xs font-medium text-coral hover:underline inline-flex items-center">
                    Book <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white border-y border-black/[0.06]">
        <Container>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-signal-green/10 flex items-center justify-center text-signal-green shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-600 text-base mb-1">30-Min Doorstep Fix</h4>
                <p className="text-sm text-black/55">Most repairs completed right in front of your eyes within 30 minutes.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center text-coral shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-600 text-base mb-1">6-Month Warranty</h4>
                <p className="text-sm text-black/55">Hassle-free warranty on all replaced parts with free technician revisit.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-ink/10 flex items-center justify-center text-white shrink-0 bg-ink">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-600 text-base mb-1">100% Data Safe</h4>
                <p className="text-sm text-black/55">Your personal photos and data remain completely secure and untouched.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
