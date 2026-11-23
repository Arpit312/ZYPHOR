import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { wishlistAPI } from "../api/api";
import { useAuth } from "./AuthContext";

export const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState([]); // array of listing id strings
  const [items, setItems] = useState([]); // full listing objects
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setIds([]); setItems([]); return; }
    setLoading(true);
    try {
      const [idsRes, allRes] = await Promise.all([
        wishlistAPI.getIds().catch(() => null),
        wishlistAPI.getAll().catch(() => null),
      ]);
      if (idsRes) setIds(idsRes.data.ids || []);
      if (allRes) setItems(allRes.data.wishlist || []);
    } catch {
      // offline or not logged in — keep previous state
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const isWishlisted = useCallback((id) => ids.includes(String(id)), [ids]);

  const toggle = useCallback(async (listingId) => {
    if (!user) return { success: false, message: "Login required" };
    const id = String(listingId);
    try {
      if (ids.includes(id)) {
        await wishlistAPI.remove(id);
        setIds((prev) => prev.filter((x) => x !== id));
        setItems((prev) => prev.filter((x) => String(x._id || x.id) !== id));
        return { success: true, added: false };
      }
      await wishlistAPI.add(id);
      setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      return { success: true, added: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Could not update wishlist" };
    }
  }, [user, ids]);

  const add = useCallback(async (listingId) => {
    if (!user || ids.includes(String(listingId))) return { success: true, added: true };
    return toggle(listingId);
  }, [user, ids, toggle]);

  const remove = useCallback(async (listingId) => {
    const id = String(listingId);
    if (!user || !ids.includes(id)) return { success: true };
    return toggle(listingId);
  }, [user, ids, toggle]);

  return (
    <WishlistContext.Provider value={{ ids, items, loading, isWishlisted, toggle, add, remove, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
