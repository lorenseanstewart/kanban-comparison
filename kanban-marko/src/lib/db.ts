import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from "better-sqlite3";

let sqlite: Database.Database | undefined;
let _db: BetterSQLite3Database | undefined;

function initializeDatabase() {
  if (!sqlite) {
    try {
      sqlite = new Database('./drizzle/db.sqlite');

      // Enable WAL mode for better concurrent access
      sqlite.pragma('journal_mode = WAL');

      // Set busy timeout to handle locked database gracefully
      sqlite.pragma('busy_timeout = 5000');
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw new Error("Database connection failed. Please ensure the database file exists and is accessible.");
    }
  }

  if (!_db) {
    _db = drizzle(sqlite);
  }

  return _db;
}

export const db: BetterSQLite3Database = new Proxy({} as BetterSQLite3Database, {
  get(target, prop) {
    const dbInstance = initializeDatabase();
    return (dbInstance as any)[prop];
  }
});

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    if (sqlite) {
      sqlite.close();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    if (sqlite) {
      sqlite.close();
    }
    process.exit(0);
  });
}
