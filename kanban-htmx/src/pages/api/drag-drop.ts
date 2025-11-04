import type { APIRoute } from 'astro';
import { updateCardPositions } from '../../lib/api';

export const POST: APIRoute = async (context) => {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    if (!d1) {
      return new Response(JSON.stringify({ error: 'D1 database binding not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await context.request.json();
    const updates = data.updates as Array<{ cardId: string; listId: string; position: number }>;

    if (!updates || !Array.isArray(updates)) {
      return new Response(JSON.stringify({ error: 'Invalid updates data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await updateCardPositions(updates, d1);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to update card positions:', error);
    return new Response(JSON.stringify({ error: 'Failed to update card positions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
