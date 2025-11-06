import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../../drizzle/schema'

// Singleton for better-sqlite3 in development
let sqliteDb: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * Get better-sqlite3 database instance (local development only)
 */
export function getDatabase() {
  if (!sqliteDb) {
    // Use environment variable for database path, default to local path
    const dbPath = process.env.DB_PATH || './drizzle/db.sqlite'
    const sqlite = new Database(dbPath)

    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('busy_timeout = 5000')

    sqliteDb = drizzle(sqlite, { schema })

    // Graceful shutdown handler
    if (typeof process !== 'undefined') {
      process.on('SIGINT', () => {
        sqlite.close()
        process.exit(0)
      })

      process.on('SIGTERM', () => {
        sqlite.close()
        process.exit(0)
      })
    }
  }

  return sqliteDb
}
