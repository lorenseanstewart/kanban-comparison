"use server";

import { eq, max } from "drizzle-orm";
import { db } from "./db";
import { boards, lists, cards, cardTags, comments } from "../../drizzle/schema";
import * as v from "valibot";
import { BoardSchema, CardSchema, CardUpdateSchema, CommentSchema } from "./validation";

export async function createBoard(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // Validate with Valibot
    const result = v.safeParse(BoardSchema, {
      title,
      description: description || null,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      return { success: false, error: firstIssue.message };
    }

    // Create the board
    const boardId = crypto.randomUUID();

    await db.insert(boards).values({
      id: boardId,
      title: result.output.title,
      description: result.output.description,
    });

    // Create the four default lists for the board
    const listTitles = ["Todo", "In-Progress", "QA", "Done"];
    await db.insert(lists).values(
      listTitles.map((listTitle, index) => ({
        id: crypto.randomUUID(),
        boardId,
        title: listTitle,
        position: index + 1,
      }))
    );

    return { success: true, data: { id: boardId, title: result.output.title, description: result.output.description } };
  } catch (error) {
    console.error("Failed to create board:", error);
    return { success: false, error: "Failed to create board. Please try again." };
  }
}

export async function updateCard(formData: FormData) {
  try {
    const cardId = formData.get("cardId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;
    const tagIds = formData.getAll("tagIds") as string[];

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
      throw new Error(firstIssue.message);
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
      await db
        .insert(cardTags)
        .values(
          result.output.tagIds.map((tagId) => ({
            cardId: result.output.cardId,
            tagId,
          }))
        );
    }
  } catch (error) {
    console.error("Failed to update card:", error);
    throw new Error("Failed to update card. Please try again.");
  }
}

export async function addComment(formData: FormData) {
  try {
    const cardId = formData.get("cardId") as string;
    const userId = formData.get("userId") as string;
    const text = formData.get("text") as string;

    // Validate with Valibot
    const result = v.safeParse(CommentSchema, {
      cardId,
      userId,
      text,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      throw new Error(firstIssue.message);
    }

    const commentId = crypto.randomUUID();

    await db.insert(comments).values({
      id: commentId,
      cardId: result.output.cardId,
      userId: result.output.userId,
      text: result.output.text,
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    throw new Error("Failed to add comment. Please try again.");
  }
}

export async function createCard(formData: FormData) {
  try {
    const boardId = formData.get("boardId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;
    const tagIds = formData.getAll("tagIds") as string[];

    if (!boardId) {
      return { success: false, error: "Board ID is required" };
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
      return { success: false, error: firstIssue.message };
    }

    // Find the Todo list for this board
    const todoLists = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, boardId));

    const todoList = todoLists.find((list) => list.title === "Todo");

    if (!todoList) {
      return { success: false, error: "Todo list not found for this board" };
    }

    // Get the highest position in the Todo list
    const maxPositionResult = await db
      .select({ maxPos: max(cards.position) })
      .from(cards)
      .where(eq(cards.listId, todoList.id));

    const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

    // Create the card
    const cardId = crypto.randomUUID();

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
      await db
        .insert(cardTags)
        .values(
          result.output.tagIds.map((tagId) => ({
            cardId,
            tagId,
          }))
        );
    }

    return { success: true, data: { id: cardId } };
  } catch (error) {
    console.error("Failed to create card:", error);
    return { success: false, error: "Failed to create card. Please try again." };
  }
}

export async function updateCardList(cardId: string, newListId: string, newPosition?: number) {
  try {
    const updateData: { listId: string; position?: number } = { listId: newListId };

    if (newPosition !== undefined) {
      updateData.position = newPosition;
    }

    await db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, cardId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update card list:", error);
    throw new Error("Failed to move card. Please try again.");
  }
}

export async function updateCardPositions(cardIds: string[]) {
  try {
    // Update each card's position based on its index in the array
    await Promise.all(
      cardIds.map((cardId, index) =>
        db
          .update(cards)
          .set({ position: index })
          .where(eq(cards.id, cardId))
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update card positions:", error);
    throw new Error("Failed to reorder cards. Please try again.");
  }
}

export async function deleteCard(cardId: string) {
  try {
    if (!cardId) {
      return { success: false, error: "Card ID is required" };
    }

    await db.delete(cards).where(eq(cards.id, cardId));

    return { success: true };
  } catch (error) {
    console.error("Failed to delete card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete card. Please try again.",
    };
  }
}
