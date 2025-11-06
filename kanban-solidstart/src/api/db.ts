"use server";

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../drizzle/schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get database instance (singleton pattern for connection pooling)
 */
export function getDatabase() {
  if (!db) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'Database connection string not found. ' +
        'Please set POSTGRES_URL or DATABASE_URL environment variable.'
      );
    }

    const pool = new Pool({
      connectionString,
      max: process.env.NODE_ENV === 'production' ? 1 : 10,
      ssl: {
        rejectUnauthorized: false
      }
    });

    db = drizzle(pool, { schema });
  }

  return db;
}
