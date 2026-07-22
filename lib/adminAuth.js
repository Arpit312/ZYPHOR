import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "zyphor_dev_secret_change_me_in_production";
const COOKIE_NAME = "zyphor_session";

/**
 * Universal Admin Session Guard for App Router API routes.
 * Reads JWT cookie from Next.js Request headers — works for ALL API routes.
 * Returns: { ok: true, session } or { ok: false, response }
 */
export async function requireAdmin(req) {
  try {
    let token = null;

    // Method 1: Read from Request cookie header (API routes)
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
    if (match?.[1]) token = decodeURIComponent(match[1]);

    // Method 2: Fallback to Authorization Bearer header
    if (!token) {
      const authHeader = req.headers.get("authorization") || "";
      if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
    }

    if (!token) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized. Please log in as Admin." }, { status: 401 })
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return {
        ok: false,
        response: NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 })
      };
    }

    return { ok: true, session: decoded };
  } catch (err) {
    return {
      ok: false,
      response: NextResponse.json({ error: `Authentication failed: ${err.message}` }, { status: 401 })
    };
  }
}

/**
 * Safely parse request body JSON without throwing
 */
export async function safeJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
