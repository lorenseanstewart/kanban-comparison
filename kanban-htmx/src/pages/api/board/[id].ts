import type { APIRoute } from 'astro';
import { getBoard } from '../../../lib/api';

export const GET: APIRoute = async (context) => {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    if (!d1) {
      return new Response(JSON.stringify({ error: 'D1 database binding not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const boardId = context.params.id;

    if (!boardId) {
      return new Response(JSON.stringify({ error: 'Board ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const board = await getBoard(boardId, d1);

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
