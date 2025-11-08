/// <reference types="@cloudflare/workers-types" />

import { drizzle } from 'drizzle-orm/d1';

/**
 * Get database instance with D1 or better-sqlite3
 *
 * Uses dynamic imports to prevent better-sqlite3 from being bundled in Cloudflare Workers.
 * In production, d1Binding is always provided, so the local code path is never taken.
 *
 * @param d1Binding - Optional D1 database binding from Cloudflare
 * @returns Drizzle database instance
 */
export async function getDatabase(d1Binding?: D1Database) {
  if (d1Binding) {
    // Production: use D1 from Cloudflare
    // Dynamic import prevents bundling of better-sqlite3
    const { getDatabase: getD1Database } = await import('./db.d1.js')
    return getD1Database(d1Binding)
  }

  // Development: use better-sqlite3
  // This code path is never reached in Cloudflare Workers
  const { getDatabase: getLocalDatabase } = await import('./db.local.js')
  return getLocalDatabase()
}

// Import local database for development
import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Create local database instance
let localDb: ReturnType<typeof drizzleBetterSqlite> | null = null;

try {
  const sqlite = new Database('./drizzle/db.sqlite');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('busy_timeout = 5000');
  localDb = drizzleBetterSqlite(sqlite);
} catch (error) {
  // If better-sqlite3 fails, we'll rely on D1 binding
  console.warn('Local database not available, will use D1 binding');
}

/**
 * Default export for use in Server Functions
 * Requires D1 binding from environment (process.env.DB) or falls back to local DB
 *
 * This uses a Proxy pattern to lazily access the D1 binding or local database,
 * allowing the database to be imported at the module level while
 * still accessing the runtime environment binding.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    // @ts-ignore - Cloudflare Workers provides DB binding via process.env
    const d1 = process.env.DB as D1Database | undefined;

    if (d1) {
      // Cloudflare production: use D1
      const instance = drizzle(d1);
      return (instance as any)[prop];
    }

    // Local development: use pre-initialized better-sqlite3
    if (localDb) {
      return (localDb as any)[prop];
    }

    throw new Error(
      'D1 binding not found and local database unavailable. ' +
        'Cloudflare: Ensure DB is bound in Pages/Workers settings. ' +
        'Local dev: Ensure ./drizzle/db.sqlite exists.'
    );
  }
});
