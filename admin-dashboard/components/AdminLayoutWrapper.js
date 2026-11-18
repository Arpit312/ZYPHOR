"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function AdminLayoutWrapper({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoginPage = pathname === "/login";

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (isLoginPage) {
    return <main className="min-h-screen w-full bg-black overflow-x-hidden">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* ─── MOBILE STICKY TOPBAR (VISIBLE ON < LG) ─── */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-black text-white border-b border-gray-800 z-30 px-4 flex items-center justify-between shadow-md select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20">
            <Image src="/symbol-white.png" alt="ZYPHOR" width={22} height={22} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-white">ZYPHOR</h1>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Admin Suite</p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-all focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* ─── SIDEBAR (DESKTOP FIXED + MOBILE SLIDING DRAWER) ─── */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* ─── MAIN CONTENT VIEWPORT ─── */}
      <main className="flex-1 lg:ml-64 p-4 pt-20 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
