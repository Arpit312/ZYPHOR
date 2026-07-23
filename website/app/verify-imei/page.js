"use client";

import { Wrench, ShieldAlert, Clock, ArrowLeft } from "lucide-react";
import Container from "@/components/shared/Container";
import Link from "next/link";

export default function IMEICheckPage() {
  return (
    <section className="py-20 bg-paper min-h-screen flex items-center justify-center">
      <Container className="max-w-xl">
        <div className="bg-white border border-black/[0.08] rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-fade-in">
          
          {/* Maintenance Icon Badge */}
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 mb-2">
            <Wrench className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5" /> Under Maintenance
            </span>
            <h1 className="font-display font-700 text-3xl text-slate-850">
              IMEI Verification AI is Upgrading
            </h1>
            <p className="text-sm text-black/60 leading-relaxed max-w-md mx-auto">
              Hum ZYPHOR AI IMEI &amp; CEIR Scanner service ko real-time Indian telecom database integration ke sath upgrade kar rahe hain.
            </p>
          </div>

          <div className="bg-paper border border-black/5 rounded-2xl p-5 text-xs font-mono text-left space-y-2 text-black/70">
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-black/40">Status:</span>
              <span className="font-bold text-amber-600">SCHEDULED MAINTENANCE</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-black/40">Upgrading Engine:</span>
              <span className="font-bold text-slate-850">GSMA TAC &amp; CEIR Database v2.5</span>
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
              className="inline-flex items-center gap-2 bg-slate-850 hover:bg-black text-white font-display font-600 text-xs px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <Link
              href="/ai-advisor"
              className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-display font-600 text-xs px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              Try AI Advisor Instead
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
