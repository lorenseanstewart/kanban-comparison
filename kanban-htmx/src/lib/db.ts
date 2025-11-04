/// <reference types="@cloudflare/workers-types" />
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from "../../drizzle/schema";

// Singleton for better-sqlite3 in development
let sqliteDb: any = null;

/**
 * Get database instance with D1 or better-sqlite3
 *
 * @param d1Binding - Optional D1 database binding from Cloudflare
 * @returns Drizzle database instance
 */
export function getDatabase(d1Binding?: D1Database) {
  // Production: use D1 from Cloudflare
  if (d1Binding) {
    return drizzleD1(d1Binding, { schema });
  }

  // Development: use better-sqlite3 (loaded dynamically to avoid bundling for Cloudflare)
  if (!sqliteDb) {
    // Dynamic imports to prevent bundling in Cloudflare build
    const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
    const Database = require('better-sqlite3');

    const sqlite = new Database('./drizzle/db.sqlite');

    // Enable WAL mode for better concurrent access
    sqlite.pragma('journal_mode = WAL');

    // Set busy timeout to handle locked database gracefully
    sqlite.pragma('busy_timeout = 5000');

    sqliteDb = drizzleSqlite(sqlite, { schema });

    // Graceful shutdown handler
    if (typeof process !== 'undefined') {
      process.on('SIGINT', () => {
        sqlite.close();
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        sqlite.close();
        process.exit(0);
      });
    }
  }

  return sqliteDb;
}

// Legacy export for backwards compatibility with existing code
export const db = getDatabase();
