import type { APIRoute} from 'astro';
import { updateCard } from '../../../lib/api';
import * as v from 'valibot';
import { CardUpdateSchema } from '../../../lib/validation';

export const PATCH: APIRoute = async (context) => {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    const cardId = context.params.id;
    if (!cardId) {
      return new Response(JSON.stringify({ error: 'Card ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await context.request.formData();
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
      tagIds,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      return new Response(JSON.stringify({ error: firstIssue.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await updateCard(result.output, d1);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to update card:', error);
    return new Response(JSON.stringify({ error: 'Failed to update card' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
