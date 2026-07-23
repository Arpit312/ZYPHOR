import Link from "next/link";
import { ScanLine, ShieldCheck, Zap, Store, Wrench, Users, Target, Lightbulb } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import Container from "@/components/shared/Container";
import IntroWrapper from "@/components/shared/IntroWrapper";

export default function HomePage() {
  return (
    <>
      <IntroWrapper />
      {/* ─── HERO ─── */}
      <section className="bg-ink text-white overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right,rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.1) 1px,transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        <Container className="py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-[0.25em] text-signal-green mb-5 uppercase">
              AI-VERIFIED · IMEI-SCREENED · TRUST-SCORED
            </p>
            <h1 className="font-display font-700 text-4xl sm:text-5xl md:text-6xl leading-[1.08] tracking-tight">
              Buy &amp; sell phones
              <br />
              <span className="text-coral">you can actually trust.</span>
            </h1>
            <p className="mt-6 text-white/65 text-lg max-w-xl leading-relaxed">
              Every listing on ZYPHOR is checked by AI — condition graded, IMEI verified against
              India&apos;s theft blacklist, and scored before you ever see it. No more buying surprises.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark transition-colors text-white font-display font-600 px-7 py-3.5 rounded-lg text-base focus-ring"
              >
                Browse store <span aria-hidden>→</span>
              </Link>
              <Link
                href="/ai-advisor"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/85 hover:text-white transition-colors font-display font-600 px-7 py-3.5 rounded-lg text-base focus-ring"
              >
                <Zap className="h-4 w-4 text-signal-green" />
                Ask AI Advisor
              </Link>
            </div>
          </div>

          {/* Trust metrics strip */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-12">
            {[
              { n: "6,000+", label: "Verified listings" },
              { n: "91%", label: "Avg. AI trust score" },
              { n: "₹0", label: "IMEI check cost" },
              { n: "48h", label: "Avg. verification time" }
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="font-display font-700 text-3xl text-white">{n}</p>
                <p className="text-white/45 text-sm mt-1 font-mono">{label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 bg-paper">
        <Container>
          <SectionHeading
            eyebrow="How ZYPHOR works"
            title="Trusted in 5 steps"
            subtitle="From listing to verified sale — AI does the heavy lifting so you don't have to guess."
            align="center"
            className="mb-14"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: <Store className="h-6 w-6" />, step: "01", title: "Seller lists", body: "Photos, IMEI, battery health screenshot — a guided checklist walks sellers through every required piece of evidence." },
              { icon: <ScanLine className="h-6 w-6" />, step: "02", title: "IMEI screened", body: "We validate the IMEI format and cross-check it with India's CEIR government database. Black-listed IMEIs are blocked instantly." },
              { icon: <ShieldCheck className="h-6 w-6" />, step: "03", title: "AI verifies", body: "Our Verification Agent analyses photos, compares condition claims to evidence, and catches inconsistencies humans miss." },
              { icon: <Zap className="h-6 w-6" />, step: "04", title: "Trust Score set", body: "A transparent 0–100 score, broken down across 5 components, is attached to every listing. Nothing is hidden." },
              { icon: <Users className="h-6 w-6" />, step: "05", title: "You buy safely", body: "Payment is held in escrow until you confirm delivery and condition. Dispute? Our team steps in within 24 h." }
            ].map(({ icon, step, title, body }) => (
              <div key={step} className="relative bg-white rounded-xl p-6 border border-black/[0.06] shadow-sm">
                <div className="absolute top-4 right-4 font-mono text-xs text-black/20">{step}</div>
                <div className="h-10 w-10 rounded-lg bg-ink flex items-center justify-center text-white mb-4">
                  {icon}
                </div>
                <h3 className="font-display font-600 text-base text-slate-850 mb-2">{title}</h3>
                <p className="text-sm text-black/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── AI ADVISOR TEASER ─── */}
      <section className="py-20 bg-ink text-white">
        <Container className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs tracking-widest text-signal-green mb-3 uppercase">
              AI Agent #2
            </p>
            <h2 className="font-display font-700 text-3xl md:text-4xl tracking-tight leading-tight">
              Not sure which phone to buy?
              <span className="text-coral"> Ask our AI.</span>
            </h2>
            <p className="mt-5 text-white/60 leading-relaxed">
              Tell us your budget and what you use your phone for — gaming, camera, battery, study.
              Our AI Advisor scans the live catalog and returns the top 3 matches with an honest
              explanation of every trade-off. In Hindi, Hinglish, or English.
            </p>
            <Link
              href="/ai-advisor"
              className="mt-8 inline-flex items-center gap-2 bg-coral hover:bg-coral-dark transition-colors text-white font-display font-600 px-6 py-3 rounded-lg text-sm focus-ring"
            >
              <Zap className="h-4 w-4" />
              Try AI Advisor — free
            </Link>
          </div>

          {/* Fake chat preview */}
          <div className="bg-ink-700 rounded-2xl p-6 border border-white/10 space-y-4 font-mono text-sm">
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-coral flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">U</div>
              <div className="bg-ink-600 rounded-xl px-4 py-3 text-white/80">
                Budget ₹15,000 hai, gaming + battery focus chahiye
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="bg-signal-green/20 border border-signal-green/30 rounded-xl px-4 py-3 text-signal-green text-right max-w-xs">
                Top 3 recommendations ready ✓<br />
                <span className="text-white/70 text-xs">Trust scores: 81 · 78 · 74</span>
              </div>
              <div className="h-7 w-7 rounded-full bg-signal-green/20 flex-shrink-0 flex items-center justify-center">
                <ScanLine className="h-4 w-4 text-signal-green" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-coral flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">U</div>
              <div className="bg-ink-600 rounded-xl px-4 py-3 text-white/80">
                Camera bhi theek ho toh better hoga
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="bg-signal-green/20 border border-signal-green/30 rounded-xl px-4 py-3 text-signal-green text-right max-w-xs">
                Updated! Poco X6 at ₹14,200 is your best match — 200MP macro, 5000mAh, Trust 78 ✓
              </div>
              <div className="h-7 w-7 rounded-full bg-signal-green/20 flex-shrink-0 flex items-center justify-center">
                <ScanLine className="h-4 w-4 text-signal-green" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── ABOUT & VISION ─── */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coral/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3" />
        
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-coral font-mono text-xs font-bold tracking-widest uppercase mb-4 block">
              Who We Are
            </span>
            <h2 className="font-display font-800 text-4xl sm:text-5xl text-slate-850 leading-tight">
              Revolutionizing India's Refurbished Electronics Market
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto">
            {/* Our Vision */}
            <div className="space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-coral/10 flex items-center justify-center text-coral border border-coral/20">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="font-display font-700 text-3xl text-slate-850">Our Vision</h3>
              <div className="space-y-4 text-black/60 leading-relaxed">
                <p>
                  At ZYPHOR, we believe buying a pre-owned device shouldn't feel like a gamble. Our vision is to create India's most transparent and trusted ecosystem for refurbished electronics.
                </p>
                <p>
                  By leveraging state-of-the-art Artificial Intelligence and strict verification protocols, we are eliminating fraud, hiding nothing, and bringing complete peace of mind to every transaction.
                </p>
              </div>
            </div>

            {/* Our Mission */}
            <div className="space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <Lightbulb className="h-7 w-7" />
              </div>
              <h3 className="font-display font-700 text-3xl text-slate-850">The Mission</h3>
              <div className="space-y-4 text-black/60 leading-relaxed">
                <p>
                  We aim to bridge the gap between local retailers, technicians, and everyday consumers by unifying them under one verified platform.
                </p>
                <p>
                  Whether you're looking for a budget smartphone, genuine spare parts, or doorstep repair services, ZYPHOR ensures standard pricing, guaranteed quality, and a seamless digital experience.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── ROLES CTA ─── */}
      <section className="py-20 bg-paper">
        <Container>
          <SectionHeading
            eyebrow="Join ZYPHOR"
            title="One platform. Every role."
            align="center"
            className="mb-12"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { role: "retailer", icon: <Store className="h-6 w-6" />, title: "Retailer", body: "List inventory, get AI-verified badges, manage orders. 3-month free onboarding.", href: "/signup?role=retailer" },
              { role: "wholesaler", icon: <Users className="h-6 w-6" />, title: "Wholesaler", body: "Sell in bulk to a verified retailer network. Inventory dashboard included.", href: "/signup?role=wholesaler" },
              { role: "technician", icon: <Wrench className="h-6 w-6" />, title: "Technician", body: "Accept verification jobs, issue Device Health Reports tied to IMEI.", href: "/signup?role=technician" },
              { role: "customer", icon: <ShieldCheck className="h-6 w-6" />, title: "Buyer / Seller", body: "Start buying or selling in minutes. AI does the verification for you.", href: "/signup" }
            ].map(({ icon, title, body, href }) => (
              <Link
                key={title}
                href={href}
                className="group bg-white border border-black/[0.06] rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all focus-ring"
              >
                <div className="h-10 w-10 rounded-lg bg-ink flex items-center justify-center text-white mb-4 group-hover:bg-coral transition-colors">
                  {icon}
                </div>
                <h3 className="font-display font-600 text-base text-slate-850 mb-2">{title}</h3>
                <p className="text-sm text-black/55 leading-relaxed">{body}</p>
                <span className="mt-4 inline-block text-xs font-mono text-coral group-hover:underline">
                  Join as {title} →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── FREE IMEI TOOL ─── */}
      <section className="py-16 bg-signal-green/5 border-y border-signal-green/20">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-signal-green flex items-center justify-center text-white animate-pulse-ring shrink-0">
              <ScanLine className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-700 text-lg text-slate-850">Free IMEI Check</h3>
              <p className="text-sm text-black/55">Verify any phone&apos;s blacklist status before you buy — no account needed.</p>
            </div>
          </div>
          <Link
            href="/verify-imei"
            className="flex-shrink-0 bg-signal-green hover:opacity-90 transition-opacity text-white font-display font-600 px-6 py-3 rounded-lg text-sm focus-ring"
          >
            Check IMEI now — free
          </Link>
        </Container>
      </section>
    </>
  );
}
