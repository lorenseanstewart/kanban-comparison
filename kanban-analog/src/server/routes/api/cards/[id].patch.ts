import { defineEventHandler, readBody, createError } from 'h3';
import { getDatabase } from '../../../db/index';
import { cards, cardTags } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { CardUpdateSchema } from '../../../../lib/validation';
import type { D1Database } from '@cloudflare/workers-types';

export default defineEventHandler(async (event) => {
  try {
    const d1 = event.context.cloudflare?.env?.DB as D1Database | undefined;

    if (!d1) {
      throw createError({
        statusCode: 500,
        statusMessage: 'D1 binding not found',
      });
    }

    const db = getDatabase(d1);

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

    // Update card basic fields
    await db
      .update(cards)
      .set({
        title: result.output.title,
        description: result.output.description,
        assigneeId: result.output.assigneeId,
      })
      .where(eq(cards.id, result.output.cardId));

    // Update tags - delete existing and insert new ones
    await db.delete(cardTags).where(eq(cardTags.cardId, result.output.cardId));

    if (result.output.tagIds && result.output.tagIds.length > 0) {
      await db
        .insert(cardTags)
        .values(
          result.output.tagIds.map((tagId) => ({
            cardId: result.output.cardId,
            tagId,
          }))
        );
    }

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
