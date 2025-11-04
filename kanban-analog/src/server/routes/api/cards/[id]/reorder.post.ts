import { defineEventHandler, readBody, createError } from 'h3';
import { getDatabase } from '../../../../db/index';
import { cards } from '../../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
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

    const body = await readBody(event);

    if (!Array.isArray(body.cardIds)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Card IDs array is required',
      });
    }

    // Update each card's position based on its index in the array
    await Promise.all(
      body.cardIds.map((cardId: string, index: number) =>
        db
          .update(cards)
          .set({ position: index })
          .where(eq(cards.id, cardId))
      )
    );

    return { success: true };
  } catch (error: any) {
    console.error('Failed to reorder cards:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reorder cards. Please try again.',
    });
  }
});
