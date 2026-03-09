import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, queryOne } from '../db/connection.js';

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, company_id: user.company_id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export async function findUserByEmail(email) {
  const sql = `
    SELECT u.*, c.name AS company_name, c.slug AS company_slug, c.credit_balance 
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1
  `;
  return queryOne(sql, [email]);
}

export async function findUserById(id) {
  return queryOne(
    `SELECT u.*, c.name AS company_name, c.credit_balance
     FROM users u
     LEFT JOIN companies c ON c.id = u.company_id
     WHERE u.id = $1`,
    [id]
  );
}

export async function saveRefreshToken(userId, rawToken) {
  const hash = hashToken(rawToken);
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
    [userId, hash]
  );
}
