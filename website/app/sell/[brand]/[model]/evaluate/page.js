import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Link from "next/link";
import { Zap, CheckCircle2, ChevronLeft, ShieldCheck, ArrowRight } from "lucide-react";

export default function SellEvaluationPage({ params }) {
  const brand = params?.brand || "Apple";
  const model = params?.model || "iPhone 13";

  const questions = [
    { id: "power", title: "Does your phone turn on and function properly?", options: ["Yes", "No"] },
    { id: "screen", title: "What is the condition of the screen?", options: ["Flawless (No scratches)", "Minor Scratches", "Cracked Glass", "Display Touch Not Working"] },
    { id: "body", title: "What is the condition of the phone body / back glass?", options: ["Flawless", "Normal Wear & Tear", "Major Dents / Bent Body"] },
    { id: "functional", title: "Are any of these components defective?", options: ["Camera", "Wifi / Bluetooth", "Battery Health < 80%", "None - All Work Perfectly"] }
  ];

  return (
    <div className="py-12 bg-paper min-h-screen">
      <Container>
        <Link href="/sell" className="inline-flex items-center text-sm font-medium text-black/50 hover:text-coral transition-colors mb-6 focus-ring">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Brand Selection
        </Link>

        <SectionHeading
          title={`Evaluate Your ${brand} ${model}`}
          eyebrow="Instant Valuation Agent"
          subtitle="Answer 4 quick diagnostic questions to get an exact AI-driven price quote for instant cash pickup."
          className="mb-10"
        />

        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-10 border border-black/[0.06] shadow-sm space-y-8">
          
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-3">
              <h3 className="font-display font-600 text-base text-slate-850 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-coral/10 text-coral text-xs flex items-center justify-center font-mono">{idx + 1}</span>
                {q.title}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => (
                  <button
                    key={opt}
                    className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                      oIdx === 0 ? "border-coral bg-coral/5 text-coral" : "border-black/10 hover:border-black/30 text-slate-850"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Value Calculation Result */}
          <div className="pt-8 border-t border-black/5 bg-ink p-6 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-signal-green uppercase tracking-wider block mb-1">Instant Quote Ready</span>
              <h4 className="font-display font-700 text-3xl">₹28,500</h4>
              <p className="text-xs text-white/50 mt-1">Includes doorstep pickup & instant UPI payout.</p>
            </div>
            <Link
              href="/sell"
              className="w-full sm:w-auto bg-coral hover:bg-coral-dark text-white font-display font-600 px-7 py-3.5 rounded-xl transition-colors focus-ring flex items-center justify-center gap-2 text-sm"
            >
              Schedule Pickup <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
}
