import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from "better-sqlite3";

const sqlite = new Database('./drizzle/db.sqlite');

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');

// Set busy timeout to handle locked database gracefully
sqlite.pragma('busy_timeout = 5000');

export const db: BetterSQLite3Database = drizzle(sqlite);

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
