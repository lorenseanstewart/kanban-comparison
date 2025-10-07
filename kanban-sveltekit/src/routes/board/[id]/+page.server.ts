import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getBoard, getUsers, getTags } from '$lib/server/boards';
import { db } from '$lib/db';
import { cards, cardTags, comments, lists } from '$lib/db/schema';
import { eq, max } from 'drizzle-orm';
import * as v from 'valibot';
import { CardSchema, CardUpdateSchema, CommentSchema } from '$lib/validation';

export const load: PageServerLoad = async ({ params, depends }) => {
	depends('app:board');
	depends(`app:board:${params.id}`);

	const board = await getBoard(params.id);

	if (!board) {
		throw error(404, 'Board not found');
	}

	const [users, tags] = await Promise.all([
		getUsers(),
		getTags()
	]);

	return {
		board,
		users,
		tags
	};
};

export const actions = {
	createCard: async ({ request }) => {
		try {
			const formData = await request.formData();
			const boardId = formData.get('boardId') as string;
			const title = formData.get('title') as string;
			const description = formData.get('description') as string;
			const assigneeId = formData.get('assigneeId') as string;
			const tagIds = formData.getAll('tagIds') as string[];

			if (!boardId) {
				return fail(400, { error: 'Board ID is required' });
			}

			// Validate with Valibot
			const result = v.safeParse(CardSchema, {
				title,
				description: description || null,
				assigneeId: assigneeId || null,
				tagIds
			});

			if (!result.success) {
				const firstIssue = result.issues[0];
				return fail(400, { error: firstIssue.message });
			}

			// Find the Todo list for this board
			const todoLists = await db
				.select()
				.from(lists)
				.where(eq(lists.boardId, boardId));

			const todoList = todoLists.find((list) => list.title === 'Todo');

			if (!todoList) {
				return fail(400, { error: 'Todo list not found for this board' });
			}

			// Get the highest position in the Todo list
			const maxPositionResult = await db
				.select({ maxPos: max(cards.position) })
				.from(cards)
				.where(eq(cards.listId, todoList.id));

			const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

			// Create the card
			const cardId = crypto.randomUUID();

			db.transaction((tx) => {
				tx.insert(cards).values({
					id: cardId,
					listId: todoList.id,
					title: result.output.title,
					description: result.output.description,
					assigneeId: result.output.assigneeId,
					position: nextPosition,
					completed: false
				}).run();

				if (result.output.tagIds && result.output.tagIds.length > 0) {
					tx.insert(cardTags).values(
						result.output.tagIds.map((tagId) => ({
							cardId,
							tagId
						}))
					).run();
				}
			});

			return { success: true, cardId };
		} catch (err) {
			console.error('Failed to create card:', err);
			return fail(500, { error: 'Failed to create card. Please try again.' });
		}
	},

	updateCard: async ({ request }) => {
		try {
			const formData = await request.formData();
			const cardId = formData.get('cardId') as string;
			const title = formData.get('title') as string;
			const description = formData.get('description') as string;
			const assigneeId = formData.get('assigneeId') as string;
			const tagIds = formData.getAll('tagIds') as string[];

			// Validate with Valibot
			const result = v.safeParse(CardUpdateSchema, {
				cardId,
				title,
				description: description || null,
				assigneeId: assigneeId || null,
				tagIds
			});

			if (!result.success) {
				const firstIssue = result.issues[0];
				return fail(400, { error: firstIssue.message });
			}

			db.transaction((tx) => {
				tx
					.update(cards)
					.set({
						title: result.output.title,
						description: result.output.description,
						assigneeId: result.output.assigneeId
					})
					.where(eq(cards.id, result.output.cardId))
					.run();

				tx.delete(cardTags).where(eq(cardTags.cardId, result.output.cardId)).run();

				if (result.output.tagIds && result.output.tagIds.length > 0) {
					tx.insert(cardTags).values(
						result.output.tagIds.map((tagId) => ({
							cardId: result.output.cardId,
							tagId
						}))
					).run();
				}
			});

			return { success: true };
		} catch (err) {
			console.error('Failed to update card:', err);
			return fail(500, { error: 'Failed to update card. Please try again.' });
		}
	},

	addComment: async ({ request }) => {
		try {
			const formData = await request.formData();
			const cardId = formData.get('cardId') as string;
			const userId = formData.get('userId') as string;
			const text = formData.get('text') as string;

			// Validate with Valibot
			const result = v.safeParse(CommentSchema, {
				cardId,
				userId,
				text
			});

			if (!result.success) {
				const firstIssue = result.issues[0];
				return fail(400, { error: firstIssue.message });
			}

			const commentId = crypto.randomUUID();

			await db.insert(comments).values({
				id: commentId,
				cardId: result.output.cardId,
				userId: result.output.userId,
				text: result.output.text
			});

			return { success: true };
		} catch (err) {
			console.error('Failed to add comment:', err);
			return fail(500, { error: 'Failed to add comment. Please try again.' });
		}
	},

	updateCardList: async ({ request }) => {
		try {
			const formData = await request.formData();
			const cardId = formData.get('cardId') as string;
			const newListId = formData.get('newListId') as string;

			if (!cardId || !newListId) {
				return fail(400, { error: 'Card ID and new list ID are required' });
			}

			await db
				.update(cards)
				.set({ listId: newListId })
				.where(eq(cards.id, cardId));

			return { success: true };
		} catch (err) {
			console.error('Failed to update card list:', err);
			return fail(500, { error: 'Failed to move card. Please try again.' });
		}
	},

	updateCardPositions: async ({ request }) => {
		try {
			const formData = await request.formData();
			const cardIds = formData.getAll('cardIds') as string[];

			if (cardIds.length === 0) {
				return fail(400, { error: 'Card IDs are required' });
			}

			db.transaction((tx) => {
				cardIds.forEach((cardId, index) => {
					tx
						.update(cards)
						.set({ position: index })
						.where(eq(cards.id, cardId))
						.run();
				});
			});

			return { success: true };
		} catch (err) {
			console.error('Failed to update card positions:', err);
			return fail(500, { error: 'Failed to reorder cards. Please try again.' });
		}
	}
} satisfies Actions;
