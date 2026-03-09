import app from '../backend/src/app.js';

// Vercel serverless handler
export default async function handler(req, res) {
  // Fix path — Vercel may strip /api prefix
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
