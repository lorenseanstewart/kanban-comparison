import { NextRequest, NextResponse } from 'next/server';
import { eq, max } from 'drizzle-orm';
import { db } from '@/lib/db';
import { lists, cards, cardTags } from "@/drizzle/schema";
import { revalidatePath } from 'next/cache';
import * as v from 'valibot';
import { CardSchema } from '@/lib/validation';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { boardId: string; title: string; description?: string; assigneeId?: string; tagIds?: string[] };
    const { boardId, title, description, assigneeId, tagIds } = body;

    if (!boardId) {
      return NextResponse.json(
        { success: false, error: 'Board ID is required' },
        { status: 400 }
      );
    }

    // Validate with Valibot
    const result = v.safeParse(CardSchema, {
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

    // Find the Todo list for this board
    const todoLists = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, boardId));

    const todoList = todoLists.find((list: any) => list.title === 'Todo');

    if (!todoList) {
      return NextResponse.json(
        { success: false, error: 'Todo list not found for this board' },
        { status: 404 }
      );
    }

    // Get the highest position in the Todo list
    const maxPositionResult = await db
      .select({ maxPos: max(cards.position) })
      .from(cards)
      .where(eq(cards.listId, todoList.id));

    const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

    const cardId = crypto.randomUUID();

    // Create the card
    await db.insert(cards).values({
      id: cardId,
      listId: todoList.id,
      title: result.output.title,
      description: result.output.description,
      assigneeId: result.output.assigneeId,
      position: nextPosition,
      completed: false,
    });

    // Add tags if any
    if (result.output.tagIds && result.output.tagIds.length > 0) {
      await db.insert(cardTags).values(
        result.output.tagIds.map((tagId) => ({
          cardId,
          tagId,
        }))
      );
    }

    revalidatePath('/board/[id]', 'page');
    revalidatePath('/');
    return NextResponse.json({ success: true, data: { id: cardId } });
  } catch (error) {
    console.error('Failed to create card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create card. Please try again.' },
      { status: 500 }
    );
  }
}
