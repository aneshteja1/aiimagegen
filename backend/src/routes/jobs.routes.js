import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { query } from '../db/connection.js';

const router = Router();

// Queue a new generation (Credits deducted automatically by Postgres trigger)
router.post('/generate', requireAuth, async (req, res) => {
  const { type, fileUrls } = req.body; // type must be: swap_model, try_on, image_gen, or video
  const { company_id, id: user_id } = req.user;

  try {
    const result = await query(
      `INSERT INTO jobs (company_id, user_id, type, status, workflow_stage, input_files)
       VALUES ($1, $2, $3, 'queued', 'upload', $4) RETURNING *`,
      [company_id, user_id, type, fileUrls]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.message.includes('Insufficient credits')) {
      return res.status(402).json({ error: 'Not enough credits.' });
    }
    res.status(500).json({ error: 'Failed to queue generation.' });
  }
});

// Fetch isolated jobs for the dashboard
router.get('/live-status', requireAuth, async (req, res) => {
  const { company_id, role } = req.user;
  try {
    let sql = `SELECT * FROM jobs `;
    let params = [];

    if (role !== 'superadmin') {
      sql += `WHERE company_id = $1 ORDER BY created_at DESC LIMIT 50`;
      params.push(company_id);
    } else {
      sql += `ORDER BY created_at DESC LIMIT 100`;
    }

    const jobs = await query(sql, params);
    const company = await query(`SELECT credit_balance FROM companies WHERE id = $1`, [company_id]);

    res.json({ jobs: jobs.rows, credits: company.rows[0]?.credit_balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status.' });
  }
});

export default router;
