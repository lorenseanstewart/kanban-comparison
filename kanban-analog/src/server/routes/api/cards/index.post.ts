import { defineEventHandler, readBody, createError } from 'h3';
import { db } from '../../../db/index';
import { lists, cards, cardTags } from '../../../../../drizzle/schema';
import { eq, max } from 'drizzle-orm';
import * as v from 'valibot';
import { CardSchema } from '../../../../lib/validation';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.boardId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Board ID is required',
      });
    }

    // Validate with Valibot
    const result = v.safeParse(CardSchema, {
      title: body.title,
      description: body.description || null,
      assigneeId: body.assigneeId || null,
      tagIds: body.tagIds || [],
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      throw createError({
        statusCode: 400,
        statusMessage: firstIssue.message,
      });
    }

    // Find the Todo list for this board
    const todoLists = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, body.boardId));

    const todoList = todoLists.find((list) => list.title === 'Todo');

    if (!todoList) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Todo list not found for this board',
      });
    }

    // Get the highest position in the Todo list
    const maxPositionResult = await db
      .select({ maxPos: max(cards.position) })
      .from(cards)
      .where(eq(cards.listId, todoList.id));

    const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

    // Create the card
    const cardId = crypto.randomUUID();

    // Use a transaction to create card and tags atomically
    db.transaction((tx) => {
      tx.insert(cards)
        .values({
          id: cardId,
          listId: todoList.id,
          title: result.output.title,
          description: result.output.description,
          assigneeId: result.output.assigneeId,
          position: nextPosition,
          completed: false,
        })
        .run();

      // Add tags if any
      if (result.output.tagIds && result.output.tagIds.length > 0) {
        tx.insert(cardTags)
          .values(
            result.output.tagIds.map((tagId) => ({
              cardId,
              tagId,
            }))
          )
          .run();
      }
    });

    return { success: true, data: { id: cardId } };
  } catch (error: any) {
    console.error('Failed to create card:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create card. Please try again.',
    });
  }
});
