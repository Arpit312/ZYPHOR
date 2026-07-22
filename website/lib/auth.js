import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "zyphor_dev_secret_change_me_in_production";
const COOKIE_NAME = "zyphor_session";

export async function hashPassword(plain) { return bcrypt.hash(plain, 10); }
export async function comparePassword(plain, hash) { return bcrypt.compare(plain, hash); }

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Universal session user reader (supports NextAuth + Custom JWTs + Mobile Bearer)
export async function getSessionUser() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    // 1. Check custom zyphor_session cookie
    const customToken = cookieStore.get(COOKIE_NAME)?.value;
    if (customToken) {
      const decoded = verifyToken(customToken);
      if (decoded) return decoded;
    }

    // 2. Check NextAuth Session
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
    const session = await getServerSession(authOptions);

    if (session?.user) {
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || "customer",
        userTokenId: session.user.userTokenId,
        businessName: session.user.businessName,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function getSessionUserSync(cookieValue) {
  if (!cookieValue) return null;
  return verifyToken(cookieValue);
}

export function getUserFromBearer(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

export const ROLES = ["customer", "retailer", "wholesaler", "technician", "admin"];
export const SELLER_ROLES = ["retailer", "wholesaler", "technician"];
export const ROLES_NEEDING_SUBSCRIPTION = ["retailer", "wholesaler", "technician"];
