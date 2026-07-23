"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, ScanLine, Search as SearchIcon, ShoppingCart, Wrench, MapPin, ChevronDown, User } from "lucide-react";
import clsx from "clsx";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";
import { useCart } from "@/context/CartContext";

const TOP_LINKS = [
  { href: "/sell",          label: "Sell Device" },
  { href: "/repair",        label: "Repair" },
  { href: "/store",         label: "Buy Refurbished" },
  { href: "/ai-advisor",    label: "AI Advisor" },
  { href: "/parts",         label: "Parts" },
];

const MORE_LINKS = [
  { href: "/pricing-agent", label: "Price Check" },
  { href: "/verify-imei",   label: "IMEI Check" },
  { href: "/stores",        label: "Find Stores" },
];

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { cartCount } = useCart();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const controlNavbar = () => {
      if (open || mobileSearch) return; // Don't hide if mobile menus are open
      
      if (window.scrollY > 80) { 
        if (window.scrollY > lastScrollY) { 
          setShow(false); // Scroll down -> hide
        } else { 
          setShow(true);  // Scroll up -> show
        }
      } else {
        setShow(true); // Always show at top
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY, open, mobileSearch]);

  return (
    <header className={clsx(
      "sticky top-0 z-50 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85 text-white border-b border-white/10 shadow-lg transition-transform duration-300",
      show ? "translate-y-0" : "-translate-y-full"
    )}>
      
      {/* --- TIER 1: Main Header (Logo, Search, Auth, Cart) --- */}
      <div className="container-x flex h-16 items-center justify-between gap-6">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-800 text-xl tracking-tight focus-ring flex-shrink-0 text-white">
          <div className="bg-coral/20 p-1.5 rounded-lg border border-coral/30">
            <ScanLine className="h-5 w-5 text-coral" strokeWidth={2.5} />
          </div>
          ZYPHOR
        </Link>

        {/* Middle: Expanded Search Bar (Desktop) */}
        <div className="hidden lg:block flex-1 max-w-2xl w-full">
          <SearchBar variant="navbar" />
        </div>

        {/* Right: Location, Cart, Auth */}
        <div className="hidden md:flex items-center gap-5 flex-shrink-0">
          
          <Link href="/stores" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-coral transition-colors font-medium">
            <MapPin className="h-4 w-4" /> <span>Find Stores</span>
          </Link>

          <div className="h-6 w-px bg-white/10 mx-1"></div>

          <Link href="/cart" className="p-2 text-white/80 hover:text-coral transition-colors focus-ring relative rounded-md" title="Shopping Cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-coral text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(255,111,97,0.5)]">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link href="/dashboard" className="text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 transition-all px-4 py-2 rounded-xl focus-ring flex items-center gap-2">
              <User className="h-4 w-4 text-coral" />
              {user.name ? user.name.split(" ")[0] : (user.email?.split("@")[0] || "Account")}
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-semibold bg-coral hover:bg-coral-dark shadow-lg shadow-coral/20 transition-all px-5 py-2.5 rounded-xl focus-ring inline-flex items-center gap-1.5 text-white">
              <ShieldCheck className="h-4 w-4" /> Login
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/cart" className="p-2 text-white/80 relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute 0 top-0 right-0 h-3 w-3 bg-coral text-white text-[8px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="p-2 focus-ring text-white" onClick={() => setMobileSearch(v => !v)}>
            <SearchIcon className="h-5 w-5" />
          </button>
          <button className="p-2 focus-ring text-white" onClick={() => setOpen(v => !v)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* --- TIER 2: Navigation Links (Desktop) --- */}
      <div className="hidden md:flex border-t border-white/5 bg-[#0A0A0F]/50">
        <div className="container-x flex items-center gap-8 h-12 overflow-x-auto scrollbar-hide">
          
          <MegaMenu />

          {TOP_LINKS.map((l) => (
            <Link 
              key={l.href} 
              href={l.href} 
              className={clsx(
                "text-[13px] font-medium transition-colors whitespace-nowrap hover:text-coral flex items-center gap-1",
                pathname === l.href ? "text-coral" : "text-white/70"
              )}
            >
              {l.label}
            </Link>
          ))}

          <div 
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button className="text-[13px] font-medium text-white/70 hover:text-coral transition-colors flex items-center gap-1 h-12">
              More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 w-48 bg-[#12121E] border border-white/10 rounded-xl shadow-xl py-2 z-50">
                {MORE_LINKS.map((ml) => (
                  <Link 
                    key={ml.href} 
                    href={ml.href} 
                    className="block px-4 py-2 text-[13px] text-white/70 hover:text-coral hover:bg-white/5 transition-colors"
                  >
                    {ml.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE: Search Bar Dropdown --- */}
      {mobileSearch && (
        <div className="md:hidden border-t border-white/10 bg-ink px-4 py-3">
          <SearchBar variant="navbar" />
        </div>
      )}

      {/* --- MOBILE: Main Menu Dropdown --- */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0F] px-4 pb-6 pt-4 space-y-2 max-h-[85vh] overflow-y-auto">
          {user ? (
             <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mb-4">
                <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center text-coral font-bold">
                   {user.name?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div>
                   <p className="text-sm font-semibold text-white">{user.name || "User"}</p>
                   <p className="text-xs text-white/40">{user.email}</p>
                </div>
             </div>
          ) : (
            <div className="flex gap-2 mb-4">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 bg-coral text-white rounded-xl text-sm font-semibold shadow-lg shadow-coral/20">Log in</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 border border-white/20 text-white rounded-xl text-sm font-semibold">Sign up</Link>
            </div>
          )}

          <Link href="/store" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl bg-coral/10 text-coral text-sm font-bold border border-coral/20">
            STORE
          </Link>
          
          {TOP_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-xl text-white/80 hover:bg-white/5 text-sm font-medium border border-transparent hover:border-white/10">
              {l.label}
            </Link>
          ))}
          
          <div className="h-px bg-white/10 my-2"></div>
          
          {MORE_LINKS.map((ml) => (
            <Link key={ml.href} href={ml.href} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-white/50 text-sm hover:text-white">
              {ml.label}
            </Link>
          ))}
          
          {user && (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 mt-4 text-center border border-white/10 rounded-xl text-white/80 text-sm font-semibold">
              Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
