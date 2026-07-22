import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "zyphor_dev_secret_change_me_in_production";
const COOKIE_NAME = "zyphor_session";

export async function hashPassword(plain) { return bcrypt.hash(plain, 10); }
export async function comparePassword(plain, hash) { return bcrypt.compare(plain, hash); }

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

// For server components (Next.js 14 app router)
export async function getSessionUser() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch { return null; }
}

// For API routes (sync, non-async)
export function getSessionUserSync(cookieValue) {
  if (!cookieValue) return null;
  return verifyToken(cookieValue);
}

// For mobile Bearer token
export function getUserFromBearer(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

export const ROLES = ["customer","retailer","wholesaler","technician","admin"];
export const SELLER_ROLES = ["retailer","wholesaler","technician"];
export const ROLES_NEEDING_SUBSCRIPTION = ["retailer","wholesaler","technician"];
