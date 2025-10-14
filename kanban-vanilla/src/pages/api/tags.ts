import type { APIRoute } from 'astro';
import { getTags } from '../../lib/api';

export const GET: APIRoute = async () => {
  try {
    const tags = await getTags();
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
