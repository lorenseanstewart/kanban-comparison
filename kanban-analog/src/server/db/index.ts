/// <reference types="@cloudflare/workers-types" />
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../../../drizzle/schema';

// Singleton for better-sqlite3 in development
let sqliteDb: ReturnType<typeof drizzleSqlite<typeof schema>> | null = null;

export function getDatabase(d1Binding?: D1Database) {
  // Production: use D1
  if (d1Binding) {
    return drizzleD1(d1Binding, { schema });
  }

  // Development: use better-sqlite3
  if (!sqliteDb) {
    // Use relative path from project root (process.cwd())
    const sqlite = new Database('./local.db');
    sqliteDb = drizzleSqlite(sqlite, { schema });
  }

  return sqliteDb;
}
