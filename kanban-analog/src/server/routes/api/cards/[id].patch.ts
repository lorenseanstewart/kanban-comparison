import { defineEventHandler, readBody } from 'h3';
import { db } from '../../../db/index';
import { cards, cardTags } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { CardUpdateSchema } from '../../../../lib/validation';

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

    // Validate with Valibot
    const result = v.safeParse(CardUpdateSchema, {
      cardId,
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

    // Use a transaction to update card and tags atomically
    db.transaction((tx) => {
      // Update card basic fields
      tx.update(cards)
        .set({
          title: result.output.title,
          description: result.output.description,
          assigneeId: result.output.assigneeId,
        })
        .where(eq(cards.id, result.output.cardId))
        .run();

      // Update tags - delete existing and insert new ones
      tx.delete(cardTags).where(eq(cardTags.cardId, result.output.cardId)).run();

      if (result.output.tagIds && result.output.tagIds.length > 0) {
        tx.insert(cardTags)
          .values(
            result.output.tagIds.map((tagId) => ({
              cardId: result.output.cardId,
              tagId,
            }))
          )
          .run();
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update card:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update card. Please try again.',
    });
  }
});
