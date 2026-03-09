import { Router } from 'express';
import {
  findUserByEmail, findUserById, comparePassword,
  signAccessToken, signRefreshToken, saveRefreshToken
} from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { query } from '../db/connection.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const user = await findUserByEmail(email);

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Account rejected.' });
    }

    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const accessToken = signAccessToken(user);
    const rawRefresh = signRefreshToken(user.id);
    await saveRefreshToken(user.id, rawRefresh);

    const { password_hash, ...safeUser } = user;

    res.json({ accessToken, refreshToken: rawRefresh, user: safeUser });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

export default router;
