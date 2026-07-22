import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Link from "next/link";
import { Wrench, Calendar, MapPin, CheckCircle2, ChevronLeft } from "lucide-react";

export default function BookRepairPage() {
  const brands = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo"];
  const issues = ["Screen Damage / Cracks", "Battery Draining Fast", "Charging Port Broken", "Camera Focus Issue", "Speaker / Mic Problem", "Other"];

  return (
    <div className="py-12 bg-paper min-h-screen">
      <Container>
        <Link href="/repair" className="inline-flex items-center text-sm font-medium text-black/50 hover:text-coral transition-colors mb-6 focus-ring">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Repair Overview
        </Link>

        <SectionHeading
          title="Book Doorstep Repair"
          eyebrow="Zyphor Care"
          subtitle="Select your phone model and issue to get an instant repair quote."
          className="mb-10"
        />

        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-10 border border-black/[0.06] shadow-sm space-y-8">
          
          {/* Step 1: Brand Selection */}
          <div>
            <h3 className="font-display font-600 text-lg mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-ink text-white text-xs flex items-center justify-center font-mono">1</span>
              Select Brand
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {brands.map((b, i) => (
                <button
                  key={b}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    i === 0 ? "border-coral bg-coral/5 text-coral" : "border-black/10 hover:border-black/30 text-slate-850"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Issue Selection */}
          <div>
            <h3 className="font-display font-600 text-lg mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-ink text-white text-xs flex items-center justify-center font-mono">2</span>
              Select Issue
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {issues.map((iss, i) => (
                <div
                  key={iss}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    i === 0 ? "border-coral bg-coral/5 text-coral" : "border-black/10 hover:border-black/30 text-slate-850"
                  }`}
                >
                  <span className="text-sm font-medium">{iss}</span>
                  {i === 0 && <CheckCircle2 className="h-4 w-4 text-coral" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Date & Location */}
          <div className="space-y-4 pt-4 border-t border-black/5">
            <h3 className="font-display font-600 text-lg flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-ink text-white text-xs flex items-center justify-center font-mono">3</span>
              Doorstep Slot & Address
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-black/60 mb-1.5 block">Preferred Date</label>
                <div className="relative">
                  <input type="date" className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-coral" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-black/60 mb-1.5 block">Pincode</label>
                <input type="text" placeholder="e.g. 400001" className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-coral" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-black/40">Estimated Repair Cost</p>
              <p className="font-display font-700 text-2xl text-slate-850">₹2,499 <span className="text-xs text-signal-green font-normal">(Free Visit)</span></p>
            </div>
            <button className="w-full sm:w-auto bg-coral hover:bg-coral-dark text-white font-display font-600 px-8 py-3.5 rounded-xl transition-colors focus-ring flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" /> Confirm Booking
            </button>
          </div>

        </div>
      </Container>
    </div>
  );
}
