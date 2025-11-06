import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../drizzle/schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDatabase() {
  if (!db) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    const pool = new Pool({
      connectionString,
      max: process.env.NODE_ENV === 'production' ? 1 : 10,
    });

    db = drizzle(pool, { schema });
  }

  return db;
}
