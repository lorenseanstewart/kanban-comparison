"use server";

import { eq, max } from "drizzle-orm";
import { db } from "./db";
import { cards, cardTags, comments, lists } from "../../drizzle/schema";
import { revalidate } from "@solidjs/router";

export async function updateCard(formData: FormData) {
  try {
    const cardId = formData.get("cardId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;
    const tagIds = formData.getAll("tagIds") as string[];

    if (!cardId || !title) {
      throw new Error("Card ID and title are required");
    }

    if (title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }

    if (title.length > 255) {
      throw new Error("Title must be less than 255 characters");
    }

    if (description && description.length > 2000) {
      throw new Error("Description must be less than 2000 characters");
    }

    // Use a transaction to update card and tags atomically
    db.transaction((tx) => {
      // Update card basic fields
      tx.update(cards)
        .set({
          title,
          description: description || null,
          assigneeId: assigneeId || null,
        })
        .where(eq(cards.id, cardId))
        .run();

      // Update tags - delete existing and insert new ones
      tx.delete(cardTags).where(eq(cardTags.cardId, cardId)).run();

      if (tagIds.length > 0) {
        tx.insert(cardTags)
          .values(
            tagIds.map((tagId) => ({
              cardId,
              tagId,
            }))
          )
          .run();
      }
    });

    revalidate(["boards:detail", "boards:list"]);
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

    if (!cardId || !userId || !text) {
      throw new Error("Card ID, User ID, and text are required");
    }

    if (text.trim().length === 0) {
      throw new Error("Comment text cannot be empty");
    }

    if (text.length > 1000) {
      throw new Error("Comment must be less than 1000 characters");
    }

    const commentId = crypto.randomUUID();

    await db.insert(comments).values({
      id: commentId,
      cardId,
      userId,
      text,
    });

    revalidate(["boards:detail"]);
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

    if (!boardId || !title) {
      throw new Error("Board ID and title are required");
    }

    if (title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }

    if (title.length > 255) {
      throw new Error("Title must be less than 255 characters");
    }

    if (description && description.length > 2000) {
      throw new Error("Description must be less than 2000 characters");
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

    // Use a transaction to create card and tags atomically
    db.transaction((tx) => {
      tx.insert(cards)
        .values({
          id: cardId,
          listId: todoList.id,
          title,
          description: description || null,
          assigneeId: assigneeId || null,
          position: nextPosition,
          completed: false,
        })
        .run();

      // Add tags if any
      if (tagIds.length > 0) {
        tx.insert(cardTags)
          .values(
            tagIds.map((tagId) => ({
              cardId,
              tagId,
            }))
          )
          .run();
      }
    });

    revalidate(["boards:detail", "boards:list"]);
  } catch (error) {
    console.error("Failed to create card:", error);
    throw new Error("Failed to create card. Please try again.");
  }
}