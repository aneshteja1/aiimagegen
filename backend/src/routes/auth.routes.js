import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { query, transaction } from '../db/connection.js';

const router = Router();

// ── 1. BULK UPLOAD & JOB CREATION ────────────────────────────
// Clients upload 100-1000 images in a ZIP [cite: 23]
router.post('/bulk-generate', requireAuth, async (req, res, next) => {
  const { type, prompt, fileUrls } = req.body;
  const { company_id, id: user_id } = req.user;

  try {
    // The Postgres trigger automatically deducts credits and logs the transaction!
    const result = await query(
      `INSERT INTO jobs (company_id, user_id, type, status, input_files, prompt)
       VALUES ($1, $2, $3, 'queued', $4, $5) RETURNING *`,
      [company_id, user_id, type, fileUrls, prompt]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.message.includes('Insufficient credits')) {
      return res.status(402).json({ error: 'Please purchase more credits to process this batch.' });
    }
    next(err);
  }
});

// ── 2. LIVE DATA FETCHING (Tenant Isolated) ──────────────────
router.get('/live-status', requireAuth, async (req, res, next) => {
  const { company_id, role } = req.user;
  try {
    let sql = `SELECT * FROM jobs `;
    let params = [];

    // Security: Superadmins see all, clients only see their own workspace 
    if (role !== 'superadmin') {
      sql += `WHERE company_id = $1 ORDER BY created_at DESC LIMIT 50`;
      params.push(company_id);
    } else {
      sql += `ORDER BY created_at DESC LIMIT 100`;
    }

    const jobs = await query(sql, params);
    
    // Get real-time credit balance
    const company = await query(`SELECT credit_balance FROM companies WHERE id = $1`, [company_id]);

    res.json({ jobs: jobs.rows, credits: company.rows[0]?.credit_balance });
  } catch (err) {
    next(err);
  }
});

// ── 3. VENKAT TECH WORKFLOW APPROVAL ─────────────────────────
// AI Generate -> Venkat Tech Retouch -> Client Approval 
router.post('/:id/approve', requireAuth, async (req, res, next) => {
  const { id } = req.params;
  const { role, company_id } = req.user;
  const { action } = req.body; // 'retouch_complete' or 'client_approve'

  try {
    let newStatus = '';
    
    if (action === 'retouch_complete' && role === 'superadmin') {
      newStatus = 'pending_approval'; // Sent to client
    } else if (action === 'client_approve') {
      newStatus = 'completed'; // Final delivery [cite: 51]
    } else {
      return res.status(403).json({ error: 'Unauthorized workflow action.' });
    }

    const result = await query(
      `UPDATE jobs SET status = $1 WHERE id = $2 AND (company_id = $3 OR $4 = 'superadmin') RETURNING *`,
      [newStatus, id, company_id, role]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── 4. GDPR COMPLIANCE & SECURITY ────────────────────────────
// Allows clients to delete their data 
router.delete('/gdpr/delete-data', requireAuth, async (req, res, next) => {
  const { company_id } = req.user;
  try {
    // Cascading delete will remove jobs, avatars, and transactions
    await query(`DELETE FROM companies WHERE id = $1`, [company_id]);
    res.json({ message: 'All company data has been securely deleted in compliance with GDPR.' });
  } catch (err) {
    next(err);
  }
});

export default router;
