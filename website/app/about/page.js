import Link from "next/link";
import { ScanLine, ShieldCheck, Zap, Store, Users, Wrench, Lock, Star, AlertTriangle, BatteryWarning, Image as ImageIcon, Banknote } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";

export const metadata = {
  title: "About ZYPHOR — India's Trusted Phone Marketplace",
  description: "Learn how ZYPHOR's AI verification system protects every buyer and seller in the used-phone market."
};

const SCORE_COMPONENTS = [
  { label: "Physical / Cosmetic Condition", max: 25, color: "bg-signal-green", desc: "AI analyses photos to detect scratches, dents, cracks. Compared against the seller's self-reported grade." },
  { label: "Functional / Technical Condition", max: 25, color: "bg-signal-green", desc: "Battery health screenshot OCR, speaker/mic test video, screen touch-pattern test evidence." },
  { label: "Document & IMEI Authenticity", max: 20, color: "bg-blue-400", desc: "15-digit Luhn validation, TAC brand check, and CEIR (India's official govt blacklist) status. Black IMEI = instant hard block." },
  { label: "Seller Reliability", max: 15, color: "bg-signal-amber", desc: "Account history, KYC level, past return rate, how complete and consistent the submitted evidence is." },
  { label: "Price Fairness", max: 15, color: "bg-coral", desc: "Price vs estimated fair market value for that model/grade/city. Suspicious underpricing is flagged as a scam risk." }
];

