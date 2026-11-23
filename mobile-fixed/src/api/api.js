import axios from "axios";
import storage from "../utils/storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Auto-detect the dev server host from Expo's manifest so physical phones can reach the backend:
//  - Physical device (Expo Go / dev client): use the LAN IP Expo reports in hostUri.
//  - Android emulator: the LAN IP is unreachable from the emulator VM -> use 10.0.2.2.
//  - iOS simulator / web: shares the host network -> localhost works.
//  - Production builds: expoConfig/manifest are null there, so always set EXPO_PUBLIC_API_URL.
const getDevServerIP = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||                     // expo start (SDK 49+)
      Constants.manifest2?.extra?.expoGo?.debuggerHost ||  // Expo Go fallback
      // Legacy manifest is only read in dev — touching it in production logs a warning.
      (__DEV__ ? Constants.manifest?.debuggerHost || Constants.manifest?.hostUri : "") ||
      "";
    // hostUri looks like "192.168.1.10:8081" or "[fe80::1]:8081"
    let host = "";
    if (hostUri.startsWith("[")) {
      const end = hostUri.indexOf("]");
      host = end > 0 ? hostUri.slice(1, end) : "";
    } else {
      host = hostUri.split(":")[0];
    }
    // Android emulator cannot reach the machine's LAN IP — it must use 10.0.2.2.
    if (Platform.OS === "android" && !Constants.isDevice) return "10.0.2.2";
    if (host) return host;
  } catch {}
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
};

const BASE = process.env.EXPO_PUBLIC_API_URL ||
  `http://${getDevServerIP()}:5000/api`;

if (!process.env.EXPO_PUBLIC_API_URL && !__DEV__) {
  console.warn("[api] EXPO_PUBLIC_API_URL is not set — production builds need it to reach the backend.");
}

const api = axios.create({ baseURL: BASE, timeout: 20000 });

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Lets AuthContext know when a request fails auth, so it can clear the
// in-memory session too (not just storage) and bounce back to Login.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

api.interceptors.response.use(r => r, async (err) => {
  if (err.response?.status === 401) {
    await storage.multiRemove(["token","user"]);
    if (onUnauthorized) onUnauthorized();
  }
  return Promise.reject(err);
});

const e = (err) => err.response?.data?.error || err.message || "Something went wrong";

export const authAPI = {
  login: (d) => api.post("/auth/login", d),
  sendOTP: (d) => api.post("/auth/send-otp", d),
  verifyOTP: (d) => api.post("/auth/verify-otp", d),
  signup: (d) => api.post("/auth/signup", d),
  me: () => api.get("/auth/me"),
  updateProfile: (d) => api.patch("/auth/profile", d),
  forgotPassword: (email, role) => api.post("/auth/forgot-password", { email, role }),
  resetPassword: (d) => api.post("/auth/reset-password", d),
  addresses: {
    getAll: () => api.get("/auth/addresses"),
    add: (d) => api.post("/auth/addresses", d),
    update: (id, d) => api.patch(`/auth/addresses/${id}`, d),
    remove: (id) => api.delete(`/auth/addresses/${id}`),
  },
};
export const listingsAPI = {
  getAll: (p) => api.get("/listings", { params: p }),
  getById: (id) => api.get(`/listings/${id}`),
  getSeller: (id) => api.get(`/listings/seller/${id}`),
  create: (d) => api.post("/listings", d),
  update: (id, d) => api.patch(`/listings/${id}`, d),
  delete: (id) => api.delete(`/listings/${id}`),
  addReview: (id, d) => api.post(`/listings/${id}/reviews`, d),
};
export const ordersAPI = {
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  create: (d) => api.post("/orders", d),
  updateStatus: (id, d) => api.patch(`/orders/${id}/status`, d),
};
export const aiAPI = {
  advisor: (message) => api.post("/ai/advisor", { message }),
  pricing: (d) => api.post("/ai/pricing", d),
  verifyImei: (d) => api.post("/ai/verify-imei", d),
};
export const uploadAPI = {
  uploadImage: (formData) => api.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
};
export const imeiAPI = { check: (imei) => api.post("/imei/check", { imei }) };
export const subAPI = {
  get: () => api.get("/subscriptions"),
  subscribe: (d) => api.post("/subscriptions", d),
};
export const repairAPI = {
  book: (d) => api.post("/repair", d),
  getAll: () => api.get("/repair"),
  getById: (id) => api.get(`/repair/${id}`),
  updateStatus: (id, d) => api.patch(`/repair/${id}/status`, d),
};
export const wishlistAPI = {
  getAll: () => api.get("/wishlist"),
  getIds: () => api.get("/wishlist/ids"),
  add: (listingId) => api.post("/wishlist", { listingId }),
  remove: (listingId) => api.delete(`/wishlist/${listingId}`),
};
export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  readAll: () => api.post("/notifications/read-all"),
};
export const supportAPI = {
  getAll: () => api.get("/support"),
  create: (d) => api.post("/support", d),
  reply: (id, message) => api.post(`/support/${id}/reply`, { message }),
};
export default api;
