/// <reference types="@cloudflare/workers-types" />
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ platform }) => {
	const d1 = platform?.env?.DB;

	if (!d1) {
		return json({ error: 'D1 database not available' }, { status: 500 });
	}

	try {
		// Split SQL statements by the statement-breakpoint comment
		const statements = [
			`CREATE TABLE IF NOT EXISTS boards (
				id text PRIMARY KEY NOT NULL,
				title text NOT NULL,
				description text,
				created_at integer NOT NULL
			)`,
			`CREATE TABLE IF NOT EXISTS users (
				id text PRIMARY KEY NOT NULL,
				name text NOT NULL
			)`,
			`CREATE TABLE IF NOT EXISTS lists (
				id text PRIMARY KEY NOT NULL,
				board_id text NOT NULL,
				title text NOT NULL,
				position integer NOT NULL,
				created_at integer NOT NULL,
				FOREIGN KEY (board_id) REFERENCES boards(id) ON UPDATE no action ON DELETE cascade
			)`,
			`CREATE INDEX IF NOT EXISTS lists_board_id_idx ON lists (board_id)`,
			`CREATE INDEX IF NOT EXISTS lists_position_idx ON lists (position)`,
			`CREATE TABLE IF NOT EXISTS tags (
				id text PRIMARY KEY NOT NULL,
				name text NOT NULL,
				color text NOT NULL,
				created_at integer NOT NULL
			)`,
			`CREATE TABLE IF NOT EXISTS cards (
				id text PRIMARY KEY NOT NULL,
				list_id text NOT NULL,
				title text NOT NULL,
				description text,
				assignee_id text,
				position integer NOT NULL,
				completed integer DEFAULT false,
				created_at integer NOT NULL,
				FOREIGN KEY (list_id) REFERENCES lists(id) ON UPDATE no action ON DELETE cascade,
				FOREIGN KEY (assignee_id) REFERENCES users(id) ON UPDATE no action ON DELETE set null
			)`,
			`CREATE INDEX IF NOT EXISTS cards_list_id_idx ON cards (list_id)`,
			`CREATE INDEX IF NOT EXISTS cards_position_idx ON cards (position)`,
			`CREATE INDEX IF NOT EXISTS cards_assignee_id_idx ON cards (assignee_id)`,
			`CREATE TABLE IF NOT EXISTS card_tags (
				card_id text NOT NULL,
				tag_id text NOT NULL,
				PRIMARY KEY(card_id, tag_id),
				FOREIGN KEY (card_id) REFERENCES cards(id) ON UPDATE no action ON DELETE cascade,
				FOREIGN KEY (tag_id) REFERENCES tags(id) ON UPDATE no action ON DELETE cascade
			)`,
			`CREATE INDEX IF NOT EXISTS card_tags_card_id_idx ON card_tags (card_id)`,
			`CREATE INDEX IF NOT EXISTS card_tags_tag_id_idx ON card_tags (tag_id)`,
			`CREATE TABLE IF NOT EXISTS comments (
				id text PRIMARY KEY NOT NULL,
				card_id text NOT NULL,
				user_id text NOT NULL,
				text text NOT NULL,
				created_at integer NOT NULL,
				FOREIGN KEY (card_id) REFERENCES cards(id) ON UPDATE no action ON DELETE cascade,
				FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE set null
			)`,
			`CREATE INDEX IF NOT EXISTS comments_card_id_idx ON comments (card_id)`,
			`CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments (user_id)`,
			`CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments (created_at)`
		];

		// Execute all statements using D1 batch API
		const results = await d1.batch(
			statements.map((sql) => d1.prepare(sql))
		);

		return json({
			success: true,
			message: 'Database schema applied successfully',
			statementsExecuted: statements.length,
			results: results.map((r) => ({
				success: r.success,
				meta: r.meta
			}))
		});
	} catch (error) {
		console.error('Migration error:', error);
		return json(
			{
				error: 'Failed to apply database schema',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
