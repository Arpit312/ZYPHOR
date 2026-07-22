/**
 * Zyphor Zero-Cost In-Memory Rate Limiter Middleware
 * Protects AI APIs from spam, bot abuse, and API quota exhaustion.
 */
const rateLimitMap = new Map();

export function checkRateLimit(req, options = { limit: 10, windowMs: 24 * 60 * 60 * 1000 }) {
  // Extract client IP address
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "127.0.0.1";
  const currentTime = Date.now();
  const userRecord = rateLimitMap.get(ip);

  if (userRecord) {
    // Reset if window time elapsed
    if (currentTime - userRecord.startTime > options.windowMs) {
      rateLimitMap.set(ip, { count: 1, startTime: currentTime });
      return { allowed: true, remaining: options.limit - 1 };
    }
    // Check if limit exceeded
    if (userRecord.count >= options.limit) {
      return { allowed: false, remaining: 0, resetTime: userRecord.startTime + options.windowMs };
    }
    // Increment count
    userRecord.count += 1;
    rateLimitMap.set(ip, userRecord);
    return { allowed: true, remaining: options.limit - userRecord.count };
  }

  // First request for this IP
  rateLimitMap.set(ip, { count: 1, startTime: currentTime });
  return { allowed: true, remaining: options.limit - 1 };
}
