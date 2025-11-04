/// <reference types="@cloudflare/workers-types" />

import { drizzle } from 'drizzle-orm/d1';

/**
 * Get database instance from D1 binding
 */
export function getDatabase(d1Binding: D1Database) {
	return drizzle(d1Binding);
}

/**
 * Default export for use in Server Functions
 * Requires D1 binding from environment (process.env.DB)
 *
 * This uses a Proxy pattern to lazily access the D1 binding,
 * allowing the database to be imported at the module level while
 * still accessing the runtime environment binding.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, prop) {
		// @ts-ignore - Cloudflare Workers provides DB binding via process.env
		const d1 = process.env.DB as D1Database | undefined;

		if (!d1) {
			throw new Error(
				'D1 binding not found. ' +
					'Local dev: Use `npm run dev` which runs wrangler with --d1 flag. ' +
					'Production: Ensure DB is bound in Cloudflare Pages/Workers settings.'
			);
		}

		const instance = getDatabase(d1);
		return (instance as any)[prop];
	}
});
