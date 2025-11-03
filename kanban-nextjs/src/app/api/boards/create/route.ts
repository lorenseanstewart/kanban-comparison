import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { boards, lists } from '../../../../../drizzle/schema';
import { revalidatePath } from 'next/cache';
import * as v from 'valibot';
import { BoardSchema } from '@/lib/validation';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // @ts-ignore
    const d1 = process.env.DB as D1Database | undefined;
    if (!d1) {
      return NextResponse.json(
        { error: 'D1 binding not found' },
        { status: 500 }
      );
    }

    const db = getDatabase(d1);
    const body = await request.json() as { title: string; description?: string };
    const { title, description } = body;

    // Validate with Valibot
    const result = v.safeParse(BoardSchema, {
      title,
      description: description || null,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      return NextResponse.json(
        { success: false, error: firstIssue.message },
        { status: 400 }
      );
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

    revalidatePath('/');
    return NextResponse.json({
      success: true,
      data: { id: boardId, title: result.output.title, description: result.output.description },
    });
  } catch (error) {
    console.error('Failed to create board:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create board. Please try again.' },
      { status: 500 }
    );
  }
}
