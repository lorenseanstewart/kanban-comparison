import type { APIRoute } from 'astro';
import { createCard } from '../../lib/api';
import * as v from 'valibot';
import { CardSchema } from '../../lib/validation';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const boardId = formData.get('boardId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const assigneeId = formData.get('assigneeId') as string;
    const tagIds = formData.getAll('tagIds') as string[];

    if (!boardId) {
      return new Response(JSON.stringify({ error: 'Board ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate with Valibot
    const result = v.safeParse(CardSchema, {
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

    const card = await createCard({
      boardId,
      ...result.output,
    });

    return new Response(JSON.stringify({ success: true, card }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create card:', error);
    return new Response(JSON.stringify({ error: 'Failed to create card' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
