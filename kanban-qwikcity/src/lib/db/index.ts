import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

let sqlite: Database.Database;

try {
  sqlite = new Database('./drizzle/db.sqlite');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('busy_timeout = 5000');
} catch (error) {
  console.error('Failed to initialize database:', error);
  throw new Error('Database connection failed.');
}

export const db: BetterSQLite3Database = drizzle(sqlite);
