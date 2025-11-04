/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../../drizzle/schema'

/**
 * Get D1 database instance (Cloudflare only)
 */
export function getDatabase(d1Binding: D1Database) {
  return drizzle(d1Binding, { schema })
}
