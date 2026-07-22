"use client";

import { useState } from "react";
import { Mail, MessageSquare, Store, Wrench, ScanLine } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";

const FAQ = [
  { q: "How does AI verification work?", a: "Sellers submit guided photos, IMEI, and battery health evidence. Our AI analyses condition, validates the IMEI against India's CEIR blacklist, checks price fairness, and produces a 0–100 Trust Score broken into 5 components. All of this happens automatically in under 10 seconds." },
  { q: "What does a Black IMEI mean?", a: "A Black IMEI means the phone has been reported lost, stolen, or network-blocked. ZYPHOR hard-blocks any listing with a Black IMEI before it goes live. The case is flagged to our fraud team." },
  { q: "How does escrow work?", a: "When you buy on ZYPHOR, your payment is held securely until you confirm you've received the device and it matches the listing. Only then is the payment released to the seller. If there's a dispute, our team steps in within 24 hours." },
  { q: "I'm a retailer — how do I join?", a: "Sign up and select 'Retailer' as your role. The onboarding flow will walk you through submitting your business details. Retailer accounts are free for the first 3 months." },
  { q: "Is the IMEI check really free?", a: "Yes, completely free, forever, no account needed. Visit /verify-imei to check any phone's IMEI format and get the direct link to India's official CEIR government blacklist check." },
  { q: "What happens if a listing fails verification?", a: "The listing is blocked and the seller is notified with specific reasons. They can fix the issues (better evidence, correct the IMEI, etc.) and re-submit. A Black IMEI is a permanent block — that listing can never go live on ZYPHOR." }
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", type: "general", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  }

  return (
    <>
      <section className="bg-ink text-white py-16">
        <Container className="max-w-2xl text-center">
          <p className="font-mono text-xs tracking-widest text-signal-green mb-3 uppercase">Get in touch</p>
          <h1 className="font-display font-700 text-4xl tracking-tight">Contact ZYPHOR</h1>
          <p className="mt-4 text-white/55">
            Questions, partnership enquiries, retailer onboarding — we&apos;re here.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="font-display font-700 text-xl text-slate-850 mb-6">Send us a message</h2>
              {sent ? (
                <div className="bg-signal-green/10 border border-signal-green/25 rounded-2xl p-8 text-center">
                  <ScanLine className="h-10 w-10 text-signal-green mx-auto mb-3" />
                  <h3 className="font-display font-600 text-lg text-slate-850 mb-2">Message sent!</h3>
                  <p className="text-sm text-black/55">We&apos;ll get back to you at {form.email} within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-850 mb-1.5">Name</label>
                      <input required type="text" value={form.name} onChange={set("name")} placeholder="Arjun Sharma"
                        className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-850 mb-1.5">Email</label>
                      <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                        className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-850 mb-1.5">Enquiry type</label>
                    <select value={form.type} onChange={set("type")}
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 bg-white">
                      <option value="general">General question</option>
                      <option value="retailer">Retailer / wholesaler onboarding</option>
                      <option value="technician">Technician registration</option>
                      <option value="dispute">Order dispute</option>
                      <option value="fraud">Report fraud / stolen phone</option>
                      <option value="press">Press &amp; media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-850 mb-1.5">Message</label>
                    <textarea required value={form.message} onChange={set("message")} rows={5}
                      placeholder="Tell us how we can help…"
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-coral/30" />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-coral hover:bg-coral-dark disabled:opacity-50 text-white font-display font-600 py-3 rounded-xl transition-colors focus-ring">
                    {loading ? "Sending…" : "Send message"}
                  </button>
                </form>
              )}

              {/* Contact options */}
              <div className="mt-8 grid gap-3">
                {[
                  { icon: <Mail className="h-4 w-4" />, label: "Email us", value: "hello@zyphor.in", href: "mailto:hello@zyphor.in" },
                  { icon: <MessageSquare className="h-4 w-4" />, label: "WhatsApp", value: "+91 98XXX XXXXX", href: "#" },
                  { icon: <Store className="h-4 w-4" />, label: "Retailer enquiries", value: "partners@zyphor.in", href: "mailto:partners@zyphor.in" }
                ].map(({ icon, label, value, href }) => (
                  <a key={label} href={href}
                    className="flex items-center gap-3 p-3 bg-paper border border-black/[0.06] rounded-xl hover:border-black/15 transition-colors focus-ring">
                    <div className="h-8 w-8 rounded-lg bg-ink flex items-center justify-center text-white">{icon}</div>
                    <div>
                      <p className="text-xs text-black/40 font-mono">{label}</p>
                      <p className="text-sm font-medium text-slate-850">{value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="font-display font-700 text-xl text-slate-850 mb-6">Frequently asked questions</h2>
              <div className="space-y-3">
                {FAQ.map(({ q, a }) => (
                  <details key={q} className="group bg-white border border-black/[0.06] rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-medium text-sm text-slate-850 list-none select-none">
                      {q}
                      <span className="ml-3 flex-shrink-0 text-black/30 group-open:rotate-180 transition-transform text-lg leading-none">›</span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-black/60 leading-relaxed border-t border-black/[0.05] pt-3">
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
