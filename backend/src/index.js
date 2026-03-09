import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

// VERCEL FIX: Only listen on a port if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Export the Express app so Vercel can run it
export default app;
