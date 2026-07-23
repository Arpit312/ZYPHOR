import "./globals.css";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { getSessionUser } from "@/lib/auth";
import { CartProvider } from "@/context/CartContext";
import BottomNav from "@/components/shared/BottomNav";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-grotesk" });
const inter   = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter" });
const mono    = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata = {
  title: "ZYPHOR — AI-Verified Phone Marketplace",
  description: "Buy & sell verified smartphones, tablets and parts across India. AI-checked, IMEI-screened, trust-scored.",
  keywords: ["buy refurbished phone India", "sell old phone", "AI verified phone", "IMEI check", "mobile parts marketplace"],
};

export default async function RootLayout({ children }) {
  const user = await getSessionUser();

  return (
    <html lang="en" className={`${grotesk.variable} ${inter.variable} ${mono.variable}`}>
      <body className="font-body antialiased min-h-screen flex flex-col bg-paper">
        <AuthProvider>
          <CartProvider>
            <Navbar user={user} />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <BottomNav user={user} />
            <Toaster position="top-right" reverseOrder={false} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
