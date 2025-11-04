import type { APIRoute } from 'astro';
import { getTags } from '../../lib/api';

export const GET: APIRoute = async (context) => {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    if (!d1) {
      return new Response(JSON.stringify({ error: 'D1 database binding not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const tags = await getTags(d1);
    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tags' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
