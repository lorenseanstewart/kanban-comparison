/// <reference types="@cloudflare/workers-types" />

import { drizzle } from 'drizzle-orm/d1';

/**
 * Factory function to create a Drizzle database instance from a D1 binding.
 * This is the only export - no proxy singleton pattern.
 *
 * @param d1Binding - The D1Database binding from Cloudflare
 * @returns Drizzle database instance
 */
export function getDatabase(d1Binding: D1Database) {
  return drizzle(d1Binding);
}

/**
 * Helper to get D1 binding from process.env.
 * SolidStart with nodejs_compat flag provides DB via process.env.
 *
 * @throws Error if D1 binding is not found
 * @returns D1Database binding
 */
export function getD1Binding(): D1Database {
  // @ts-ignore - Cloudflare Pages provides DB binding via process.env
  const d1 = process.env.DB as D1Database | undefined;

  if (!d1) {
    throw new Error(
      'D1 binding not found. ' +
      'Local dev: Use `npm run dev` which runs wrangler with --d1 flag. ' +
      'Production: Ensure DB is bound in Cloudflare Pages settings.'
    );
  }

  return d1;
}
