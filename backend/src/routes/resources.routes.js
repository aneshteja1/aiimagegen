// companies.routes.js
import { Router } from 'express';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/auth.middleware.js';
import { query, queryOne } from '../db/connection.js';

const companiesRouter = Router();
companiesRouter.use(requireAuth);

// GET /api/companies — superadmin: all; admin: own company
companiesRouter.get('/', async (req, res, next) => {
  try {
    if (req.user.role === 'superadmin') {
      const rows = await query(
        `SELECT c.*, COUNT(u.id) FILTER (WHERE u.status='approved') as user_count,
                COUNT(j.id) as job_count
         FROM companies c
         LEFT JOIN users u ON u.company_id=c.id
         LEFT JOIN jobs j ON j.company_id=c.id
         GROUP BY c.id ORDER BY c.created_at DESC`
      );
      return res.json(rows.rows);
    }
    if (!req.user.company_id) return res.json([]);
    const co = await queryOne(`SELECT * FROM companies WHERE id=$1`, [req.user.company_id]);
    res.json(co ? [co] : []);
  } catch (err) { next(err); }
});

// GET /api/companies/:id
companiesRouter.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const co = await queryOne(`SELECT * FROM companies WHERE id=$1`, [req.params.id]);
    if (!co) return res.status(404).json({ error: 'Company not found.' });
    if (req.user.role !== 'superadmin' && co.id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(co);
  } catch (err) { next(err); }
});

// POST /api/companies — superadmin only
companiesRouter.post('/', requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, subscription_plan = 'basic', max_users = 1 } = req.body;
    if (!name) return res.status(422).json({ error: 'Company name required.' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const res2 = await query(
      `INSERT INTO companies (name, slug, subscription_plan, max_users) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, slug, subscription_plan, max_users]
    );
    res.status(201).json(res2.rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/companies/:id
companiesRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, subscription_plan, subscription_status, max_users, settings } = req.body;
    if (req.user.role !== 'superadmin' && req.params.id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const updates = [];
    const vals = [];
    let i = 1;
    if (name) { updates.push(`name=$${i++}`); vals.push(name); }
    if (subscription_plan) { updates.push(`subscription_plan=$${i++}`); vals.push(subscription_plan); }
    if (subscription_status) { updates.push(`subscription_status=$${i++}`); vals.push(subscription_status); }
    if (max_users) { updates.push(`max_users=$${i++}`); vals.push(max_users); }
    if (settings) { updates.push(`settings=$${i++}`); vals.push(JSON.stringify(settings)); }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update.' });
    vals.push(req.params.id);
    const row = await queryOne(
      `UPDATE companies SET ${updates.join(',')} WHERE id=$${i} RETURNING *`, vals
    );
    res.json(row);
  } catch (err) { next(err); }
});

export { companiesRouter };

// ── avatars.routes.js ─────────────────────────────────────────
const avatarsRouter = Router();
avatarsRouter.use(requireAuth);

avatarsRouter.get('/', async (req, res, next) => {
  try {
    const companyId = req.user.company_id;
    const rows = await query(
      `SELECT * FROM avatars WHERE (is_global=true OR company_id=$1) AND status='approved' ORDER BY name`,
      [companyId]
    );
    res.json(rows.rows);
  } catch (err) { next(err); }
});

avatarsRouter.get('/all', requireAdmin, async (req, res, next) => {
  try {
    const isSA = req.user.role === 'superadmin';
    const filter = isSA ? '' : `WHERE company_id='${req.user.company_id}' OR is_global=true`;
    const rows = await query(`SELECT * FROM avatars ${filter} ORDER BY created_at DESC`);
    res.json(rows.rows);
  } catch (err) { next(err); }
});

avatarsRouter.patch('/:id/status', requireAdmin, async (req, res, next) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(422).json({ error: 'Invalid status.' });
  }
  try {
    await query(`UPDATE avatars SET status=$1 WHERE id=$2`, [status, req.params.id]);
    res.json({ message: 'Avatar status updated.' });
  } catch (err) { next(err); }
});

export { avatarsRouter };

// ── jobs.routes.js ────────────────────────────────────────────
const jobsRouter = Router();
jobsRouter.use(requireAuth);

jobsRouter.get('/', async (req, res, next) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;
    const isSA = req.user.role === 'superadmin';
    const conditions = isSA ? [] : [`j.company_id='${req.user.company_id}'`];
    if (status) conditions.push(`j.status='${status}'`);
    if (type) conditions.push(`j.type='${type}'`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await query(
      `SELECT j.*, u.full_name as user_name, a.name as avatar_name
       FROM jobs j
       LEFT JOIN users u ON u.id=j.user_id
       LEFT JOIN avatars a ON a.id=j.avatar_id
       ${where}
       ORDER BY j.created_at DESC LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    res.json(rows.rows);
  } catch (err) { next(err); }
});

jobsRouter.get('/:id', async (req, res, next) => {
  try {
    const job = await queryOne(
      `SELECT j.*, u.full_name as user_name FROM jobs j LEFT JOIN users u ON u.id=j.user_id WHERE j.id=$1`,
      [req.params.id]
    );
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (req.user.role !== 'superadmin' && job.company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(job);
  } catch (err) { next(err); }
});

jobsRouter.patch('/:id/cancel', async (req, res, next) => {
  try {
    const job = await queryOne(`SELECT * FROM jobs WHERE id=$1`, [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (!['queued', 'processing'].includes(job.status)) {
      return res.status(400).json({ error: 'Job cannot be cancelled.' });
    }
    await query(`UPDATE jobs SET status='cancelled' WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Job cancelled.' });
  } catch (err) { next(err); }
});

export { jobsRouter };

// ── credits.routes.js ─────────────────────────────────────────
const creditsRouter = Router();
creditsRouter.use(requireAuth);

creditsRouter.get('/balance', async (req, res, next) => {
  try {
    const co = await queryOne(`SELECT credit_balance FROM companies WHERE id=$1`, [req.user.company_id]);
    res.json({ balance: co?.credit_balance ?? 0 });
  } catch (err) { next(err); }
});

creditsRouter.get('/transactions', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM credit_transactions WHERE company_id=$1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.company_id]
    );
    res.json(rows.rows);
  } catch (err) { next(err); }
});

// POST /api/credits/allocate — admin allocates credits to company
creditsRouter.post('/allocate', requireAdmin, async (req, res, next) => {
  const { company_id, amount, description } = req.body;
  if (!amount || !company_id) return res.status(422).json({ error: 'company_id and amount required.' });
  if (req.user.role !== 'superadmin' && company_id !== req.user.company_id) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    const co = await queryOne(
      `UPDATE companies SET credit_balance = credit_balance + $1 WHERE id=$2 RETURNING credit_balance`,
      [amount, company_id]
    );
    if (!co) return res.status(404).json({ error: 'Company not found.' });
    await query(
      `INSERT INTO credit_transactions (company_id, user_id, type, amount, balance_after, description)
       VALUES ($1,$2,'allocation',$3,$4,$5)`,
      [company_id, req.user.sub, amount, co.credit_balance, description || 'Admin allocation']
    );
    res.json({ balance: co.credit_balance });
  } catch (err) { next(err); }
});

export { creditsRouter };
