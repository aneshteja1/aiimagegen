# AI Fashion Studio

A multi-tenant AI fashion image & video generation platform.

## 🏗️ Project Structure

```
ai-fashion-studio/
├── frontend/              ← React + Vite app
├── backend/src/           ← Express.js API
│   ├── app.js             ← Shared Express app (no listen)
│   ├── server.js          ← Local/Azure server (with listen)
│   ├── routes/            ← API route handlers
│   ├── services/          ← Auth, Email services
│   ├── middleware/        ← Auth, Security middleware
│   └── db/                ← PostgreSQL connection
├── api/
│   └── index.js           ← Vercel serverless entry point
├── postgres/
│   ├── schema.sql         ← Database schema (run once)
│   └── migrations/        ← Seed data
├── vercel.json            ← Vercel deployment config
├── staticwebapp.config.json ← Azure SPA routing config
└── .github/workflows/     ← Azure auto-deploy pipeline
```

## 🚀 Deployment

### Vercel (Frontend + Backend Serverless)

1. Push repo to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL        = postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres
DATABASE_SSL        = true
JWT_SECRET          = (generate: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
JWT_REFRESH_SECRET  = (generate again - must be different)
JWT_ACCESS_EXPIRES  = 15m
JWT_REFRESH_EXPIRES = 30d
CORS_ORIGINS        = https://your-app.vercel.app
FRONTEND_URL        = https://your-app.vercel.app
NODE_ENV            = production
PLATFORM            = vercel
FACESWAP_UPSTREAM_URL = https://model-osprey-487816-m4.uc.r.appspot.com/api/v1/faceswap
SMTP_HOST           = smtp.mailtrap.io
SMTP_PORT           = 587
SMTP_USER           = your_mailtrap_user
SMTP_PASS           = your_mailtrap_pass
EMAIL_FROM          = noreply@aifashionstudio.com
AI_KEY              = your_google_ai_key
```

4. Vercel auto-deploys on every push to main ✅

### Azure (Static Web Apps + App Service)

See `azure/README.md` for full Azure setup instructions.

## 🗄️ Database Setup (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run `postgres/schema.sql`
4. Optionally run `postgres/migrations/001_seed.sql` for test data

## 💻 Local Development

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Copy and fill environment variables
cp .env.example .env
# Edit .env with your values

# 3. Run backend
npm run dev:backend

# 4. Run frontend (in another terminal)
npm run dev:frontend
```

## 🔄 How Platform Detection Works

```
Push to GitHub
    ↓
Vercel reads vercel.json      → Frontend (static) + Backend (serverless at /api/*)
Azure reads azure-deploy.yml  → Frontend (Static Web Apps) + Backend (App Service)
Both connect to               → Same Supabase PostgreSQL database
```

5. Commit directly to main ✅ 
