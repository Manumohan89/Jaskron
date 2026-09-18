import rateLimit from 'express-rate-limit';

// 5 attempts per 15 minutes on login/register — stops brute-force password guessing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: false
});

// Looser limiter for general-purpose write endpoints (contact form, etc.)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
