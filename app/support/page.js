import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { HelpCircle, ShieldCheck, PhoneCall, Mail, MessageSquare } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    { q: "How does Zyphor AI verification work?", a: "Sellers upload phone photos, screen touch tests, and IMEI. Our AI model checks for screen damage, body dents, camera glass condition, and cross-checks the IMEI against CEIR theft databases." },
    { q: "What is the Zyphor Warranty policy?", a: "Every verified device bought on Zyphor includes a complimentary 6-month warranty covering functional defects, battery health degradation below 80%, and display issues." },
    { q: "How do I claim a return or refund?", a: "If your received item doesn't match the AI Trust Score report within 7 days of delivery, raise a claim directly from your Orders page for an instant replacement or 100% refund." },
    { q: "How does doorstep selling pickup work?", a: "Once you accept the instant valuation quote, an authorized technician visits your location, runs an on-the-spot physical diagnostic, and transfers cash/UPI immediately." }
  ];

  return (
    <div className="py-12 bg-paper min-h-screen">
      <Container>
        <SectionHeading
          title="Help & Support Center"
          eyebrow="Zyphor Assurance"
          subtitle="Need assistance with an order, warranty claim, or device verification?"
          className="mb-10"
        />

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-black/[0.06] text-center hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="h-6 w-6" />
            </div>
            <h3 className="font-display font-600 text-base text-slate-850 mb-1">Call Support</h3>
            <p className="text-xs text-black/55 mb-4">Mon-Sat, 9am - 8pm IST</p>
            <a href="tel:18001234567" className="text-sm font-semibold text-coral hover:underline">+91 1800-123-4567</a>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/[0.06] text-center hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-signal-green/10 text-signal-green flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-display font-600 text-base text-slate-850 mb-1">Live Chat</h3>
            <p className="text-xs text-black/55 mb-4">AI Support available 24/7</p>
            <button className="text-sm font-semibold text-signal-green hover:underline">Start Chat Now</button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/[0.06] text-center hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-ink/10 text-slate-850 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-display font-600 text-base text-slate-850 mb-1">Email Care</h3>
            <p className="text-xs text-black/55 mb-4">Responses within 4 hours</p>
            <a href="mailto:support@zyphor.in" className="text-sm font-semibold text-slate-850 hover:underline">support@zyphor.in</a>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-700 text-2xl text-slate-850 mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-coral" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-black/[0.06]">
                <h3 className="font-display font-600 text-base text-slate-850 mb-2">{f.q}</h3>
                <p className="text-sm text-black/60 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
