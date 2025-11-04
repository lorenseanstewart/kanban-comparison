/// <reference types="@cloudflare/workers-types" />
import { error } from '@sveltejs/kit';
import { query, form, command, getRequestEvent } from '$app/server';
import { getBoard, getUsers, getTags } from '$lib/server/boards';
import { getDatabase } from '$lib/db';
import { cards, cardTags, comments, lists } from '$lib/db/schema';
import { eq, max } from 'drizzle-orm';
import * as v from 'valibot';
import {
	CardListUpdateSchema,
	CardPositionUpdateSchema,
	CardSchema,
	CardUpdateSchema,
	CommentSchema,
	DeleteCardSchema
} from '$lib/validation';

// Query functions
export const getBoardData = query(v.string(), async (board_id) => {
	const event = getRequestEvent();
	const d1 = event.platform?.env?.DB as D1Database;
	const board = await getBoard(d1, board_id);

	if (!board) {
		error(404, 'Board not found');
	}

	const [users, tags] = await Promise.all([getUsers(d1), getTags(d1)]);

	return {
		board,
		users,
		tags
	};
});

// Form functions
export const createCard = form(CardSchema, async (data, invalid) => {
	const event = getRequestEvent();
	const d1 = event.platform?.env?.DB as D1Database;
	const db = getDatabase(d1);

	// Find the Todo list for this board
	const todoLists = await db.select().from(lists).where(eq(lists.boardId, data.boardId));

	const todoList = todoLists.find((list) => list.title === 'Todo');

	if (!todoList) {
		error(400, 'Todo list not found for this board');
	}

	// Get the highest position in the Todo list
	const maxPositionResult = await db
		.select({ maxPos: max(cards.position) })
		.from(cards)
		.where(eq(cards.listId, todoList.id));

	const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

	// Create the card
	const card_id = crypto.randomUUID();

	// D1 doesn't support transactions - use sequential operations
	await db.insert(cards).values({
		id: card_id,
		listId: todoList.id,
		title: data.title,
		description: data.description || null,
		assigneeId: data.assigneeId || null,
		position: nextPosition,
		completed: false
	});

	if (data.tagIds && data.tagIds.length > 0) {
		await db.insert(cardTags).values(
			data.tagIds.map((tagId) => ({
				cardId: card_id,
				tagId: tagId
			}))
		);
	}

	// Refresh the board query
	await getBoardData(data.boardId).refresh();

	return { success: true, cardId: card_id };
});

export const updateCard = form(CardUpdateSchema, async (data, invalid) => {
	const event = getRequestEvent();
	const d1 = event.platform?.env?.DB as D1Database;
	const db = getDatabase(d1);

	// D1 doesn't support transactions - use sequential operations
	await db.update(cards)
		.set({
			title: data.title,
			description: data.description || null,
			assigneeId: data.assigneeId || null
		})
		.where(eq(cards.id, data.cardId));

	await db.delete(cardTags).where(eq(cardTags.cardId, data.cardId));

	if (data.tagIds && data.tagIds.length > 0) {
		await db.insert(cardTags).values(
			data.tagIds.map((tag_id) => ({
				cardId: data.cardId,
				tagId: tag_id
			}))
		);
	}

	// Refresh the board query
	await getBoardData(data.boardId).refresh();

	return { success: true };
});

export const addComment = form(CommentSchema, async (data, invalid) => {
	const event = getRequestEvent();
	const d1 = event.platform?.env?.DB as D1Database;
	const db = getDatabase(d1);
	const commentId = crypto.randomUUID();

	await db.insert(comments).values({
		id: commentId,
		cardId: data.cardId,
		userId: data.userId,
		text: data.text
	});

	// Refresh the board query
	await getBoardData(data.boardId).refresh();

	return { success: true };
});

// Command functions for more granular control
export const updateCardList = command(CardListUpdateSchema, async (data) => {
	const event = getRequestEvent();
	const d1 = event.platform?.env?.DB as D1Database;
	const db = getDatabase(d1);
	await db.update(cards).set({ listId: data.newListId }).where(eq(cards.id, data.cardId));

	// Refreshing the board query happens below in updateCardPositions
});

export const updateCardPositions = command(CardPositionUpdateSchema, async (data) => {
	const event = getRequestEvent();
	const d1 = event.platform?.env?.DB as D1Database;
	const db = getDatabase(d1);

	// D1 doesn't support transactions - use sequential operations
	for (let index = 0; index < data.cardIds.length; index++) {
		await db.update(cards).set({ position: index }).where(eq(cards.id, data.cardIds[index]));
	}

	// Refresh the board query
	await getBoardData(data.boardId).refresh();
});

export const deleteCard = command(DeleteCardSchema, async (data) => {
	const event = getRequestEvent();
	const d1 = event.platform?.env?.DB as D1Database;
	const db = getDatabase(d1);
	await db.delete(cards).where(eq(cards.id, data.cardId));

	// Refresh the board query
	await getBoardData(data.boardId).refresh();
});
