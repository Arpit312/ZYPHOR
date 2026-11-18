"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  UploadCloud,
  ShoppingCart, 
  CreditCard, 
  Wrench, 
  MessageSquare, 
  FileText, 
  Users,
  LogOut,
  KeyRound,
  X
} from "lucide-react";

const navigationGroups = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Catalog & E-Commerce",
    items: [
      { href: "/products", label: "Catalog Products", icon: Package },
      { href: "/products/upload", label: "Bulk Importer", icon: UploadCloud },
      { href: "/orders", label: "Orders & Escrow", icon: ShoppingCart },
    ]
  },
  {
    title: "Services & Support",
    items: [
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/repairs", label: "Doorstep Repairs", icon: Wrench },
      { href: "/support", label: "Support & Queries", icon: MessageSquare },
    ]
  },
  {
    title: "Governance & Audit",
    items: [
      { href: "/logins", label: "Login Management", icon: KeyRound },
      { href: "/logs", label: "Role Activity Logs", icon: FileText },
      { href: "/users", label: "Users & Roles", icon: Users },
    ]
  }
];

export default function Sidebar({ mobileOpen = false, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Do not render sidebar on login page
  if (pathname === "/login") return null;

  return (
    <>
      {/* Mobile Dark Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <aside
        className={`w-64 bg-black min-h-screen text-white flex flex-col fixed inset-y-0 left-0 border-r border-gray-800 z-50 select-none transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* BRAND HEADER */}
        <div className="p-5 border-b border-gray-800/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white/10 p-1 flex items-center justify-center border border-white/20">
              <Image src="/symbol-white.png" alt="ZYPHOR Logo" width={28} height={28} className="object-contain" priority />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-wider text-white">ZYPHOR</h1>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Master Admin Suite</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION GROUPS */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                {group.title}
              </p>
              {group.items.map((item) => {
                const isActive = item.href === "/" 
                  ? pathname === "/" 
                  : pathname === item.href || (item.href !== "/products" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                      isActive 
                        ? "bg-white text-black font-bold shadow-sm" 
                        : "text-gray-400 hover:text-white hover:bg-gray-900 font-medium"
                    }`}
                  >
                    <Icon size={17} className={isActive ? "text-black" : "text-gray-400"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* FOOTER & LOGOUT */}
        <div className="p-4 border-t border-gray-800/90 bg-gray-950 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-gray-300">All Systems Operational</span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Enterprise</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-900 border border-gray-800 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
