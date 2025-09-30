"use server";

import { eq, max } from "drizzle-orm";
import { db } from "./db";
import { cards, cardTags, comments, lists } from "../../drizzle/schema";
import { revalidate } from "@solidjs/router";

export async function updateCard(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const tagIds = formData.getAll("tagIds") as string[];

  if (!cardId || !title) {
    throw new Error("Card ID and title are required");
  }

  // Update card basic fields
  await db
    .update(cards)
    .set({
      title,
      description: description || null,
      assigneeId: assigneeId || null,
    })
    .where(eq(cards.id, cardId));

  // Update tags - delete existing and insert new ones
  await db.delete(cardTags).where(eq(cardTags.cardId, cardId));

  if (tagIds.length > 0) {
    await db.insert(cardTags).values(
      tagIds.map((tagId) => ({
        cardId,
        tagId,
      }))
    );
  }

  revalidate(["boards:detail", "boards:list"]);
}

export async function addComment(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const userId = formData.get("userId") as string;
  const text = formData.get("text") as string;

  if (!cardId || !userId || !text) {
    throw new Error("Card ID, User ID, and text are required");
  }

  const commentId = crypto.randomUUID();

  await db.insert(comments).values({
    id: commentId,
    cardId,
    userId,
    text,
  });

  revalidate(["boards:detail"]);
}

export async function createCard(formData: FormData) {
  const boardId = formData.get("boardId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const tagIds = formData.getAll("tagIds") as string[];

  if (!boardId || !title) {
    throw new Error("Board ID and title are required");
  }

  // Find the Todo list for this board
  const todoLists = await db
    .select()
    .from(lists)
    .where(eq(lists.boardId, boardId));

  const todoList = todoLists.find((list) => list.title === "Todo");

  if (!todoList) {
    throw new Error("Todo list not found for this board");
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
    title,
    description: description || null,
    assigneeId: assigneeId || null,
    position: nextPosition,
    completed: false,
  });

  // Add tags if any
  if (tagIds.length > 0) {
    await db.insert(cardTags).values(
      tagIds.map((tagId) => ({
        cardId,
        tagId,
      }))
    );
  }

  revalidate(["boards:detail", "boards:list"]);
}