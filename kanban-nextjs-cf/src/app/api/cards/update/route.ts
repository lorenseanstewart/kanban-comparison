import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cards, cardTags } from "@/drizzle/schema";
import { revalidatePath } from 'next/cache';
import * as v from 'valibot';
import { CardUpdateSchema } from '@/lib/validation';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cardId: string; title: string; description?: string; assigneeId?: string; tagIds?: string[] };
    const { cardId, title, description, assigneeId, tagIds } = body;

    // Validate with Valibot
    const result = v.safeParse(CardUpdateSchema, {
      cardId,
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      tagIds,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      return NextResponse.json(
        { success: false, error: firstIssue.message },
        { status: 400 }
      );
    }

    // Update card basic fields
    await db
      .update(cards)
      .set({
        title: result.output.title,
        description: result.output.description,
        assigneeId: result.output.assigneeId,
      })
      .where(eq(cards.id, result.output.cardId));

    // Update tags - delete existing and insert new ones
    await db.delete(cardTags).where(eq(cardTags.cardId, result.output.cardId));

    if (result.output.tagIds && result.output.tagIds.length > 0) {
      await db.insert(cardTags).values(
        result.output.tagIds.map((tagId) => ({
          cardId: result.output.cardId,
          tagId,
        }))
      );
    }

    revalidatePath('/board/[id]', 'page');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update card. Please try again.' },
      { status: 500 }
    );
  }
}
