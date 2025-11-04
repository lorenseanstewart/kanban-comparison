/// <reference types="@cloudflare/workers-types" />

/**
 * Get database instance with D1 or better-sqlite3
 *
 * Uses dynamic imports to prevent better-sqlite3 from being bundled in Cloudflare Workers.
 * In production, d1Binding is always provided, so the local code path is never taken.
 *
 * @param d1Binding - Optional D1 database binding from Cloudflare
 * @returns Drizzle database instance
 */
export async function getDatabase(d1Binding?: D1Database) {
  if (d1Binding) {
    // Production: use D1 from Cloudflare
    // Dynamic import prevents bundling of better-sqlite3
    const { getDatabase: getD1Database } = await import('./db.d1.js')
    return getD1Database(d1Binding)
  }

  // Development: use better-sqlite3
  // This code path is never reached in Cloudflare Workers
  const { getDatabase: getLocalDatabase } = await import('./db.local.js')
  return getLocalDatabase()
}
