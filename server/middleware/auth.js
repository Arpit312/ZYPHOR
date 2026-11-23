const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_jwt_key_123_zyphor";

// Same JWT_SECRET as website — cross-platform login works!
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
};

module.exports.optional = function authOptional(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try { req.user = jwt.verify(header.slice(7), JWT_SECRET); } catch {}
  }
  next();
};