const TEAM_VALUES = [
  { icon: <ShieldCheck className="h-6 w-6" />, title: "Trust is the product", body: "We are a trust layer, not just a listing site. If a phone can't be verified, it doesn't go live." },
  { icon: <ScanLine className="h-6 w-6" />, title: "Transparent scoring", body: "Every Trust Score is broken into 5 published components. No black boxes. You see exactly why a listing scored 88 vs 61." },
  { icon: <Zap className="h-6 w-6" />, title: "AI that explains itself", body: "Our AI agents produce plain-language summaries — not just a number. In Hindi, Hinglish or English." },
  { icon: <Lock className="h-6 w-6" />, title: "Escrow by default", body: "Buyer funds are held until delivery is confirmed. No payment is released to sellers until you say so." }
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-white py-20">
        <Container className="max-w-3xl text-center">
          <p className="font-mono text-xs tracking-widest text-signal-green mb-4 uppercase">About ZYPHOR</p>
          <h1 className="font-display font-700 text-4xl sm:text-5xl tracking-tight leading-tight">
            India&apos;s used-phone market
            <br />
            <span className="text-coral">needed a trust layer.</span>
          </h1>
          <p className="mt-6 text-white/60 text-lg leading-relaxed">
            Millions of phones change hands in India every year through WhatsApp groups, Facebook
            Marketplace, and local dealers — with zero verification. Stolen phones get resold.
            Batteries are misrepresented. Buyers get burned. ZYPHOR was built to fix that.
          </p>
        </Container>
      </section>

      {/* Problem */}
      <section className="py-20 bg-paper">
        <Container>
          <SectionHeading
            eyebrow="The problem we solve"
            title="The hidden fraud in used-phone buying"
            align="center"
            className="mb-14 max-w-2xl mx-auto"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <AlertTriangle className="h-8 w-8 text-red-500" />, title: "Stolen phones", body: "India's CEIR database lists thousands of blacklisted IMEIs. Most resale platforms don't check any of them before listing." },
              { icon: <BatteryWarning className="h-8 w-8 text-amber-500" />, title: "Battery lies", body: "'Battery 95%' claims are unverified on every major platform. A phone in heavy use for 2 years cannot have 95% health." },
              { icon: <ImageIcon className="h-8 w-8 text-blue-500" />, title: "Stock photo fraud", body: "Sellers reuse official brand photos instead of real device photos. Buyers receive something completely different." },
              { icon: <Banknote className="h-8 w-8 text-emerald-500" />, title: "Price scams", body: "Suspiciously low prices (flagship phones at ₹5,000) are scam listings designed to collect payment and disappear." }
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-white border border-black/[0.06] rounded-xl p-5">
                <div className="mb-4">{icon}</div>
                <h3 className="font-display font-600 text-base text-slate-850 mb-2">{title}</h3>
                <p className="text-sm text-black/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How verification works */}
      <section id="verification" className="py-20">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="AI Verification — step by step"
            subtitle="Every ZYPHOR listing goes through this pipeline before any buyer sees it."
            align="center"
            className="mb-14"
          />
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { step: "01", title: "Guided evidence capture", body: "Sellers are walked through a fixed checklist in the app: front/back/side photos, a screen-on test-pattern photo, speaker+mic video, camera test shot, battery health Settings screenshot, and IMEI entry (*#06# prompt shown in-app). Nothing is optional." },
              { step: "02", title: "IMEI format + CEIR blacklist check", body: "We validate the 15-digit IMEI with a Luhn checksum, identify the brand via TAC lookup, and check it against India's official CEIR (Central Equipment Identity Register). A Black IMEI triggers an instant hard block — the listing is killed and the case is flagged to our fraud team." },
              { step: "03", title: "AI vision condition grading", body: "A multimodal AI model analyses every photo and video, detecting scratches, cracks, dents, and screen damage. It compares the visual evidence against the seller's self-reported condition grade and claims. Inconsistencies are flagged as warnings or trust-score deductions." },
              { step: "04", title: "Price anomaly detection", body: "The listing price is compared against an estimated fair market value for that model, grade, and city. Prices more than 40% below market are flagged for manual review as a potential scam listing." },
              { step: "05", title: "Trust Score computation", body: "Five weighted components are scored and combined into a 0–100 Trust Score. Listings scoring ≥80 are auto-published as 'AI Verified'. Scores 50–79 go to human review. Below 50 (or any Black IMEI) means the listing is blocked." }
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-5 bg-white border border-black/[0.06] rounded-xl p-5">
                <span className="font-mono font-600 text-2xl text-black/15 flex-shrink-0 w-10 pt-0.5">{step}</span>
                <div>
                  <h3 className="font-display font-600 text-base text-slate-850 mb-1.5">{title}</h3>
                  <p className="text-sm text-black/60 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Trust Score breakdown */}
      <section id="trust-score" className="py-20 bg-paper">
        <Container>
          <SectionHeading
            eyebrow="Trust Score"
            title="Transparent. Published. Explainable."
            subtitle="The score is broken into 5 components you can see on every listing. No black box."
            align="center"
            className="mb-12"
          />
          <div className="max-w-2xl mx-auto space-y-5">
            {SCORE_COMPONENTS.map(({ label, max, color, desc }) => (
              <div key={label} className="bg-white border border-black/[0.06] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-slate-850">{label}</span>
                  <span className="font-mono text-sm text-black/50">/{max} pts</span>
                </div>
                <div className="h-2 bg-black/[0.06] rounded-full mb-3">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${(max / 25) * 100}%` }} />
                </div>
                <p className="text-xs text-black/55 leading-relaxed">{desc}</p>
              </div>
            ))}
            <div className="bg-ink text-white rounded-xl p-5 flex justify-between items-center">
              <span className="font-display font-700 text-lg">Total Trust Score</span>
              <span className="font-mono text-2xl font-700">/ 100</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Our values */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Our values"
            title="What ZYPHOR stands for"
            align="center"
            className="mb-12"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM_VALUES.map(({ icon, title, body }) => (
              <div key={title} className="bg-white border border-black/[0.06] rounded-xl p-6">
                <div className="h-11 w-11 rounded-xl bg-ink flex items-center justify-center text-white mb-4">{icon}</div>
                <h3 className="font-display font-600 text-base text-slate-850 mb-2">{title}</h3>
                <p className="text-sm text-black/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Roles */}
      <section className="py-20 bg-ink text-white">
        <Container>
          <SectionHeading
            eyebrow="The ecosystem"
            title="Every role, one platform"
            subtitle="ZYPHOR connects five types of participants — each with their own AI-powered tools."
            align="center"
            className="mb-12 [&_h2]:text-white [&_p]:text-white/60"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: <ShieldCheck className="h-5 w-5" />, role: "Customer", items: ["Buy with trust score", "Sell with AI verification", "AI Advisor for picks", "IMEI check tool"] },
              { icon: <Store className="h-5 w-5" />, role: "Retailer", items: ["Inventory management", "AI-verified listings", "Sales analytics", "Order management"] },
              { icon: <Users className="h-5 w-5" />, role: "Wholesaler", items: ["Bulk lot listings", "Retailer network", "Inventory dashboard", "Bulk orders"] },
              { icon: <Wrench className="h-5 w-5" />, role: "Technician", items: ["Repair job queue", "IMEI-linked records", "Device Health Report", "Verification jobs"] },
              { icon: <ScanLine className="h-5 w-5" />, role: "Admin", items: ["User management", "AI log audit trail", "Dispute resolution", "Fraud dashboard"] }
            ].map(({ icon, role, items }) => (
              <div key={role} className="bg-white/[0.05] border border-white/10 rounded-xl p-5">
                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center mb-3">{icon}</div>
                <p className="font-display font-600 text-base mb-3">{role}</p>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="text-xs text-white/55 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-signal-green flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container className="text-center max-w-xl">
          <h2 className="font-display font-700 text-3xl text-slate-850 mb-4">
            Ready to buy or sell with confidence?
          </h2>
          <p className="text-black/55 mb-8">
            Join thousands of buyers and sellers who trust ZYPHOR&apos;s AI verification.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/marketplace"
              className="bg-coral hover:bg-coral-dark text-white font-display font-600 px-7 py-3 rounded-xl text-sm transition-colors focus-ring">
              Browse marketplace
            </Link>
            <Link href="/signup"
              className="border border-black/15 hover:border-black/30 text-black/70 hover:text-black font-display font-600 px-7 py-3 rounded-xl text-sm transition-colors focus-ring">
              Create free account
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
