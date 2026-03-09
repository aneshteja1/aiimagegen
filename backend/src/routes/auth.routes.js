import { Router } from 'express';
import { 
  findUserByEmail, 
  comparePassword, 
  signAccessToken, 
  signRefreshToken, 
  saveRefreshToken,
  registerUser // <--- Make sure this is imported!
} from '../services/auth.service.js';
import { query } from '../db/connection.js';

const router = Router();

// ── 1. REGISTER ROUTE ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, company_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    // This calls the transaction in auth.service.js to safely create the company AND user
    const newUser = await registerUser({ email, password, full_name, company_name });

    res.status(201).json({ 
      message: 'Registration successful! Your account is pending admin approval.', 
      user: newUser 
    });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.status === 409) {
      return res.status(409).json({ error: err.message }); // Email already exists
    }
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ── 2. LOGIN ROUTE ────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    
    // Venkat Tech Managed Services requires users to be approved
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Account is pending approval by Venkat Tech.' });
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
