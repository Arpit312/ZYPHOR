"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Save, CheckCircle } from "lucide-react";
import Container from "@/components/shared/Container";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", city: "", phone: "", businessName: "", gstNumber: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setForm({ name: d.user.name || "", city: d.user.city || "", phone: d.user.phone || "", businessName: d.user.businessName || "", gstNumber: d.user.gstNumber || "" }); }
      else router.push("/login");
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
  };

  const isSeller = ["retailer","wholesaler","technician"].includes(user?.role);

  return (
    <main className="bg-paper min-h-screen py-10">
      <Container className="max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
            <User className="h-6 w-6 text-coral" />
          </div>
          <div>
            <h1 className="font-display font-700 text-2xl text-slate-850">Edit Profile</h1>
            <p className="text-sm text-black/40">{user?.email} · {user?.role}</p>
          </div>
        </div>

        <form onSubmit={save} className="bg-white rounded-2xl border border-black/[0.07] p-6 space-y-4">
          {[
            { label: "Full Name", key: "name", required: true },
            { label: "City", key: "city" },
            { label: "Phone Number", key: "phone" },
            ...(isSeller ? [{ label: "Business Name", key: "businessName" }] : []),
            ...(["retailer","wholesaler"].includes(user?.role) ? [{ label: "GST Number", key: "gstNumber" }] : []),
          ].map(({ label, key, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-black/60 mb-1.5">{label}{required && " *"}</label>
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm bg-paper focus:outline-none focus:border-coral transition-colors"
                required={required} />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full bg-coral hover:bg-coral-dark text-white font-display font-600 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {success ? <><CheckCircle className="h-4 w-4" /> Saved!</> : loading ? "Saving…" : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </form>
      </Container>
    </main>
  );
}
