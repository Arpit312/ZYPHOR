"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, PlusCircle, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BottomNav({ user }) {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Store", href: "/store", icon: ShoppingBag },
    { label: "Sell", href: "/sell", icon: PlusCircle },
    { label: "Cart", href: "/cart", icon: ShoppingCart, badge: cartCount },
    { label: "Profile", href: user ? "/dashboard" : "/login", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.08] flex justify-around items-center h-16 z-50 px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? "text-coral" : "text-black/40 hover:text-black/70"
            }`}
          >
            <div className="relative">
              <item.icon className={`h-5 w-5 ${isActive ? "fill-coral/10" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-coral text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
