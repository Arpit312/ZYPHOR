"use client";

import { useState } from "react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Calendar, MapPin, CheckCircle2, ChevronLeft, Phone, Smartphone, Check } from "lucide-react";

const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Google", "Motorola"];

const ISSUES = [
  { label: "Screen Damage / Cracks", estPrice: 1999 },
  { label: "Battery Draining Fast", estPrice: 899 },
  { label: "Charging Port Broken", estPrice: 699 },
  { label: "Camera Focus / Sensor Issue", estPrice: 1299 },
  { label: "Speaker / Mic Problem", estPrice: 599 },
  { label: "Water Damage / Dead Phone", estPrice: 2499 },
];

export default function BookRepairPage() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(ISSUES[0]);
  const [preferredDate, setPreferredDate] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!model.trim() || !pincode.trim() || !contactPhone.trim()) {
      setError("Please fill in the device model, pincode, and contact phone number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: selectedBrand,
          model: model.trim(),
          issue: selectedIssue.label,
          pincode: pincode.trim(),
          preferredDate: preferredDate || new Date().toISOString().split("T")[0],
          address: address.trim(),
          contactPhone: contactPhone.trim(),
          estimatedPrice: selectedIssue.estPrice,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmedTicket(data.ticket);
      } else {
        setError(data.error || "Failed to book doorstep repair. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmedTicket) {
    return (
      <div className="py-16 bg-paper min-h-screen">
        <Container className="max-w-xl">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-black/[0.08] shadow-xl text-center space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-signal-green/10 text-signal-green flex items-center justify-center mx-auto border border-signal-green/30">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-signal-green bg-signal-green/10 px-3 py-1 rounded-full">
                Booking Confirmed ✓
              </span>
              <h2 className="font-display font-800 text-2xl text-slate-850 mt-3">
                Doorstep Repair Scheduled!
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                A certified Zyphor technician has been assigned to your service request.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-xs text-left space-y-2 border border-gray-200 font-medium">
              <div className="flex justify-between">
                <span className="text-gray-500">Ticket Number:</span>
                <span className="font-mono font-bold text-black">{confirmedTicket.ticketNumber || `TKT-${confirmedTicket._id?.slice(-6)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Device:</span>
                <span className="font-bold text-black">{confirmedTicket.brand} {confirmedTicket.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span className="text-black">{confirmedTicket.issue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Cost:</span>
                <span className="font-mono font-bold text-black">₹{confirmedTicket.estimatedPrice} (Pay after repair)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location Pincode:</span>
                <span className="text-black">{confirmedTicket.pincode}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all text-center"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/repair"
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all text-center"
              >
                Back to Repairs
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-12 bg-paper min-h-screen">
      <Container>
        <Link href="/repair" className="inline-flex items-center text-sm font-medium text-black/50 hover:text-coral transition-colors mb-6 focus-ring">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Repair Overview
        </Link>

        <SectionHeading
          title="Book Doorstep Repair"
          eyebrow="Zyphor Care"
          subtitle="Select your phone model and issue to get an instant verified doorstep repair."
          className="mb-10"
        />

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-black/[0.06] shadow-sm space-y-8">
          
          {/* Step 1: Brand Selection */}
          <div>
            <h3 className="font-display font-700 text-base mb-4 flex items-center gap-2 text-slate-850">
              <span className="h-6 w-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono font-bold">1</span>
              Select Device Brand
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {BRANDS.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedBrand === b ? "border-black bg-black text-white shadow-sm" : "border-gray-200 hover:border-gray-400 bg-gray-50 text-slate-850"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Specific Model Name</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. iPhone 14 Pro, Galaxy S23, OnePlus 11"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-black focus:bg-white focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          {/* Step 2: Issue Selection */}
          <div>
            <h3 className="font-display font-700 text-base mb-4 flex items-center gap-2 text-slate-850">
              <span className="h-6 w-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono font-bold">2</span>
              Select Fault or Issue
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {ISSUES.map((iss) => (
                <div
                  key={iss.label}
                  onClick={() => setSelectedIssue(iss)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedIssue.label === iss.label ? "border-coral bg-coral/5 text-coral shadow-sm" : "border-gray-200 hover:border-gray-300 text-slate-850 bg-gray-50/50"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{iss.label}</span>
                    <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">Est: ₹{iss.estPrice}</span>
                  </div>
                  {selectedIssue.label === iss.label && <CheckCircle2 className="h-4 w-4 text-coral shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Date & Location */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-display font-700 text-base flex items-center gap-2 text-slate-850">
              <span className="h-6 w-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono font-bold">3</span>
              Doorstep Service Slot &amp; Address
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Preferred Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-black focus:outline-none focus:border-black font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-black focus:outline-none focus:border-black font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Doorstep Delivery Address</label>
              <input
                type="text"
                placeholder="House / Flat No., Landmark, Area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-black focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Estimated Repair Cost</p>
              <p className="font-display font-800 text-2xl text-slate-850">
                ₹{selectedIssue.estPrice} <span className="text-xs text-signal-green font-bold">(Free Inspection)</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-display font-bold px-8 py-3.5 rounded-xl transition-all shadow-md focus-ring flex items-center justify-center gap-2 text-xs"
            >
              <Calendar className="h-4 w-4" />
              {loading ? "Confirming Booking…" : "Confirm Doorstep Booking"}
            </button>
          </div>

        </form>
      </Container>
    </div>
  );
}
