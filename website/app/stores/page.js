import Container from "@/components/shared/Container";
import Link from "next/link";
import { Store, MapPin, Phone, Clock, ShieldCheck, ChevronRight, Search, Navigation } from "lucide-react";

export const metadata = {
  title: "Partner Stores & Kiosks — ZYPHOR",
  description: "Find verified ZYPHOR experience centers, certified retailer kiosks, and doorstep diagnostic hubs across India."
};

const STORES = [
  {
    id: "hub-1",
    name: "Zyphor Central Hub & Diagnostic Center",
    type: "Flagship Experience Hub",
    city: "Mumbai",
    address: "Bandra Kurla Complex, G-Block, Bandra East, Mumbai, Maharashtra 400051",
    phone: "+91 22 6123 4567",
    hours: "10:00 AM – 08:30 PM (Mon – Sun)",
    services: ["AI Hardware Inspection", "Instant Cashout", "Doorstep Pickup", "Parts Store"]
  },
  {
    id: "hub-2",
    name: "Zyphor Certified Retail Partner - South Ex",
    type: "Certified Retail Kiosk",
    city: "Delhi NCR",
    address: "Main Market, South Extension Part II, New Delhi 110049",
    phone: "+91 11 4155 8920",
    hours: "10:30 AM – 08:00 PM (Tue – Sun)",
    services: ["IMEI Verification", "Refurbished Handsets", "Screen Replacement"]
  },
  {
    id: "hub-3",
    name: "Zyphor Tech Hub & Diagnostic Lab",
    type: "Diagnostic & Repair Lab",
    city: "Bengaluru",
    address: "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
    phone: "+91 80 4920 1100",
    hours: "10:00 AM – 09:00 PM (Mon – Sun)",
    services: ["Motherboard Micro-soldering", "Battery Replacement", "Doorstep Dispatch"]
  },
  {
    id: "hub-4",
    name: "Zyphor B2B Wholesale Distribution Kiosk",
    type: "B2B Wholesale Hub",
    city: "Hyderabad",
    address: "Jagdish Market, Abids, Hyderabad, Telangana 500001",
    phone: "+91 40 6789 2200",
    hours: "11:00 AM – 07:30 PM (Mon – Sat)",
    services: ["Bulk Lot Inspection", "Spare Parts Wholesale", "Technician Certifications"]
  }
];

export default function StoresPage() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-paper border-b border-black/[0.05]">
        <Container className="relative py-12 text-center z-10">
          <span className="text-[10px] font-mono font-bold text-coral bg-coral/10 border border-coral/20 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">
            Pan-India Partner Network
          </span>
          <h1 className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl text-slate-850 leading-tight mb-3">
            Find Verified <span className="text-coral">Stores &amp; Kiosks</span>
          </h1>
          <p className="text-black/60 text-xs sm:text-sm max-w-xl mx-auto">
            Drop in for instant hardware diagnostics, cashout your device on the spot, or collect certified parts.
          </p>
        </Container>
      </div>

      {/* Stores List */}
      <section className="py-12">
        <Container className="max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {STORES.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-sm hover:border-black/20 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-coral bg-coral/10 px-2.5 py-0.5 rounded-full">
                        {store.city}
                      </span>
                      <h3 className="font-display font-700 text-base sm:text-lg text-slate-850 mt-1.5">
                        {store.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">{store.type}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-700">
                      <Store size={20} />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 font-medium pt-2 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <span className="font-mono text-black">{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400 shrink-0" />
                      <span>{store.hours}</span>
                    </div>
                  </div>

                  {/* Services Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {store.services.map((svc) => (
                      <span
                        key={svc}
                        className="text-[10px] font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <Link
                    href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-coral hover:underline"
                  >
                    <Navigation size={13} /> Open in Google Maps
                  </Link>
                  <Link
                    href="/repair/book"
                    className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Book Visit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
