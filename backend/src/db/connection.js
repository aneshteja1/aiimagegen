import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => console.error('Unexpected PG pool error:', err));

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function queryOne(text, params = []) {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
}

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
