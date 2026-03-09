import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth, requireApproved, requireAdmin } from '../middleware/auth.middleware.js';
import { query, queryOne } from '../db/connection.js';

const router = Router();

const PLANS = {
  basic:      { credits: 100,  priceId: process.env.STRIPE_PRICE_BASIC },
  premium:    { credits: 500,  priceId: process.env.STRIPE_PRICE_PREMIUM },
  enterprise: { credits: 2000, priceId: process.env.STRIPE_PRICE_ENTERPRISE },
};

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe not configured.');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
}

// POST /api/payments/create-checkout
router.post('/create-checkout', requireAuth, requireApproved, async (req, res, next) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan.' });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/billing?success=1`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?cancelled=1`,
      metadata: { company_id: req.user.company_id, plan, credits: PLANS[plan].credits },
    });
    res.json({ url: session.url });
  } catch (err) { next(err); }
});

// POST /api/payments/webhook — Stripe calls this
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send('Webhook signature invalid.');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { company_id, plan, credits } = session.metadata;
    const creditAmount = parseInt(credits, 10);
    try {
      const co = await queryOne(
        `UPDATE companies SET credit_balance=credit_balance+$1, subscription_plan=$2 WHERE id=$3 RETURNING credit_balance`,
        [creditAmount, plan, company_id]
      );
      await query(
        `INSERT INTO credit_transactions (company_id, type, amount, balance_after, description)
         VALUES ($1,'purchase',$2,$3,$4)`,
        [company_id, creditAmount, co.credit_balance, `${plan} plan purchase`]
      );
    } catch (err) {
      console.error('Webhook DB error:', err);
    }
  }
  res.json({ received: true });
});

// GET /api/payments/subscription
router.get('/subscription', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const co = await queryOne(
      `SELECT subscription_plan, subscription_status, credit_balance FROM companies WHERE id=$1`,
      [req.user.company_id]
    );
    res.json(co || {});
  } catch (err) { next(err); }
});

// Need to import express for the webhook raw body parser
import express from 'express';

export default router;
