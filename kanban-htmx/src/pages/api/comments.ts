import type { APIRoute } from 'astro';
import { addComment } from '../../lib/api';
import * as v from 'valibot';
import { CommentSchema } from '../../lib/validation';

export const POST: APIRoute = async (context) => {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    const formData = await context.request.formData();
    const cardId = formData.get('cardId') as string;
    const userId = formData.get('userId') as string;
    const text = formData.get('text') as string;

    // Validate with Valibot
    const result = v.safeParse(CommentSchema, {
      cardId,
      userId,
      text,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      return new Response(JSON.stringify({ error: firstIssue.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const comment = await addComment(result.output, d1);

    return new Response(JSON.stringify({ success: true, comment }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to add comment:', error);
    return new Response(JSON.stringify({ error: 'Failed to add comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
