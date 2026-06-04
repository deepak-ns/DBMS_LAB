const jwt = require("jsonwebtoken");

const publicSecretFallback = "1234567890123456789012345678901234567890";

const getSecret = () => process.env.JWT_SECRET || publicSecretFallback;

const decodeBearer = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
};

const attachUser = (req, token) => {
  const payload = jwt.verify(token, getSecret());
  req.user = {
    id: payload.id,
    email: payload.sub,
    role: payload.role,
  };
};

const authMiddleware = (req, res, next) => {
  try {
    const token = decodeBearer(req);
    if (!token) return res.status(401).send("Missing or invalid Authorization header");
    attachUser(req, token);
    return next();
  } catch (_error) {
    return res.status(401).send("Invalid or expired token");
  }
};

const optionalAuth = (req, _res, next) => {
  try {
    const token = decodeBearer(req);
    if (token) attachUser(req, token);
  } catch (_error) {
    req.user = null;
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  const userRole = String(req.user?.role || "").toLowerCase();
  const allowed = roles.map((role) => String(role).toLowerCase());
  if (!allowed.includes(userRole)) return res.status(403).send("Forbidden");
  return next();
};

module.exports = { authMiddleware, optionalAuth, requireRole, getSecret };
