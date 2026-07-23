import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._zyphorMongo;
if (!cached) cached = global._zyphorMongo = { conn: null, promise: null };

export async function connectDB() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env.local");
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then(m => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
