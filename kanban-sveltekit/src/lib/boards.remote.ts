/// <reference types="@cloudflare/workers-types" />
import { form, query, getRequestEvent } from '$app/server';
import { BoardSchema } from '$lib/validation';
import { getDatabase } from '$lib/db';
import { boards, lists } from '$lib/db/schema';
import { getBoards as getBoardsFromServer } from '$lib/server/boards';

export const getBoards = query(async () => {
	const event = getRequestEvent();
	const d1 = event.platform?.env?.DB as D1Database;
	return await getBoardsFromServer(d1);
});

export const addBoard = form(
	BoardSchema,
	async ({ title, description = null }, invalid) => {
		try {
			const event = getRequestEvent();
			const d1 = event.platform?.env?.DB as D1Database;
			const db = getDatabase(d1);
			const boardId = crypto.randomUUID();

			await db.insert(boards).values({
				id: boardId,
				title,
				description,
			});

			// Create the four default lists for the board
			const listTitles = ['Todo', 'In-Progress', 'QA', 'Done'];
			await db.insert(lists).values(
				listTitles.map((listTitle, index) => ({
					id: crypto.randomUUID(),
					boardId,
					title: listTitle,
					position: index + 1,
				})),
			);

			return {
				success: true,
				boardId,
				title,
				description,
			};
		} catch (error) {
			console.error('Failed to create board:', error);
			return invalid('Failed to create board. Please try again.');
		}
	},
);
