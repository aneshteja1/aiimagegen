import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/** Execute a query. Returns rows. */
export async function query(text, params = []) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development' && duration > 200) {
    console.warn(`[DB SLOW] ${duration}ms — ${text.slice(0, 80)}`);
  }
  return res;
}

/** Get a single row or null. */
export async function queryOne(text, params = []) {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
}

/** Use a transaction. fn receives a {query, queryOne} scoped to the client. */
export async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn({
      query: (text, params) => client.query(text, params),
      queryOne: async (text, params) => {
        const r = await client.query(text, params);
        return r.rows[0] || null;
      },
    });
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export { pool };
