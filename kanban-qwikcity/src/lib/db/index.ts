/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';

export function getDatabase(d1Binding: D1Database) {
  return drizzle(d1Binding);
}
