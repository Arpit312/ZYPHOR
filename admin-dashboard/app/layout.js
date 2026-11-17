import { Inter } from "next/font/google";
import "./globals.css";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata = {
  title: "ZYPHOR Master Admin Suite",
  description: "Enterprise Executive Admin Dashboard for ZYPHOR Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} text-gray-900 bg-gray-50 antialiased`}>
        <AdminLayoutWrapper>
          {children}
        </AdminLayoutWrapper>
      </body>
    </html>
  );
}
