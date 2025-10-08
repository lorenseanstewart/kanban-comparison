import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../../drizzle/schema';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sqlite = new Database(join(__dirname, '../../../drizzle/db.sqlite'));
export const db = drizzle(sqlite, { schema });
