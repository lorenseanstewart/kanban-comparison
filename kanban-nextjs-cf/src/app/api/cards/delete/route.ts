import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cards } from "@/drizzle/schema";
import { revalidatePath } from 'next/cache';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cardId: string };
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: 'Card ID is required' },
        { status: 400 }
      );
    }

    await db.delete(cards).where(eq(cards.id, cardId));

    revalidatePath('/board/[id]', 'page');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete card:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete card. Please try again.',
      },
      { status: 500 }
    );
  }
}
