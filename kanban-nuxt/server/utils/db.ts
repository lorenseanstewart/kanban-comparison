import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as schema from '../../drizzle/schema'

// Get the project root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '../..')

// Use absolute path to database so it works in both dev and production
const dbPath = join(projectRoot, 'drizzle/db.sqlite')

const sqlite = new Database(dbPath)

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('busy_timeout = 5000')

export const db = drizzle(sqlite, { schema })
