import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as schema from '../../drizzle/schema'

// Singleton for better-sqlite3 in development
let sqliteDb: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * Get better-sqlite3 database instance (local development only)
 */
export function getDatabase() {
  if (!sqliteDb) {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const projectRoot = join(__dirname, '../..')
    const dbPath = join(projectRoot, 'drizzle/db.sqlite')

    const sqlite = new Database(dbPath)

    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('busy_timeout = 5000')

    sqliteDb = drizzle(sqlite, { schema })
  }

  return sqliteDb
}
