"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  ShieldCheck, 
  Search as SearchIcon, 
  ShoppingCart, 
  MapPin, 
  ChevronDown, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Settings, 
  Building,
  Wrench,
  Store,
  ShieldAlert
} from "lucide-react";
import { signOut } from "next-auth/react";
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
  { href: "/coming-soon",   label: "Buy Laptops" },
  { href: "/coming-soon",   label: "Accessories" },
  { href: "/stores",        label: "Find Stores" },
  { href: "/pricing-agent", label: "Price Check" },
  { href: "/verify-imei",   label: "IMEI Check" },
];

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();

  const [currentUser, setCurrentUser] = useState(user);
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Sync user prop
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // Client-side initial sync check (only on mount to prevent navigation lag)
  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (mounted && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    try {
      await signOut({ redirect: false });
    } catch {}

    setCurrentUser(null);
    setProfileOpen(false);
    setOpen(false);
    // Explicitly redirect to login page where user can select custom role and sign in
    router.push("/login");
    router.refresh();
  };

  const getRoleBadge = (role) => {
    const r = (role || "customer").toLowerCase();
    switch (r) {
      case "admin":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">Master Admin</span>;
      case "retailer":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Retailer Store</span>;
      case "wholesaler":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">Wholesaler</span>;
      case "technician":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Repair Tech</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-coral/20 text-coral border border-coral/30">Customer</span>;
    }
  };

  return (
    <header className="relative z-50 bg-ink/95 text-white border-b border-white/10 shadow-lg">
      
      {/* --- TIER 1: Main Header (Logo, Search, Auth, Cart) --- */}
      <div className="container-x flex h-16 items-center justify-between gap-6">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-display font-800 text-xl tracking-tight focus-ring flex-shrink-0 text-white group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/10 p-1 flex items-center justify-center border border-white/20 group-hover:border-coral transition-colors">
            <Image src="/symbol-white.png" alt="ZYPHOR Logo" width={26} height={26} className="object-contain" priority />
          </div>
          <span className="font-black tracking-wider text-xl text-white">ZYPHOR</span>
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

          {/* AUTH SECTION (LOGIN BUTTON / PROFILE DETAILS) */}
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/15 py-1.5 px-3 rounded-xl transition-all text-xs font-semibold focus-ring group"
              >
                <div className="w-7 h-7 rounded-full bg-coral/20 text-coral flex items-center justify-center font-bold text-xs border border-coral/30">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : (currentUser.email ? currentUser.email[0].toUpperCase() : "U")}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-xs leading-none">
                    {currentUser.name ? currentUser.name.split(" ")[0] : "Account"}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-coral font-bold mt-0.5">
                    {currentUser.role || "Customer"}
                  </div>
                </div>
                <ChevronDown size={14} className={`text-white/60 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* PROFILE DETAILS DROPDOWN */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#0F0F1A] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 animate-scale-in space-y-3.5">
                  {/* USER HEADER INFO */}
                  <div className="flex items-start gap-3 pb-3 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-coral/20 text-coral flex items-center justify-center font-bold text-sm border border-coral/30 shrink-0">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {currentUser.name || "Zyphor User"}
                      </p>
                      <p className="text-[11px] text-white/50 truncate font-mono mt-0.5">
                        {currentUser.email}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        {getRoleBadge(currentUser.role)}
                        {currentUser.verifiedSeller && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/10 text-white border border-white/20">Verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BUSINESS / LOCATION INFO IF PRESENT */}
                  {(currentUser.businessName || currentUser.city) && (
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-xs space-y-1">
                      {currentUser.businessName && (
                        <div className="flex items-center gap-1.5 text-white/80 font-medium">
                          <Building size={13} className="text-coral shrink-0" />
                          <span className="truncate">{currentUser.businessName}</span>
                        </div>
                      )}
                      {currentUser.city && (
                        <div className="flex items-center gap-1.5 text-white/60 text-[11px]">
                          <MapPin size={12} className="text-white/40 shrink-0" />
                          <span className="truncate">{currentUser.city}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QUICK NAVIGATION LINKS */}
                  <div className="space-y-1 pt-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <LayoutDashboard size={15} className="text-coral" />
                      <span>
                        {currentUser.role === "customer" 
                          ? "My Profile & Purchases" 
                          : currentUser.role === "technician"
                          ? "Technician Diagnostics"
                          : currentUser.role === "retailer"
                          ? "Retailer Store Dashboard"
                          : currentUser.role === "wholesaler"
                          ? "Wholesale B2B Hub"
                          : "My Dashboard"}
                      </span>
                    </Link>

                    {/* Universal Sell Link for All Roles */}
                    <Link
                      href="/sell"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-coral hover:bg-coral/10 transition-all border border-coral/20"
                    >
                      <Sparkles size={15} className="text-coral" />
                      <span>
                        {currentUser.role === "customer" ? "Sell A Device (+ Cash In)" : "+ List / Sell Item"}
                      </span>
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Settings size={15} className="text-white/60" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      href="/dashboard/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Package size={15} className="text-white/60" />
                      <span>Orders &amp; History</span>
                    </Link>

                    {currentUser.role === "admin" && (
                      <Link
                        href="http://localhost:3001"
                        target="_blank"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/20"
                      >
                        <ShieldAlert size={15} className="text-white" />
                        <span>Master Admin Suite</span>
                      </Link>
                    )}
                  </div>

                  {/* LOGOUT BUTTON */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all"
                    >
                      <LogOut size={14} />
                      <span>Log Out & Switch Role</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold bg-coral hover:bg-coral-dark shadow-lg shadow-coral/25 transition-all px-4 py-2.5 rounded-xl focus-ring inline-flex items-center gap-1.5 text-white tracking-wide"
            >
              <User className="h-4 w-4" /> <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          {!currentUser ? (
            <Link
              href="/login"
              className="px-2.5 py-1.5 bg-coral text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1"
            >
              <User size={13} />
              <span>Login</span>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-coral/20 text-coral flex items-center justify-center font-bold text-xs border border-coral/30"
              title="Dashboard"
            >
              {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
            </Link>
          )}

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
          {currentUser ? (
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center text-coral font-bold text-sm border border-coral/30">
                  {currentUser.name?.[0] || currentUser.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{currentUser.name || "User"}</p>
                  <p className="text-xs text-white/50 truncate font-mono">{currentUser.email}</p>
                  <div className="mt-1">
                    {getRoleBadge(currentUser.role)}
                  </div>
                </div>
              </div>

              {(currentUser.businessName || currentUser.city) && (
                <div className="pt-2 border-t border-white/10 text-xs text-white/70 space-y-1">
                  {currentUser.businessName && <div>Store: {currentUser.businessName}</div>}
                  {currentUser.city && <div>City: {currentUser.city}</div>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-center bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white text-xs font-semibold"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-2 flex items-center justify-center gap-1.5 border border-red-500/20 bg-red-500/10 rounded-xl text-red-400 text-xs font-bold hover:bg-red-500/20"
                >
                  <LogOut className="h-3.5 w-3.5" /> Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 mb-4">
              <Link 
                href="/login" 
                onClick={() => setOpen(false)} 
                className="flex-1 text-center py-2.5 bg-coral text-white rounded-xl text-xs font-bold shadow-lg shadow-coral/20 flex items-center justify-center gap-1.5"
              >
                <User size={14} /> Log in
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setOpen(false)} 
                className="flex-1 text-center py-2.5 border border-white/20 text-white rounded-xl text-xs font-semibold"
              >
                Sign up
              </Link>
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
        </div>
      )}
    </header>
  );
}
