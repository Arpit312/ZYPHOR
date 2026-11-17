"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@zyphor.in");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Login failed. Please check credentials.");
      }
    } catch (err) {
      setError("Network connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-gray-950 border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 p-2.5">
            <Image src="/symbol-white.png" alt="ZYPHOR Logo" width={48} height={48} className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">ZYPHOR ADMIN</h1>
          <p className="text-xs text-gray-400 font-medium">Master Commerce Governance & Cloud Control</p>
        </div>

        {error && (
          <div className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="shrink-0 text-white" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zyphor.in"
                className="w-full bg-black border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-white focus:ring-1 focus:ring-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1.5">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-white focus:ring-1 focus:ring-white font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-xs mt-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin text-black" /> : <ShieldCheck size={16} className="text-black" />}
            {loading ? "Authenticating Master Key..." : "Sign In to Admin Suite"}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-900 text-center">
          <p className="text-[11px] text-gray-500 font-medium">
            Authorized Personnel Only • IP Address Logged & Tracked
          </p>
        </div>
      </div>
    </div>
  );
}
