import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDatabase } from '@/lib/db';
import { cards } from '../../../../../drizzle/schema';
import { revalidatePath } from 'next/cache';

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
    const body = await request.json() as { cardId: string; newListId: string; newPosition?: number };
    const { cardId, newListId, newPosition } = body;

    const updateData: { listId: string; position?: number } = { listId: newListId };

    if (newPosition !== undefined) {
      updateData.position = newPosition;
    }

    await db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, cardId));

    revalidatePath('/board/[id]', 'page');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update card list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to move card. Please try again.' },
      { status: 500 }
    );
  }
}
