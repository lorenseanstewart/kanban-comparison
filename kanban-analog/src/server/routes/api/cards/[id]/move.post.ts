import { defineEventHandler, readBody } from 'h3';
import { db } from '../../../../db/index';
import { cards } from '../../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const cardId = event.context.params?.id;
    if (!cardId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Card ID is required',
      });
    }

    const body = await readBody(event);

    if (!body.newListId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New list ID is required',
      });
    }

    const updateData: { listId: string; position?: number } = {
      listId: body.newListId,
    };

    if (body.newPosition !== undefined) {
      updateData.position = body.newPosition;
    }

    await db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, cardId));

    return { success: true };
  } catch (error: any) {
    console.error('Failed to move card:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to move card. Please try again.',
    });
  }
});
