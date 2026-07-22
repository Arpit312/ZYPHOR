import mongoose from "mongoose";

let cached = global._zyphorMongo;
if (!cached) cached = global._zyphorMongo = { conn: null, promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ MONGODB_URI Environment Variable is not set on Render. Please add MONGODB_URI in Render Environment settings.");
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };
    cached.promise = mongoose.connect(uri, opts).then((m) => m).catch(err => {
      console.error("⚠️ MongoDB Atlas Connection Error:", err.message);
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    console.error("⚠️ MongoDB Connection Failed:", err.message);
    return null;
  }

  return cached.conn;
}

export function getDBStatus() {
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  return {
    state: states[mongoose.connection.readyState] || "unknown",
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}
