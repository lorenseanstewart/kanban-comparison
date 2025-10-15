import type { APIRoute } from 'astro';
import { getUsers } from '../../lib/api';

export const GET: APIRoute = async () => {
  try {
    const users = await getUsers();
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
