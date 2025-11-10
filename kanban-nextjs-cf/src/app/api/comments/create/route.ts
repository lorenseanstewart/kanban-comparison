import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments } from "@/drizzle/schema";
import { revalidatePath } from 'next/cache';
import * as v from 'valibot';
import { CommentSchema } from '@/lib/validation';

export const runtime = 'edge';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cardId: string; userId: string; text: string };
    const { cardId, userId, text } = body;

    // Validate with Valibot
    const result = v.safeParse(CommentSchema, {
      cardId,
      userId,
      text,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      return NextResponse.json(
        { success: false, error: firstIssue.message },
        { status: 400 }
      );
    }

    const commentId = crypto.randomUUID();

    await db.insert(comments).values({
      id: commentId,
      cardId: result.output.cardId,
      userId: result.output.userId,
      text: result.output.text,
    });

    revalidatePath('/board/[id]', 'page');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment. Please try again.' },
      { status: 500 }
    );
  }
}
