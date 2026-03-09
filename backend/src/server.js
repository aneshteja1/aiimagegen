// server.js — used for Azure App Service and local development
// Vercel does NOT use this file — it uses api/index.js instead
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('══════════════════════════════════════════════');
  console.log(`  AI Fashion Studio — Backend`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Platform    : ${process.env.PLATFORM || 'local'}`);
  console.log('══════════════════════════════════════════════');
  console.log('  API: /api/auth | /api/users | /api/generate');
  console.log('══════════════════════════════════════════════');
});

export default app;
