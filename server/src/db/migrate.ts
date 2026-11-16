import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, checkPostGIS } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Migration] Starting database migration...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query(schemaSql);
    console.log('[Migration] All tables and indexes migrated successfully.');
    const postgisActive = await checkPostGIS();
    console.log(`[Migration] PostGIS status: ${postgisActive ? 'ENABLED' : 'DISABLED (Using mathematical spatial fallback)'}`);
  } catch (err) {
    console.error('[Migration Error]', err);
    throw err;
  } finally {
    client.release();
  }
}

// Allow direct execution
if (process.argv[1] && process.argv[1].includes('migrate')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

