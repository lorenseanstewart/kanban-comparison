import { defineEventHandler, readBody } from 'h3';
import { db } from '../../../db/index';
import { boards, lists } from '../../../../../drizzle/schema';
import * as v from 'valibot';
import { BoardSchema } from '../../../../lib/validation';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validate with Valibot
    const result = v.safeParse(BoardSchema, {
      title: body.title,
      description: body.description || null,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      throw createError({
        statusCode: 400,
        statusMessage: firstIssue.message,
      });
    }

    // Create the board
    const boardId = crypto.randomUUID();

    await db.insert(boards).values({
      id: boardId,
      title: result.output.title,
      description: result.output.description,
    });

    // Create the four default lists for the board
    const listTitles = ['Todo', 'In-Progress', 'QA', 'Done'];
    await db.insert(lists).values(
      listTitles.map((listTitle, index) => ({
        id: crypto.randomUUID(),
        boardId,
        title: listTitle,
        position: index + 1,
      }))
    );

    return {
      success: true,
      data: {
        id: boardId,
        title: result.output.title,
        description: result.output.description,
      },
    };
  } catch (error: any) {
    console.error('Failed to create board:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create board. Please try again.',
    });
  }
});
