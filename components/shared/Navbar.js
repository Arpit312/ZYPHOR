"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, ScanLine, Search as SearchIcon, ShoppingCart, Wrench, MapPin } from "lucide-react";
import clsx from "clsx";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";
import { useCart } from "@/context/CartContext";

const LINKS = [
  { href: "/repair",          label: "Repair" },
  { href: "/stores",          label: "Stores" },
  { href: "/parts",          label: "Parts" },
  { href: "/ai-advisor",     label: "AI Advisor" },
  { href: "/pricing-agent",  label: "Price Check" },
  { href: "/verify-imei",    label: "IMEI Check" },
];

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85 text-white border-b border-white/10">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display font-700 text-lg tracking-tight focus-ring flex-shrink-0">
          <ScanLine className="h-5 w-5 text-signal-green" strokeWidth={2.4} />ZYPHOR
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 flex-shrink-0">
          <MegaMenu />
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={clsx("px-3 py-2 text-sm rounded-md transition-colors focus-ring",
              pathname?.startsWith(l.href) ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5")}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search — center-ish */}
        <div className="hidden lg:block flex-1 max-w-xs">
          <SearchBar variant="navbar" />
        </div>

        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link href="/cart" className="p-2 text-white/80 hover:text-white transition-colors focus-ring relative rounded-md hover:bg-white/10" title="Shopping Cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-coral text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/sell" className="text-sm text-white/80 hover:text-white px-3 py-2 focus-ring">Sell</Link>
              <Link href="/orders" className="text-sm text-white/80 hover:text-white px-2 py-2 focus-ring">Orders</Link>
              <Link href="/dashboard" className="text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-md focus-ring">
                {user.name ? user.name.split(" ")[0] : (user.email?.split("@")[0] || "Account")}
              </Link>
            </>
          ) : (
            <>
              <Link href="/sell" className="text-sm text-white/80 hover:text-white px-3 py-2 focus-ring">Sell a device</Link>
              <Link href="/login" className="text-sm font-medium bg-coral hover:bg-coral-dark transition-colors px-4 py-2 rounded-md focus-ring inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />Log in
              </Link>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          <button className="p-2 focus-ring" onClick={() => setMobileSearch(v => !v)}>
            <SearchIcon className="h-5 w-5" />
          </button>
          <button className="p-2 focus-ring" onClick={() => setOpen(v => !v)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileSearch && (
        <div className="md:hidden border-t border-white/10 bg-ink px-4 py-3">
          <SearchBar variant="navbar" />
        </div>
      )}

      {open && (
        <div className="md:hidden border-t border-white/10 bg-ink px-4 pb-4 pt-2 space-y-1 max-h-[75vh] overflow-y-auto">
          <Link href="/buy" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md text-white/85 hover:bg-white/5 text-sm font-medium">Buy Phones</Link>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-md text-white/85 hover:bg-white/5 text-sm">{l.label}</Link>
          ))}
          <div className="pt-2 flex gap-2">
            {user ? (
              <>
                <Link href="/sell" onClick={() => setOpen(false)} className="flex-1 text-center py-2 bg-white/10 rounded-md text-sm">Sell</Link>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="flex-1 text-center py-2 bg-coral rounded-md text-sm font-medium">Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2 bg-coral rounded-md text-sm font-medium">Log in</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2 border border-white/20 rounded-md text-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
