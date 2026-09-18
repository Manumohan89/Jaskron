import crypto from 'crypto';

// Simple JWT-like token using HMAC (no external deps).
// SECURITY: in production this MUST be set via env var — we refuse to boot
// with the old hardcoded fallback secret since anyone could forge tokens.
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET is not set. Refusing to start in production with no secret.');
    process.exit(1);
  } else {
    console.warn('⚠️  JWT_SECRET not set — using an insecure dev-only fallback. Set JWT_SECRET before deploying.');
  }
}
const EFFECTIVE_SECRET = SECRET || 'dev-only-insecure-secret-do-not-use-in-prod';

const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createToken(payload, ttl = ACCESS_TOKEN_TTL) {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttl })).toString('base64url');
  const sig = crypto.createHmac('sha256', EFFECTIVE_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function createRefreshToken(payload, jti) {
  return createToken({ ...payload, type: 'refresh', jti: jti || crypto.randomUUID() }, REFRESH_TOKEN_TTL);
}

export function verifyToken(token) {
  try {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', EFFECTIVE_SECRET).update(data).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid or expired token', code: 'TOKEN_EXPIRED' });
  req.user = payload;
  req.currentJti = payload.jti;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
