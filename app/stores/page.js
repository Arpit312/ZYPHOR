import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { MapPin, Phone, Clock, ShieldCheck, Navigation } from "lucide-react";

export default function StoresPage() {
  const stores = [
    {
      id: 1,
      name: "Zyphor Verified Experience Store - Connaught Place",
      address: "Shop 12, Inner Circle, Block B, Connaught Place, New Delhi - 110001",
      phone: "+91 98765 43210",
      timing: "10:00 AM - 9:00 PM (All Days)",
      type: "Official Store & Drop-off Point",
      rating: "4.9 ★"
    },
    {
      id: 2,
      name: "Zyphor Certified Kiosk - Bandra West",
      address: "Ground Floor, Linking Road, Near KFC, Bandra West, Mumbai - 400050",
      phone: "+91 98765 43211",
      timing: "10:30 AM - 9:30 PM",
      type: "Partner Kiosk & Instant Cash Pickup",
      rating: "4.8 ★"
    },
    {
      id: 3,
      name: "Zyphor Care & Tech Hub - Indiranagar",
      address: "100 Feet Road, Opposite To Starbucks, Indiranagar, Bengaluru - 560038",
      phone: "+91 98765 43212",
      timing: "10:00 AM - 8:30 PM",
      type: "Official Repair & Diagnostics Hub",
      rating: "4.9 ★"
    }
  ];

  return (
    <div className="py-12 bg-paper min-h-screen">
      <Container>
        <SectionHeading
          title="Find a Zyphor Store Near You"
          eyebrow="Omnichannel Network"
          subtitle="Experience AI-verified devices in person, drop off your device for instant valuation, or get doorstep repair."
          className="mb-10"
        />

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 flex gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-black/40" />
            <input
              type="text"
              placeholder="Enter City, Area, or Pincode (e.g. Mumbai, 110001)"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-coral bg-white shadow-sm"
            />
          </div>
          <button className="bg-ink hover:bg-ink-900 text-white font-display font-600 px-6 py-3 rounded-xl text-sm transition-colors focus-ring">
            Search
          </button>
        </div>

        {/* Store Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {stores.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-6 border border-black/[0.06] flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono bg-signal-green/10 text-signal-green font-semibold px-2.5 py-1 rounded-full">
                    {s.type}
                  </span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{s.rating}</span>
                </div>
                <h3 className="font-display font-600 text-base text-slate-850 mb-3 leading-snug">{s.name}</h3>
                
                <div className="space-y-2 text-sm text-black/60 mb-6">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-black/40 shrink-0 mt-0.5" />
                    <span>{s.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-black/40 shrink-0" />
                    <span>{s.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-black/40 shrink-0" />
                    <span>{s.timing}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs text-signal-green font-medium flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> AI Diagnostics Available
                </span>
                <button className="text-xs font-semibold text-coral hover:underline inline-flex items-center gap-1">
                  <Navigation className="h-3 w-3" /> Get Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
