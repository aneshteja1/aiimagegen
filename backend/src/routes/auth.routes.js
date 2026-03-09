import { Router } from 'express';
import { findUserByEmail, comparePassword, signAccessToken, signRefreshToken, saveRefreshToken } from '../services/auth.service.js';
import { query } from '../db/connection.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Uses the LEFT JOIN from auth.service.js
    const user = await findUserByEmail(email);

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Account rejected.' });
    }

    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshToken);

    const { password_hash, ...safeUser } = user;
    res.json({ accessToken, refreshToken, user: safeUser });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

export default router;
