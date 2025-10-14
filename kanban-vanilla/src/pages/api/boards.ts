import type { APIRoute } from 'astro';
import { getBoards, createBoard } from '../../lib/api';
import * as v from 'valibot';
import { BoardSchema } from '../../lib/validation';

export const GET: APIRoute = async () => {
  try {
    const boards = await getBoards();
    return new Response(JSON.stringify(boards), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch boards:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch boards' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Validate with Valibot
    const result = v.safeParse(BoardSchema, {
      title,
      description: description || null,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      return new Response(JSON.stringify({ error: firstIssue.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const board = await createBoard(result.output);

    return new Response(JSON.stringify({ success: true, board }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create board:', error);
    return new Response(JSON.stringify({ error: 'Failed to create board' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
