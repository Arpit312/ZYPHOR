import Container from "@/components/shared/Container";
import Link from "next/link";
import { Wrench, MapPin, Clock, ArrowLeft, Building2 } from "lucide-react";

export const metadata = {
  title: "Store Locator — ZYPHOR (Under Maintenance)",
  description: "Zyphor Store Locator service is currently under scheduled maintenance."
};

export default function StoresPage() {
  return (
    <div className="bg-paper min-h-screen flex flex-col">
      {/* Hero Banner (LIGHT) */}
      <div className="relative overflow-hidden bg-paper border-b border-black/[0.05] shrink-0">
        <Container className="relative py-12 text-center z-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
            <Building2 className="h-3.5 w-3.5" /> Under Maintenance
          </div>
          <h1 className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl text-slate-850 leading-tight mb-3">
            Find <span className="text-coral">Stores</span>
          </h1>
          <p className="text-black/60 text-sm max-w-xl mx-auto">
            Zyphor Experience Store Locator &amp; Kiosk Geo-Mapping service.
          </p>
        </Container>
      </div>

      <section className="flex-1 py-12 flex items-center justify-center">
        <Container className="max-w-xl">
          <div className="bg-white border border-black/[0.08] rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6 animate-fade-in">
            
            {/* Icon Badge */}
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-amber-50 border border-amber-100 text-amber-600 mb-2">
              <Wrench className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-700 text-2xl text-slate-850">
                Store Locator Upgrading
              </h2>
              <p className="text-sm text-black/60 leading-relaxed max-w-md mx-auto">
                Hum Zyphor Experience Store Locator ko pan-India expansion ke sath upgrade kar rahe hain.
              </p>
            </div>

            <div className="bg-paper border border-black/5 rounded-2xl p-5 text-xs font-mono text-left space-y-2 text-black/70">
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-black/40">Status:</span>
                <span className="font-bold text-amber-600">SCHEDULED MAINTENANCE</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-black/40">Upgrading Network:</span>
                <span className="font-bold text-slate-850">Geo-Store Locator v2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/40">Estimated Back Online:</span>
                <span className="font-bold text-signal-green flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Coming Back Soon
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-paper hover:bg-black/5 text-slate-850 font-display font-600 text-xs px-6 py-3 rounded-xl transition-colors border border-black/10"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-display font-600 text-xs px-6 py-3 rounded-xl transition-colors shadow-sm focus-ring"
              >
                Browse Online Store
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
