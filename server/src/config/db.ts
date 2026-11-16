import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.db.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle database client', err);
});

export let hasPostGIS = false;

export async function checkPostGIS(): Promise<boolean> {
  try {
    const res = await pool.query("SELECT 1 FROM pg_extension WHERE extname = 'postgis'");
    hasPostGIS = (res.rowCount ?? 0) > 0;
    return hasPostGIS;
  } catch {
    hasPostGIS = false;
    return false;
  }
}

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (config.env === 'development' && duration > 100) {
      console.log(`[DB Slow Query] ${duration}ms: ${text.substring(0, 80)}...`);
    }
    return res;
  } catch (err: any) {
    console.error(`[DB Query Error]`, { text: text.substring(0, 100), error: err.message });
    throw err;
  }
}

export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

