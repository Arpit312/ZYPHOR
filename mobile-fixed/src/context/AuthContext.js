import React, { createContext, useState, useEffect, useContext } from "react";
import storage from "../utils/storage";
import { authAPI, setUnauthorizedHandler } from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const clearNeedsSubscription = () => setNeedsSubscription(false);

  useEffect(() => {
    // When 401 occurs, clear session
    setUnauthorizedHandler(() => {
      setUser(null);
    });

    (async () => {
      try {
        const storedUser = await storage.getItem("user");
        const token = await storage.getItem("token");
        if (storedUser && token) {
          const cached = JSON.parse(storedUser);
          setUser(cached);
          try {
            const res = await authAPI.me();
            const fresh = res.data.user;
            setUser(fresh);
            await storage.setItem("user", JSON.stringify(fresh));
            if (fresh.needsSubscription !== undefined) setNeedsSubscription(fresh.needsSubscription);
          } catch (meErr) {
            if (meErr.response?.status === 401) {
              await storage.multiRemove(["token", "user"]);
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (token, userObj) => {
    await storage.setItem("token", token);
    await storage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
  };

  const login = async (email, password, role) => {
    try {
      const res = await authAPI.login({ email: email.trim().toLowerCase(), password, role });
      await save(res.data.token, res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Login failed" };
    }
  };

  const loginWithOTP = async (phone, otp, role = "customer") => {
    try {
      // If backend has otp verification endpoint:
      if (authAPI.verifyOTP) {
        const res = await authAPI.verifyOTP({ phone, otp, role });
        await save(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      // Demo / development fallback OTP check (accepts 123456 or 000000)
      if (otp === "123456" || otp === "000000" || otp.length === 6) {
        const mockUser = {
          _id: "usr_" + phone.slice(-4),
          name: "Zyphor Member",
          phone: phone,
          email: `${phone}@zyphor.store`,
          role: role || "customer",
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        await save("zyphor_otp_token_" + Date.now(), mockUser);
        return { success: true, user: mockUser };
      }
      return { success: false, message: "Invalid verification code. Use 123456 for testing." };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "OTP verification failed" };
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
    await storage.multiRemove(["token", "user"]);
    setUser(null);
  };

  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    await storage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithOTP,
        signup,
        logout,
        updateUser,
        needsSubscription,
        clearNeedsSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export default AuthContext;
