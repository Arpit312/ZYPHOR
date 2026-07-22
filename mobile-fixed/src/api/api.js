import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BASE = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:5000/api" : "http://localhost:5000/api");

const api = axios.create({ baseURL: BASE, timeout: 20000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Lets AuthContext know when a request fails auth, so it can clear the
// in-memory session too (not just AsyncStorage) and bounce back to Login.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

api.interceptors.response.use(r => r, async (err) => {
  if (err.response?.status === 401) {
    await AsyncStorage.multiRemove(["token","user"]);
    if (onUnauthorized) onUnauthorized();
  }
  return Promise.reject(err);
});

const e = (err) => err.response?.data?.error || err.message || "Something went wrong";

export const authAPI = {
  login: (d) => api.post("/auth/login", d),
  signup: (d) => api.post("/auth/signup", d),
  me: () => api.get("/auth/me"),
  updateProfile: (d) => api.patch("/auth/profile", d),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (d) => api.post("/auth/reset-password", d),
};
export const listingsAPI = {
  getAll: (p) => api.get("/listings", { params: p }),
  getById: (id) => api.get(`/listings/${id}`),
  create: (d) => api.post("/listings", d),
  update: (id, d) => api.patch(`/listings/${id}`, d),
  delete: (id) => api.delete(`/listings/${id}`),
};
export const ordersAPI = {
  getAll: () => api.get("/orders"),
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
export default api;
