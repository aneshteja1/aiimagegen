// generate.routes.js — wraps AI services with auth + credit deduction
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import { requireAuth, requireApproved } from '../middleware/auth.middleware.js';
import { aiLimiter } from '../middleware/security.middleware.js';
import { query, queryOne, transaction } from '../db/connection.js';

const router = Router();
router.use(requireAuth, requireApproved, aiLimiter);

const CREDIT_COSTS = { 'swap-model': 1, image: 1, video: 5, bulk: 1 };

/** Deduct credits and create a job atomically */
async function createJobWithCredits(companyId, userId, type, creditsNeeded, metadata = {}) {
  return transaction(async ({ query: q, queryOne: qOne }) => {
    const co = await qOne(
      `SELECT credit_balance FROM companies WHERE id=$1 FOR UPDATE`,
      [companyId]
    );
    if (!co) throw Object.assign(new Error('Company not found.'), { status: 404 });
    if (co.credit_balance < creditsNeeded) {
      throw Object.assign(new Error(`Insufficient credits. Need ${creditsNeeded}, have ${co.credit_balance}.`), { status: 402 });
    }
    const newBalance = co.credit_balance - creditsNeeded;
    await q(`UPDATE companies SET credit_balance=$1 WHERE id=$2`, [newBalance, companyId]);
    const jobRes = await q(
      `INSERT INTO jobs (company_id, user_id, type, status, credits_used, metadata)
       VALUES ($1,$2,$3,'processing',$4,$5) RETURNING id`,
      [companyId, userId, type, creditsNeeded, JSON.stringify(metadata)]
    );
    const jobId = jobRes.rows[0].id;
    await q(
      `INSERT INTO credit_transactions (company_id, user_id, job_id, type, amount, balance_after, description)
       VALUES ($1,$2,$3,'usage',$4,$5,$6)`,
      [companyId, userId, jobId, -creditsNeeded, newBalance, `${type} job`]
    );
    return { jobId, newBalance };
  });
}

// ── POST /api/generate/image ──────────────────────────────────
router.post('/image', async (req, res, next) => {
  const { prompt, identity, characterName, dressImage, gender, country, skinTone, additionalPrompt } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    const { jobId, newBalance } = await createJobWithCredits(
      req.user.company_id, req.user.sub, 'image_gen', 1, { prompt }
    );

    const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let enhancedPrompt = prompt;
    if (gender) enhancedPrompt += ` [Gender: ${gender}]`;
    if (country) enhancedPrompt += ` [Country: ${country}]`;
    if (skinTone) enhancedPrompt += ` [Skin Tone: ${skinTone}]`;
    if (identity && identity !== 'default') enhancedPrompt += ` [Style: ${identity}]`;
    if (characterName) enhancedPrompt += ` [Character: ${characterName}]`;
    if (additionalPrompt?.trim()) enhancedPrompt += ` [Additional: ${additionalPrompt}]`;

    const contentArray = [];
    if (dressImage) {
      contentArray.push({ inlineData: { mimeType: 'image/jpeg', data: dressImage.replace(/^data:image\/[a-z]+;base64,/, '') } });
    }
    contentArray.push({ text: `Generate a detailed image description for fashion AI: ${enhancedPrompt}. Provide: 1) Visual description of person wearing outfit, 2) Color palette, 3) Hair/makeup, 4) Technical specs.` });

    const response = await model.generateContent(contentArray);
    const description = response.response.text();

    await query(`UPDATE jobs SET status='completed', progress=100, completed_at=NOW() WHERE id=$1`, [jobId]);

    res.json({ success: true, jobId, description, creditsRemaining: newBalance, timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
});

// ── POST /api/generate/video ──────────────────────────────────
router.post('/video', async (req, res, next) => {
  const { prompt, characterName, origin, duration = 15 } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    const { jobId, newBalance } = await createJobWithCredits(
      req.user.company_id, req.user.sub, 'video_gen', 5, { prompt }
    );

    const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let enhancedPrompt = prompt;
    if (characterName) enhancedPrompt += ` [Character: ${characterName}]`;
    if (origin) enhancedPrompt += ` [Origin: ${origin}]`;

    const response = await model.generateContent([{
      text: `Create a detailed video storyboard for a ${duration}-second fashion video: ${enhancedPrompt}. Include: 1) Title 2) Concept 3) Scene breakdown 4) Visual style 5) Technical specs 6) Music suggestions.`
    }]);
    const storyboard = response.response.text();
    await query(`UPDATE jobs SET status='completed', progress=100, completed_at=NOW() WHERE id=$1`, [jobId]);

    res.json({ success: true, jobId, storyboard, creditsRemaining: newBalance, timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
});

// ── POST /api/generate/swap-model ────────────────────────────
router.post('/swap-model', async (req, res, next) => {
  const { inputImages, referenceImages, prompt, contents } = req.body;
  if (!contents?.length && (!inputImages?.length || !referenceImages?.length)) {
    return res.status(400).json({ error: 'Images required.' });
  }

  try {
    const { jobId, newBalance } = await createJobWithCredits(
      req.user.company_id, req.user.sub, 'swap_model', 1
    );

    const projectId = process.env.VERTEX_AI_PROJECT_ID;
    if (!projectId) throw Object.assign(new Error('Vertex AI not configured.'), { status: 503 });

    const vertexAI = new VertexAI({ project: projectId, location: process.env.VERTEX_AI_LOCATION || 'us-central1' });
    const model = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const requestContents = contents || [{
      role: 'user',
      parts: [
        { text: prompt || 'Perform a professional face swap: apply the reference identity to the target image poses and clothing.' },
        ...referenceImages.map(d => ({ inlineData: { mimeType: 'image/jpeg', data: d.replace(/^data:image\/[a-z]+;base64,/, '') } })),
        ...inputImages.map(d => ({ inlineData: { mimeType: 'image/jpeg', data: d.replace(/^data:image\/[a-z]+;base64,/, '') } })),
      ],
    }];

    const response = await model.generateContent({ contents: requestContents });
    const resultText = response?.response?.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || '';

    await query(`UPDATE jobs SET status='completed', progress=100, completed_at=NOW() WHERE id=$1`, [jobId]);

    res.json({ success: true, jobId, analysisResponse: resultText, creditsRemaining: newBalance, timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
});

// ── POST /api/generate/bulk ───────────────────────────────────
router.post('/bulk', async (req, res, next) => {
  const { imageCount = 1 } = req.body;
  const credits = Math.max(1, parseInt(imageCount));

  try {
    const { jobId, newBalance } = await createJobWithCredits(
      req.user.company_id, req.user.sub, 'bulk', credits, { imageCount: credits }
    );
    // In production: push to queue (e.g. Bull/BullMQ or Azure Service Bus)
    await query(`UPDATE jobs SET status='queued' WHERE id=$1`, [jobId]);
    res.json({ success: true, jobId, creditsUsed: credits, creditsRemaining: newBalance, message: 'Bulk job queued.' });
  } catch (err) { next(err); }
});

export default router;
