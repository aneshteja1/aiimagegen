import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, queryOne, transaction } from '../db/connection.js';

const SALT_ROUNDS = 12;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';
const RESET_TOKEN_EXPIRES_MINUTES = 60;

// ── Hashing ──────────────────────────────────────────────────
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// ── JWT ───────────────────────────────────────────────────────
export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      status: user.status,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// ── Auth Operations (FIXED: Added LEFT JOIN and LOWER) ────────
export async function findUserByEmail(email) {
  // LEFT JOIN ensures the user is found even if company_id is null or missing in companies table
  const sql = `
    SELECT u.*, c.name AS company_name, c.slug AS company_slug, c.subscription_plan 
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1
  `;
  return queryOne(sql, [email]);
}

export async function findUserById(id) {
  return queryOne(
    `SELECT u.*, c.name AS company_name, c.credit_balance, c.subscription_plan
     FROM users u
     LEFT JOIN companies c ON c.id = u.company_id
     WHERE u.id = $1`,
    [id]
  );
}

export async function registerUser({ email, password, full_name, company_name }) {
  return transaction(async ({ query: q, queryOne: qOne }) => {
    const emailLower = email.toLowerCase();
    // Check duplicate email
    const existing = await qOne('SELECT id FROM users WHERE LOWER(email) = $1', [emailLower]);
    if (existing) throw Object.assign(new Error('Email already registered.'), { status: 409 });

    let companyId = null;
    if (company_name && company_name.trim()) {
      const slug = company_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let co = await qOne('SELECT id FROM companies WHERE slug = $1', [slug]);
      if (!co) {
        const res = await q(
          `INSERT INTO companies (name, slug) VALUES ($1, $2) RETURNING id`,
          [company_name.trim(), slug]
        );
        co = res.rows[0];
      }
      companyId = co.id;
    }

    const passwordHash = await hashPassword(password);
    const res = await q(
      `INSERT INTO users (email, password_hash, full_name, company_id, role, status)
       VALUES ($1, $2, $3, $4, 'user', 'pending') RETURNING id, email, full_name, role, status, company_id`,
      [emailLower, passwordHash, full_name.trim(), companyId]
    );
    return res.rows[0];
  });
}

// ── Refresh Token Management ──────────────────────────────────
export async function saveRefreshToken(userId, rawToken, userAgent, ipAddress) {
  const hash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, hash, expiresAt, userAgent || null, ipAddress || null]
  );
}

export async function validateRefreshToken(rawToken) {
  const hash = hashToken(rawToken);
  return queryOne(
    `SELECT rt.*, u.id as user_id FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
    [hash]
  );
}

export async function revokeRefreshToken(rawToken) {
  const hash = hashToken(rawToken);
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
    [hash]
  );
}

export async function revokeAllUserTokens(userId) {
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

// ── Password Reset ────────────────────────────────────────────
export async function createPasswordResetToken(userId) {
  await query(
    `UPDATE password_reset_tokens SET used_at = NOW()
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  );

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);

  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, hash, expiresAt]
  );

  return rawToken;
}

export async function validatePasswordResetToken(rawToken) {
  const hash = hashToken(rawToken);
  return queryOne(
    `SELECT prt.*, u.email FROM password_reset_tokens prt
     JOIN users u ON u.id = prt.user_id
     WHERE prt.token_hash = $1 AND prt.used_at IS NULL AND prt.expires_at > NOW()`,
    [hash]
  );
}

export async function resetPassword(rawToken, newPassword) {
  const tokenRow = await validatePasswordResetToken(rawToken);
  if (!tokenRow) throw Object.assign(new Error('Invalid or expired reset token.'), { status: 400 });

  const passwordHash = await hashPassword(newPassword);

  return transaction(async ({ query: q }) => {
    await q(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, tokenRow.user_id]);
    await q(`UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = $1`, [hashToken(rawToken)]);
    await q(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [tokenRow.user_id]);
  });
}
