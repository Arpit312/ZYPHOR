"use client";
import { useState } from "react";
import Container from "@/components/shared/Container";
import Link from "next/link";
import { ShieldCheck, Truck, Zap, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductClientView({ slug }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState("128GB");
  const [selectedCondition, setSelectedCondition] = useState("Superb");

  const product = {
    id: slug || "apple-iphone-13",
    name: `Apple iPhone 13 (${selectedStorage})`,
    brand: "Apple",
    condition: selectedCondition,
    price: selectedStorage === "256GB" ? 52000 : 45000,
    trustScore: 92,
    storage: selectedStorage,
    color: "Midnight"
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="py-12 bg-paper min-h-screen">
      <Container>
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white border border-black/[0.06] rounded-2xl flex items-center justify-center p-12 shadow-sm">
              <div className="w-full h-full bg-paper rounded-xl border border-black/5 flex flex-col items-center justify-center text-black/40 font-mono text-sm">
                <span className="font-display font-700 text-lg text-slate-850 mb-1">{product.name}</span>
                <span className="text-xs text-signal-green font-sans bg-signal-green/10 px-2 py-1 rounded">AI Inspection Verified ✓</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-white border border-black/[0.06] rounded-xl flex items-center justify-center cursor-pointer hover:border-coral transition-colors">
                  <div className="w-6 h-6 bg-black/5 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-6">
              <p className="text-xs font-mono text-coral mb-2 tracking-widest uppercase font-semibold">{product.brand}</p>
              <h1 className="font-display font-700 text-3xl md:text-4xl text-slate-850 mb-3">{product.name}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-signal-green font-semibold bg-signal-green/10 px-2.5 py-1 rounded-full text-xs">
                  <ShieldCheck className="h-4 w-4" /> AI Condition Verified
                </span>
                <span className="text-black/30">•</span>
                <span className="font-mono text-xs bg-slate-850 text-white px-2.5 py-1 rounded-full font-bold">
                  Trust Score: {product.trustScore}/100
                </span>
              </div>
            </div>

            <div className="mb-8">
              <p className="font-display font-700 text-4xl text-slate-850">₹{product.price.toLocaleString("en-IN")}</p>
              <p className="text-xs text-black/50 mt-1">Free express delivery · Free AI verification badge included.</p>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-3">Storage Variant</h3>
                <div className="flex gap-3">
                  {["128GB", "256GB"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStorage(st)}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        selectedStorage === st
                          ? "border-2 border-coral bg-coral/5 text-coral"
                          : "border border-black/10 text-black/60 hover:border-black/30"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-3">Device Condition Grade</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { grade: "Superb", desc: "Flawless like new" },
                    { grade: "Good", desc: "Minor micro scratch" },
                    { grade: "Fair", desc: "Visible cosmetic wear" }
                  ].map((cg) => (
                    <div
                      key={cg.grade}
                      onClick={() => setSelectedCondition(cg.grade)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all ${
                        selectedCondition === cg.grade
                          ? "border-2 border-coral bg-coral/5"
                          : "border border-black/10 hover:border-black/30"
                      }`}
                    >
                      <p className={`font-semibold text-sm mb-0.5 ${selectedCondition === cg.grade ? "text-coral" : "text-slate-850"}`}>
                        {cg.grade}
                      </p>
                      <p className="text-xs text-black/55">{cg.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 font-display font-600 px-6 py-4 rounded-xl text-sm transition-all focus-ring ${
                  added
                    ? "bg-signal-green text-white"
                    : "bg-coral hover:bg-coral-dark text-white shadow-lg shadow-coral/20"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" /> Add to Cart
                  </>
                )}
              </button>
              
              <Link
                href="/checkout"
                className="flex-1 flex items-center justify-center gap-2 bg-ink hover:bg-ink-900 text-white font-display font-600 px-6 py-4 rounded-xl text-sm transition-colors focus-ring"
              >
                <Zap className="h-5 w-5 text-signal-green" /> Buy Now
              </Link>
            </div>

            {/* Guarantee Cards */}
            <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-coral mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display font-600 text-sm text-slate-850">Free Express Delivery</h4>
                  <p className="text-xs text-black/55">Ships within 24 hours via Insured Logistics.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-signal-green mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display font-600 text-sm text-slate-850">6 Months Zyphor Care Warranty</h4>
                  <p className="text-xs text-black/55">Comprehensive functional & battery health warranty included.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
}
