import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

// VERCEL COMPATIBILITY: 
// We export the 'app' so the vercel.json destination can find it.
// We only call app.listen if we are running on your local laptop.

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
}

export default app;
