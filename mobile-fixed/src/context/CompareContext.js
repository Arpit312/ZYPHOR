import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CompareContext = createContext(null);

const STORAGE_KEY = "zyphor_mobile_compare";
export const MAX_COMPARE = 3;

// Stores full listing snapshots (so compare works even offline) — max 3 items.
export const CompareProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setItems(JSON.parse(saved));
      } catch {}
      finally { setIsLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, isLoaded]);

  const isCompared = useCallback((id) => items.some((i) => String(i._id || i.id) === String(id)), [items]);

  // Returns { success, message?, added }
  const add = useCallback((listing) => {
    const id = String(listing._id || listing.id);
    let result;
    setItems((prev) => {
      if (prev.some((i) => String(i._id || i.id) === id)) { result = { success: true, added: false }; return prev; }
      if (prev.length >= MAX_COMPARE) { result = { success: false, message: `Compare supports up to ${MAX_COMPARE} devices.` }; return prev; }
      result = { success: true, added: true };
      return [...prev, listing];
    });
    return result || { success: true, added: true };
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => String(i._id || i.id) !== String(id)));
  }, []);

  const toggle = useCallback((listing) => {
    const id = String(listing._id || listing.id);
    if (isCompared(id)) { remove(id); return { success: true, added: false }; }
    return add(listing);
  }, [isCompared, add, remove]);

  const clear = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider value={{ items, isCompared, add, remove, toggle, clear, max: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};
