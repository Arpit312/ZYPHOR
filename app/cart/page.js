"use client";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Link from "next/link";
import { ShoppingCart, ShieldCheck, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <div className="py-20 min-h-screen bg-paper flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
      </div>
    );
  }

  return (
    <div className="py-16 min-h-screen bg-paper">
      <Container>
        <SectionHeading 
          title="Your Cart" 
          eyebrow="Checkout" 
          subtitle="Review your AI-verified items before purchase."
          className="mb-10"
        />
        
        {cart.length === 0 ? (
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-12 border border-black/[0.06] text-center flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-ink/5 flex items-center justify-center text-black/30 mb-5">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <h3 className="font-display font-600 text-xl text-slate-850 mb-2">Your cart is empty</h3>
            <p className="text-black/55 text-sm mb-8 max-w-sm">
              Looks like you haven&apos;t added any verified devices to your cart yet.
            </p>
            <Link 
              href="/buy"
              className="bg-coral hover:bg-coral-dark text-white font-display font-600 px-8 py-3.5 rounded-xl text-sm transition-colors focus-ring inline-flex items-center gap-2"
            >
              Browse Phones Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-5 border border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-16 w-16 bg-paper rounded-xl border border-black/5 flex items-center justify-center shrink-0">
                      <span className="font-mono text-xs text-black/40">IMG</span>
                    </div>
                    <div>
                      <h4 className="font-display font-600 text-base text-slate-850">{item.name}</h4>
                      <p className="text-xs text-black/50">Condition: <span className="text-coral font-medium">{item.condition || "Good"}</span></p>
                      <p className="font-display font-700 text-base text-slate-850 mt-1">₹{(item.price || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5">
                    <div className="flex items-center border border-black/10 rounded-lg bg-paper">
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="p-2 hover:bg-black/5 text-black/60 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 font-mono text-sm font-semibold">{item.quantity || 1}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="p-2 hover:bg-black/5 text-black/60 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-black/40 hover:text-red-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06] h-fit sticky top-24">
              <h3 className="font-display font-600 text-lg mb-6 border-b border-black/5 pb-4">Order Summary</h3>
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-black/60">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-black/60">
                  <span>AI Verification Fee</span>
                  <span className="text-signal-green font-medium">Free</span>
                </div>
                <div className="flex justify-between text-black/60 border-b border-black/5 pb-4">
                  <span>Express Shipping</span>
                  <span className="text-signal-green font-medium">Free</span>
                </div>
                <div className="flex justify-between font-display font-600 text-lg pt-1 text-slate-850">
                  <span>Total Payable</span>
                  <span className="font-mono">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full block text-center bg-coral hover:bg-coral-dark text-white font-display font-600 px-6 py-4 rounded-xl text-sm transition-colors focus-ring shadow-lg shadow-coral/20"
              >
                Proceed to Checkout →
              </Link>
              
              <div className="mt-6 flex items-start gap-3 bg-signal-green/5 p-4 rounded-xl border border-signal-green/20">
                <ShieldCheck className="h-5 w-5 text-signal-green shrink-0 mt-0.5" />
                <p className="text-xs text-black/60 leading-relaxed">
                  <strong className="text-slate-850 block mb-1">Zyphor Trust Protection</strong>
                  Payment held in secure escrow until you verify the device condition upon delivery.
                </p>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
