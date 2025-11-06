import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDatabase } from '$lib/db';

export const POST: RequestHandler = async () => {
	try {
		const db = getDatabase();

		migrate(db, { migrationsFolder: 'drizzle/migrations' });

		return json({
			success: true,
			message: 'Database migrations applied successfully'
		});
	} catch (error) {
		console.error('Migration error:', error);
		return json(
			{
				error: 'Failed to apply database migrations',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
