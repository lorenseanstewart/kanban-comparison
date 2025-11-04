/// <reference types="@cloudflare/workers-types" />
import Database from 'better-sqlite3'
import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as schema from '../../drizzle/schema'

// Singleton for better-sqlite3 in development
let sqliteDb: ReturnType<typeof drizzleBetterSqlite<typeof schema>> | null = null

export function useDatabase() {
  const event = useEvent()

  // Production: use D1 from Cloudflare
  if (event.context.cloudflare?.env?.DB) {
    const d1 = event.context.cloudflare.env.DB as D1Database
    return drizzleD1(d1, { schema })
  }

  // Development: use better-sqlite3
  if (!sqliteDb) {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const projectRoot = join(__dirname, '../..')
    const dbPath = join(projectRoot, 'drizzle/db.sqlite')

    const sqlite = new Database(dbPath)

    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('busy_timeout = 5000')

    sqliteDb = drizzleBetterSqlite(sqlite, { schema })
  }

  return sqliteDb
}

// Legacy export for backwards compatibility with existing code
export const db = (() => {
  try {
    // Try to get from event context if available
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const projectRoot = join(__dirname, '../..')
    const dbPath = join(projectRoot, 'drizzle/db.sqlite')

    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('busy_timeout = 5000')

    return drizzleBetterSqlite(sqlite, { schema })
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
})()
