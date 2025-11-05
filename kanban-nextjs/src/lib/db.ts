import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@/drizzle/schema";

/**
 * Database connection using Neon + node-postgres
 *
 * Follows Neon's recommended pattern:
 * - Pool is created at module load but doesn't connect immediately
 * - Actual connections are created on first query (at runtime)
 * - Single instance in production, cached in development (prevents hot reload issues)
 *
 * This allows builds to succeed even without env vars - connections happen at runtime.
 */

declare global {
  // eslint-disable-next-line no-var
  var db: ReturnType<typeof drizzle> | undefined;
}

// Get connection string - will be undefined during build, defined at runtime
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle>;

if (process.env.NODE_ENV === 'production') {
  // In production, connection string MUST be available at runtime
  // It's okay if it's undefined during build (Next.js won't execute this during build)
  const pool = new Pool({
    connectionString,
    max: 1, // Serverless: single connection per function instance
  });

  db = drizzle(pool, { schema });
} else {
  // Development: reuse connection across hot reloads
  if (!global.db) {
    const pool = new Pool({
      connectionString,
      max: 10, // Local dev: can handle more connections
    });

    global.db = drizzle(pool, { schema });
  }

  db = global.db;
}

export { db };
