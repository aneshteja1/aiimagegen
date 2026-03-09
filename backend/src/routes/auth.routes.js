import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  findUserByEmail, findUserById, registerUser,
  comparePassword, signAccessToken, signRefreshToken,
  saveRefreshToken, validateRefreshToken, revokeRefreshToken,
  createPasswordResetToken, resetPassword,
} from '../services/auth.service.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/security.middleware.js';
import { query } from '../db/connection.js';

const router = Router();

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/)
      .withMessage('Password must be 8+ chars with at least one uppercase letter and number.'),
    body('full_name').trim().isLength({ min: 2, max: 200 }).withMessage('Full name required.'),
    body('company_name').optional().trim().isLength({ max: 200 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg });

    try {
      const user = await registerUser(req.body);
      // Fire-and-forget welcome email
      sendWelcomeEmail(user.email, user.full_name).catch(console.error);
      res.status(201).json({ message: 'Registration submitted. Pending admin approval.', userId: user.id });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: 'Email and password required.' });

    try {
      const { email, password } = req.body;
      const user = await findUserByEmail(email);

      if (!user || !(await comparePassword(password, user.password_hash))) {
        return res.status(401).json({ error: 'Incorrect email or password.' });
      }

      if (user.status === 'rejected') {
        return res.status(403).json({ error: 'Your account has been rejected. Contact support.' });
      }

      // Update last login
      await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

      const accessToken = signAccessToken(user);
      const rawRefresh = signRefreshToken(user.id);
      await saveRefreshToken(user.id, rawRefresh, req.headers['user-agent'], req.ip);

      // Remove sensitive field
      const { password_hash, ...safeUser } = user;

      res.json({
        accessToken,
        refreshToken: rawRefresh,
        user: safeUser,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/refresh ────────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  const rawToken = req.body.refreshToken;
  if (!rawToken) return res.status(400).json({ error: 'Refresh token required.' });

  try {
    const tokenRow = await validateRefreshToken(rawToken);
    if (!tokenRow) return res.status(401).json({ error: 'Invalid or expired refresh token.' });

    const user = await findUserById(tokenRow.user_id);
    if (!user) return res.status(401).json({ error: 'User not found.' });

    // Rotate token
    await revokeRefreshToken(rawToken);
    const newRefresh = signRefreshToken(user.id);
    await saveRefreshToken(user.id, newRefresh, req.headers['user-agent'], req.ip);

    const { password_hash, ...safeUser } = user;
    res.json({
      accessToken: signAccessToken(user),
      refreshToken: newRefresh,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', requireAuth, async (req, res, next) => {
  const rawToken = req.body.refreshToken;
  try {
    if (rawToken) await revokeRefreshToken(rawToken);
    res.json({ message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────
router.post('/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: 'Valid email required.' });

    try {
      const user = await findUserByEmail(req.body.email);
      // Always return 200 to prevent email enumeration attacks
      if (user) {
        const rawToken = await createPasswordResetToken(user.id);
        sendPasswordResetEmail(user.email, rawToken, user.full_name).catch(console.error);
      }
      res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/reset-password ────────────────────────────
router.post('/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Token required.'),
    body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/)
      .withMessage('Password must be 8+ chars with uppercase letter and number.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg });

    try {
      await resetPassword(req.body.token, req.body.password);
      res.json({ message: 'Password reset successfully. You may now log in.' });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
});

export default router;
