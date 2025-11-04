/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';

/**
 * Factory function to create a Drizzle database instance from a D1 binding.
 * This pattern is required for Cloudflare D1 deployment.
 *
 * @param d1Binding - The D1Database binding from platform.env.DB
 * @returns Drizzle database instance configured for D1
 */
export function getDatabase(d1Binding: D1Database) {
	return drizzle(d1Binding);
}
