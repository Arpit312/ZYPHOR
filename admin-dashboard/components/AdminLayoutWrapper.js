"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AdminLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen bg-gray-950">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
