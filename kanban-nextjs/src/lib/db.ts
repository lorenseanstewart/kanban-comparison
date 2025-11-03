/// <reference types="@cloudflare/workers-types" />

import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleBetterSQLite, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from "better-sqlite3";

type DrizzleDB = BetterSQLite3Database | ReturnType<typeof drizzleD1>;

let dbInstance: DrizzleDB | null = null;
let sqlite: Database.Database | null = null;

// Environment detection
const isCloudflare = typeof process !== 'undefined' && process.env.CF_PAGES === '1';
const isBuildTime = typeof process !== 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';

/**
 * Initialize database connection
 * - Local development: Uses better-sqlite3
 * - Cloudflare Pages: Uses D1 binding passed from request context
 * - Build time: Skips initialization
 */
function initializeLocalDatabase(): DrizzleDB | null {
  if (isBuildTime) {
    console.log('[DB] Skipping database initialization during build');
    return null;
  }

  if (isCloudflare) {
    console.log('[DB] Running on Cloudflare Pages - D1 will be bound from request context');
    return null; // D1 binding is provided per-request
  }

  // Local development: use better-sqlite3
  try {
    sqlite = new Database('./drizzle/db.sqlite');

    // Enable WAL mode for better concurrent access
    sqlite.pragma('journal_mode = WAL');

    // Set busy timeout to handle locked database gracefully
    sqlite.pragma('busy_timeout = 5000');

    const db = drizzleBetterSQLite(sqlite);
    console.log('[DB] Local SQLite database initialized');
    return db;
  } catch (error) {
    console.error('[DB] Failed to initialize local database:', error);
    return null;
  }
}

// Initialize database for local development
if (!isCloudflare && !isBuildTime) {
  dbInstance = initializeLocalDatabase();
}

/**
 * Get database instance
 * - For Cloudflare: Returns D1 binding from request context
 * - For local: Returns better-sqlite3 instance
 */
export function getDatabase(d1Binding?: D1Database): DrizzleDB {
  // Cloudflare Pages: use D1 binding from request context
  if (d1Binding) {
    return drizzleD1(d1Binding);
  }

  // Local development: use cached better-sqlite3 instance
  if (dbInstance) {
    return dbInstance;
  }

  throw new Error(
    isBuildTime
      ? 'Database is disabled during build time'
      : isCloudflare
      ? 'D1 binding not provided. Pass D1Database binding to getDatabase()'
      : 'Database initialization failed'
  );
}

/**
 * Default export for use in Server Components and API routes
 * On Cloudflare, you must use getDatabase(env.DB) instead
 */
export const db = new Proxy({} as DrizzleDB, {
  get(_target, prop) {
    const instance = dbInstance || getDatabase();
    if (!instance) {
      throw new Error('Database not available');
    }
    return (instance as any)[prop];
  }
});

// Graceful shutdown handler for local development
if (typeof process !== 'undefined' && sqlite) {
  process.on('SIGINT', () => {
    if (sqlite) {
      sqlite.close();
      console.log('[DB] Database connection closed');
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    if (sqlite) {
      sqlite.close();
      console.log('[DB] Database connection closed');
    }
    process.exit(0);
  });
}
