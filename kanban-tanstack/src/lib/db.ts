import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "../../drizzle/schema";

/**
 * Database connection using Neon HTTP
 *
 * Uses Neon's HTTP driver for serverless edge runtime compatibility.
 * - Works in both Vercel Edge Runtime and Node.js runtime
 * - No persistent connections (HTTP-based)
 * - Connection string loaded from env vars at runtime
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
  // In production, use HTTP driver for edge compatibility
  const sql = neon(connectionString!);
  db = drizzle(sql, { schema });
} else {
  // Development: reuse connection across hot reloads
  if (!global.db) {
    const sql = neon(connectionString!);
    global.db = drizzle(sql, { schema });
  }

  db = global.db;
}

export { db };
