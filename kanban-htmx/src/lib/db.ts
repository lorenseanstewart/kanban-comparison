/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';
import * as schema from "../../drizzle/schema";

/**
 * Get database instance from D1 binding
 *
 * @param d1Binding - D1 database binding from Cloudflare
 * @returns Drizzle database instance
 */
export function getDatabase(d1Binding: D1Database) {
  return drizzle(d1Binding, { schema });
}
