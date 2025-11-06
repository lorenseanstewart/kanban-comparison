"use server";

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../../drizzle/schema';
import type { RequestEventBase } from '@builder.io/qwik-city';

// Cache database instances per connection string
const dbCache = new Map<string, ReturnType<typeof drizzle<typeof schema>>>();

export function getDatabase(requestEvent: RequestEventBase) {
  // In Edge Runtime, we must use requestEvent.env.get()
  // Fall back to process.env for local development
  const connectionString =
    requestEvent.env.get('POSTGRES_URL') ||
    requestEvent.env.get('DATABASE_URL') ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'Database connection string not found. ' +
      'Please set POSTGRES_URL or DATABASE_URL environment variable.'
    );
  }

  // Check cache first
  if (!dbCache.has(connectionString)) {
    const sql = neon(connectionString);
    dbCache.set(connectionString, drizzle(sql, { schema }));
  }

  return dbCache.get(connectionString)!;
}
