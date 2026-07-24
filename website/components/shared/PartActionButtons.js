"use client";
import { useState } from "react";
import Link from "next/link";
import { Zap, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function PartActionButtons({ part, user }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart({
      id: part._id,
      title: part.title,
      brand: part.brand,
      model: part.model,
      price: part.price,
      image: part.images?.[0] || "/placeholder-device.svg",
      type: "part"
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      {user ? (
        <>
          {/* Order Part Now (Express Checkout) */}
          <form action="/api/orders" method="POST" className="flex-1">
            <input type="hidden" name="listingId" value={part._id.toString()} />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 text-white font-display font-700 py-4 rounded-2xl shadow-lg shadow-coral/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              <Zap className="h-5 w-5 fill-white/20" /> Order Part Now (₹{part.price?.toLocaleString()})
            </button>
          </form>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`px-6 py-4 rounded-2xl border font-display font-600 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              added
                ? "bg-signal-green text-white border-signal-green shadow-lg shadow-signal-green/20"
                : "bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-white/30"
            }`}
          >
            {added ? (
              <>
                <Check className="h-5 w-5" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 text-coral" /> Add to Cart
              </>
            )}
          </button>
        </>
      ) : (
        <Link
          href={`/login?redirect=/parts/${part._id}`}
          className="w-full text-center bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 text-white font-display font-700 py-4 rounded-2xl shadow-lg shadow-coral/20 transition-all text-base"
        >
          Log in to Purchase Part (₹{part.price?.toLocaleString()})
        </Link>
      )}
    </div>
  );
}
