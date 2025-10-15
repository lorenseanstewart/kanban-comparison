import type { APIRoute } from 'astro';
import { getBoard } from '../../../lib/api';

export const GET: APIRoute = async ({ params }) => {
  try {
    const boardId = params.id;

    if (!boardId) {
      return new Response(JSON.stringify({ error: 'Board ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const board = await getBoard(boardId);

    if (!board) {
      return new Response(JSON.stringify({ error: 'Board not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(board), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch board:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch board' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
