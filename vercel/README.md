# Vercel Deployment

## Activation
This folder activates when you deploy to **Vercel**.

## Steps

1. Install Vercel CLI: `npm i -g vercel`
2. From project root: `vercel --cwd . --prod`
3. Set environment variables in Vercel Dashboard → Project → Settings → Environment Variables:

### Required Variables (Vercel Dashboard)
```
AI_KEY                        = your Google AI key
VERTEX_AI_PROJECT_ID          = your GCP project ID
VERTEX_AI_LOCATION            = us-central1
VERTEX_AI_CREDENTIALS_BASE64  = base64-encoded service account JSON
DATABASE_URL                  = your PostgreSQL connection string (Supabase/Neon)
JWT_SECRET                    = long random secret (64+ chars)
JWT_REFRESH_SECRET             = different long random secret
SMTP_HOST                     = your SMTP host
SMTP_PORT                     = 587
SMTP_USER                     = your SMTP user
SMTP_PASS                     = your SMTP password
EMAIL_FROM                    = noreply@yourdomain.com
STRIPE_SECRET_KEY             = sk_live_...
STRIPE_WEBHOOK_SECRET         = whsec_...
FRONTEND_URL                  = https://yourdomain.vercel.app
CORS_ORIGINS                  = https://yourdomain.vercel.app
```

## Architecture on Vercel
- **Frontend**: Static build from `frontend/dist/`
- **Backend**: Serverless functions in `vercel/api/` (Vercel Edge Network)
- **Database**: Use Supabase (free tier) or Neon PostgreSQL

## How API Routing Works
Vercel automatically maps:
- `/api/generateImage` → `vercel/api/generateImage.js`
- `/api/swap-face`    → `vercel/api/swap-face.js`
- `/api/virtual-reshoot` → `vercel/api/virtual-reshoot.js`
- All other routes   → `frontend/dist/index.html`

## Webhook Setup (Stripe)
After deploy, set webhook in Stripe Dashboard:
- URL: `https://yourdomain.vercel.app/api/payments/webhook`
- Events: `checkout.session.completed`
