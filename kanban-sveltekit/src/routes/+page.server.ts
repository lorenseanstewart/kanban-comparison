import { getBoards } from '$lib/server/boards';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { boards, lists } from '$lib/db/schema';
import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import { BoardSchema } from '$lib/validation';

export const load: PageServerLoad = async ({ depends }) => {
	depends('app:boards');

	const boardsList = await getBoards();
	return {
		boards: boardsList
	};
};

export const actions = {
	createBoard: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;

		try {
			// Validate with Valibot
			const result = v.safeParse(BoardSchema, {
				title,
				description: description || undefined
			});

			if (!result.success) {
				const firstIssue = result.issues[0];
				return fail(400, { error: firstIssue.message });
			}

			// Create the board
			const boardId = crypto.randomUUID();

			await db.insert(boards).values({
				id: boardId,
				title: result.output.title,
				description: result.output.description || null
			});

			// Create the four default lists for the board
			const listTitles = ['Todo', 'In-Progress', 'QA', 'Done'];
			await db.insert(lists).values(
				listTitles.map((listTitle, index) => ({
					id: crypto.randomUUID(),
					boardId,
					title: listTitle,
					position: index + 1
				}))
			);

			return {
				success: true,
				boardId,
				title: result.output.title,
				description: result.output.description
			};
		} catch (error) {
			console.error('Failed to create board:', error);
			return fail(500, { error: 'Failed to create board. Please try again.' });
		}
	}
} satisfies Actions;
