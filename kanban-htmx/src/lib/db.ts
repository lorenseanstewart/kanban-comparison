/// <reference types="@cloudflare/workers-types" />
import Database from 'better-sqlite3';
import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from "../../drizzle/schema";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Singleton for better-sqlite3 in development
let sqliteDb: ReturnType<typeof drizzleBetterSqlite<typeof schema>> | null = null;

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

  // Development: use better-sqlite3
  if (!sqliteDb) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = join(__dirname, '../..');
    const dbPath = join(projectRoot, 'drizzle/db.sqlite');

    const sqlite = new Database(dbPath);

    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('busy_timeout = 5000');

    sqliteDb = drizzleBetterSqlite(sqlite, { schema });
  }

  return sqliteDb;
}
