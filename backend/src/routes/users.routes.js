// ── users.routes.js ──────────────────────────────────────────
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireApproved, requireAdmin, requireSuperAdmin } from '../middleware/auth.middleware.js';
import { query, queryOne } from '../db/connection.js';
import { sendApprovalEmail } from '../services/email.service.js';
import { hashPassword } from '../services/auth.service.js';

const router = Router();
router.use(requireAuth);

// GET /api/users/me
router.get('/me', async (req, res, next) => {
  try {
    const user = await queryOne(
      `SELECT u.id,u.email,u.full_name,u.role,u.status,u.avatar_url,u.company_id,
              c.name as company_name, c.credit_balance, c.subscription_plan
       FROM users u LEFT JOIN companies c ON c.id=u.company_id WHERE u.id=$1`,
      [req.user.sub]
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) { next(err); }
});

// GET /api/users — admin: list users of own company
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role === 'superadmin';
    const companyFilter = isSuperAdmin ? '' : `WHERE u.company_id = '${req.user.company_id}'`;
    const rows = await query(
      `SELECT u.id,u.email,u.full_name,u.role,u.status,u.created_at,u.last_login_at,
              c.name as company_name
       FROM users u LEFT JOIN companies c ON c.id=u.company_id ${companyFilter}
       ORDER BY u.created_at DESC LIMIT 200`
    );
    res.json(rows.rows);
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/status — approve/reject user
router.patch('/:id/status', requireAdmin,
  [body('status').isIn(['approved', 'rejected', 'pending'])],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: 'Invalid status.' });
    try {
      const user = await queryOne(`SELECT * FROM users WHERE id=$1`, [req.params.id]);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      // Non-superadmin can only manage their company's users
      if (req.user.role !== 'superadmin' && user.company_id !== req.user.company_id) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      await query(`UPDATE users SET status=$1 WHERE id=$2`, [req.body.status, req.params.id]);
      if (req.body.status === 'approved') {
        sendApprovalEmail(user.email, user.full_name).catch(console.error);
      }
      res.json({ message: `User status updated to ${req.body.status}.` });
    } catch (err) { next(err); }
  }
);

// PATCH /api/users/:id/role — change user role
router.patch('/:id/role', requireAdmin,
  [body('role').isIn(['user', 'company_admin'])],
  async (req, res, next) => {
    try {
      await query(`UPDATE users SET role=$1 WHERE id=$2`, [req.body.role, req.params.id]);
      res.json({ message: 'Role updated.' });
    } catch (err) { next(err); }
  }
);

// DELETE /api/users/:id
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await query(`DELETE FROM users WHERE id=$1`, [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) { next(err); }
});

export default router;
