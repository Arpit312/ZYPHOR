import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CartContext = createContext(null);

const STORAGE_KEY = "zyphor_mobile_cart";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to load mobile cart:", err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Persist cart to AsyncStorage
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
    }
  }, [cart, isLoaded]);

  const addToCart = (product) => {
    const id = product._id || product.id;
    setCart((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id,
          listingId: id,
          title: product.title || `${product.brand} ${product.model}`,
          brand: product.brand,
          model: product.model,
          price: Number(product.price || 0),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : Number(product.price || 0) * 1.25,
          image: product.images?.[0] || null,
          conditionGrade: product.conditionGrade || "Good",
          storage: product.storage || "128GB",
          ram: product.ram || "8GB",
          listingType: product.listingType || "device",
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const isInCart = (id) => {
    return cart.some((item) => item.id === id);
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
