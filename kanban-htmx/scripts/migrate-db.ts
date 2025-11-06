import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

console.log('Running migrations...');

await migrate(db, { migrationsFolder: './drizzle/migrations' });

console.log('Migrations complete');

await pool.end();

console.log('Database connection closed');
