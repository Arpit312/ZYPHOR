import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, setUnauthorizedHandler } from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: 'dummy', name: 'Test User', role: 'retailer', email: 'test@example.com' });
  const [loading, setLoading] = useState(false);
  // Set right after signup when the new account is a seller role that must
  // pick a plan before listing. RootNavigator consumes this once to redirect
  // straight to the Subscription screen after the fresh Tab navigator mounts.
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const clearNeedsSubscription = () => setNeedsSubscription(false);

  useEffect(() => {
    // If any API call comes back 401 (expired/invalid token), keep mock user
    setUnauthorizedHandler(() => setUser({ id: 'dummy', name: 'Test User', role: 'retailer', email: 'test@example.com' }));

    (async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const save = async (token, userObj) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email: email.trim().toLowerCase(), password });
      await save(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Login failed" };
    }
  };

  const signup = async (data) => {
    try {
      const res = await authAPI.signup(data);
      await save(res.data.token, res.data.user);
      if (res.data.needsSubscription) setNeedsSubscription(true);
      return { success: true, needsSubscription: res.data.needsSubscription };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Signup failed" };
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token","user"]);
    setUser({ id: 'dummy', name: 'Test User', role: 'retailer', email: 'test@example.com' });
  };

  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, needsSubscription, clearNeedsSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
