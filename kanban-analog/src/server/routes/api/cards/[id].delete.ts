import { defineEventHandler, createError } from 'h3';
import { getDatabase } from '../../../db/index';
import { cards } from '../../../../../drizzle/schema';
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

    const cardId = event.context.params?.id;

    if (!cardId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Card ID is required',
      });
    }

    await db.delete(cards).where(eq(cards.id, cardId));

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete card:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete card. Please try again.',
    });
  }
});
