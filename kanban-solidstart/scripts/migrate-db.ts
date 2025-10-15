import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database('./drizzle/db.sqlite');
const db = drizzle(sqlite);

console.log('Running migrations...');

migrate(db, { migrationsFolder: './drizzle/migrations' });

console.log('Migrations complete');

// Close the database connection
sqlite.close();

console.log('Database connection closed');
