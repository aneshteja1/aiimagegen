import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import jobsRoutes from './routes/jobs.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// ── CORS CONFIGURATION ──────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  'https://aiimagegen-three.vercel.app' // Your live Vercel URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server or Postman)
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// ── ROUTES ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);

// ── VERCEL SERVERLESS FIX ───────────────────────────────────────
// Only spin up a local server port if we are NOT in Vercel's production environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Export the Express app so Vercel can convert it into Serverless Functions
export default app;
