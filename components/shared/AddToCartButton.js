"use client";
import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
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
  );
}
