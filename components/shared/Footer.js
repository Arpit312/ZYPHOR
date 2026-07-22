import Link from "next/link";
import { ScanLine } from "lucide-react";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { href: "/marketplace", label: "Buy phones" },
      { href: "/parts", label: "Buy parts" },
      { href: "/sell", label: "Sell a device" },
      { href: "/ai-advisor", label: "AI Advisor" }
    ]
  },
  {
    title: "Services & Care",
    links: [
      { href: "/repair", label: "Doorstep Repair" },
      { href: "/stores", label: "Find Store / Kiosk" },
      { href: "/orders", label: "Track Orders" },
      { href: "/support", label: "Help & Support" }
    ]
  },
  {
    title: "Trust",
    links: [
      { href: "/verify-imei", label: "Free IMEI check" },
      { href: "/about#verification", label: "How verification works" },
      { href: "/about#trust-score", label: "Trust Score explained" }
    ]
  },
  {
    title: "Business & Company",
    links: [
      { href: "/signup?role=retailer", label: "Become a retailer" },
      { href: "/signup?role=wholesaler", label: "Sell in bulk" },
      { href: "/about", label: "About ZYPHOR" },
      { href: "/contact", label: "Contact" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-24 border-t border-white/10">
      <div className="container-x py-14 grid grid-cols-2 md:grid-cols-6 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 text-white font-display font-700 text-lg">
            <ScanLine className="h-5 w-5 text-signal-green" />
            ZYPHOR
          </div>
          <p className="mt-3 text-sm leading-relaxed max-w-xs">
            Every device on ZYPHOR is AI-verified, IMEI-screened and trust-scored
            before it's listed — so you know exactly what you're buying.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-white text-sm font-medium mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors focus-ring">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/40">
          <p>© {new Date().getFullYear()} ZYPHOR. All rights reserved.</p>
          <p className="font-mono">BUILT FOR TRUST · AI-VERIFIED MARKETPLACE</p>
        </div>
      </div>
    </footer>
  );
}
