import type { APIRoute } from 'astro';
import { getUsers } from '../../lib/api';

export const GET: APIRoute = async (context) => {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    const users = await getUsers(d1);
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
