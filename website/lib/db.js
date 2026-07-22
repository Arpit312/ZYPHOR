import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Cached connection for serverless/dev hot-reload environments
let cached = global._zyphorMongo;
if (!cached) cached = global._zyphorMongo = { conn: null, promise: null };

export async function connectDB() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env.local");

  // Already connected and in a ready state
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Connection dropped — reset and reconnect
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,           // Maintain up to 10 connections in pool
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset on failure so next call retries
    cached.promise = null;
    cached.conn = null;
    throw new Error(`MongoDB Connection Failed: ${err.message}`);
  }

  return cached.conn;
}

// Health check utility — call from admin dashboard API to verify live connection
export function getDBStatus() {
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  return {
    state: states[mongoose.connection.readyState] || "unknown",
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}
