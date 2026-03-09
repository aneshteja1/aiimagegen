import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

/** Security headers via Helmet */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc:  ["'self'", "'unsafe-inline'"],
      imgSrc:    ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://generativelanguage.googleapis.com', 'https://*.googleapis.com'],
      fontSrc:   ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/** CORS — allow configured origins only */
export const corsMiddleware = cors({
  origin: (origin, cb) => {
    const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map(s => s.trim());
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/** General API rate limiter */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  skip: (req) => req.ip === '127.0.0.1' && process.env.NODE_ENV === 'development',
});

/** Stricter limiter for auth endpoints */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Stricter limiter for AI generation endpoints */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AI_MAX || '20'),
  message: { error: 'AI generation rate limit exceeded. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Global error handler */
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal server error.';

  if (status >= 500) {
    console.error('[ERROR]', {
      status, message: err.message, stack: err.stack,
      url: req.url, method: req.method, ip: req.ip,
    });
  }

  res.status(status).json({ error: message });
}
