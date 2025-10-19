import { form, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { BoardSchema } from '$lib/validation';
import { db } from '$lib/db';
import { boards, lists } from '$lib/db/schema';
import { getBoards as getBoardsFromServer } from '$lib/server/boards';

export const getBoards = query(async () => {
	return await getBoardsFromServer();
});

export const addBoard = form(BoardSchema, async ({ title, description = null }) => {
	try {
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
	} catch (e) {
		console.error('Failed to create board:', e);
		return error(500, 'Failed to create board. Please try again.');
	}
});
