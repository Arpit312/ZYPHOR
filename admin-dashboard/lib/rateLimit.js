const limits = new Map();

export function rateLimit(key, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const userData = limits.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > userData.resetTime) {
    userData.count = 0;
    userData.resetTime = now + windowMs;
  }

  userData.count++;
  limits.set(key, userData);

  return userData.count <= maxRequests;
}
