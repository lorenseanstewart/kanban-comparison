import { defineEventHandler, readBody, createError } from 'h3';
import { getDatabase } from '../../../../db/index';
import { comments } from '../../../../../../drizzle/schema';
import * as v from 'valibot';
import { CommentSchema } from '../../../../../lib/validation';
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
    const result = v.safeParse(CommentSchema, {
      cardId,
      userId: body.userId,
      text: body.text,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      throw createError({
        statusCode: 400,
        statusMessage: firstIssue.message,
      });
    }

    const commentId = crypto.randomUUID();

    await db.insert(comments).values({
      id: commentId,
      cardId: result.output.cardId,
      userId: result.output.userId,
      text: result.output.text,
    });

    return { success: true, data: { id: commentId } };
  } catch (error: any) {
    console.error('Failed to add comment:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add comment. Please try again.',
    });
  }
});
