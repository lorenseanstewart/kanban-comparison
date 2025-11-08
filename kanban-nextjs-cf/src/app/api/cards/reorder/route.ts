import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cards } from "@/drizzle/schema";
import { revalidatePath } from 'next/cache';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cardIds: string[] };
    const { cardIds } = body;

    // Update each card's position based on its index in the array
    await Promise.all(
      cardIds.map((cardId: string, index: number) =>
        db
          .update(cards)
          .set({ position: index })
          .where(eq(cards.id, cardId))
      )
    );

    revalidatePath('/board/[id]', 'page');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update card positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder cards. Please try again.' },
      { status: 500 }
    );
  }
}
