import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  // For local development with better-sqlite3
  dbCredentials: {
    url: './drizzle/db.sqlite',
  },
});
