import { eq, max } from "drizzle-orm";
import { db } from "./db";
import { cards, cardTags, comments, lists } from "../../drizzle/schema";
import { revalidate, action } from "@solidjs/router";
import * as v from "valibot";
import { CardSchema, CardUpdateSchema, CommentSchema } from "../lib/validation";

export type CardActionResponse =
  | { success: true; data?: { id?: string; listId?: string; commentId?: string } }
  | { success: false; error: string };

const validateCardUpdate = (formData: FormData) =>
  v.safeParse(CardUpdateSchema, {
    cardId: formData.get("cardId"),
    title: formData.get("title"),
    description: formData.get("description"),
    assigneeId: formData.get("assigneeId"),
    tagIds: formData.getAll("tagIds"),
  });

const validateComment = (formData: FormData) =>
  v.safeParse(CommentSchema, {
    cardId: formData.get("cardId"),
    userId: formData.get("userId"),
    text: formData.get("text"),
  });

const validateCardCreate = (formData: FormData) =>
  v.safeParse(CardSchema, {
    title: formData.get("title"),
    description: formData.get("description") || null,
    assigneeId: formData.get("assigneeId") || null,
    tagIds: formData.getAll("tagIds"),
  });

export const updateCardAction = action(async (formData: FormData): Promise<CardActionResponse> => {
  "use server";
  const validation = validateCardUpdate(formData);
  if (!validation.success) {
    const firstIssue = validation.issues[0];
    return { success: false, error: firstIssue.message } as const;
  }

  const { cardId, title, description, assigneeId, tagIds } = validation.output;

  db.transaction((tx) => {
    tx.update(cards)
      .set({
        title,
        description,
        assigneeId,
      })
      .where(eq(cards.id, cardId))
      .run();

    tx.delete(cardTags).where(eq(cardTags.cardId, cardId)).run();

    if (tagIds.length > 0) {
      tx.insert(cardTags)
        .values(tagIds.map((tagId) => ({ cardId, tagId })))
        .run();
    }
  });

  revalidate(["boards:detail", "boards:list"]);
  return { success: true } as const;
}, "cards:update");

export const addCommentAction = action(async (formData: FormData): Promise<CardActionResponse> => {
  "use server";
  const validation = validateComment(formData);
  if (!validation.success) {
    const firstIssue = validation.issues[0];
    return { success: false, error: firstIssue.message } as const;
  }

  const { cardId, userId, text } = validation.output;
  const commentId = crypto.randomUUID();

  await db.insert(comments).values({
    id: commentId,
    cardId,
    userId,
    text,
  });

  revalidate(["boards:detail"]);
  return { success: true, data: { commentId } } as const;
}, "cards:add-comment");

export const createCardAction = action(async (formData: FormData): Promise<CardActionResponse> => {
  "use server";
  const boardId = formData.get("boardId") as string | null;
  if (!boardId) {
    return { success: false, error: "Board ID is required" } as const;
  }

  const validation = validateCardCreate(formData);
  if (!validation.success) {
    const firstIssue = validation.issues[0];
    return { success: false, error: firstIssue.message } as const;
  }

  const todoList = await db
    .select()
    .from(lists)
    .where(eq(lists.boardId, boardId))
    .then((rows) => rows.find((list) => list.title === "Todo"));

  if (!todoList) {
    return { success: false, error: "Todo list not found for this board" } as const;
  }

  const maxPositionRow = await db
    .select({ maxPos: max(cards.position) })
    .from(cards)
    .where(eq(cards.listId, todoList.id));

  const nextPosition = (maxPositionRow[0]?.maxPos ?? -1) + 1;
  const cardId = crypto.randomUUID();

  db.transaction((tx) => {
    tx.insert(cards)
      .values({
        id: cardId,
        listId: todoList.id,
        title: validation.output.title,
        description: validation.output.description,
        assigneeId: validation.output.assigneeId,
        position: nextPosition,
        completed: false,
      })
      .run();

    if (validation.output.tagIds.length > 0) {
      tx.insert(cardTags)
        .values(
          validation.output.tagIds.map((tagId) => ({
            cardId,
            tagId,
          }))
        )
        .run();
    }
  });

  revalidate(["boards:detail", "boards:list"]);
  return { success: true, data: { id: cardId, listId: todoList.id } } as const;
}, "cards:create");

export const deleteCardAction = action(async (cardId: string): Promise<CardActionResponse> => {
  "use server";
  if (!cardId) {
    return { success: false, error: "Card ID is required" } as const;
  }

  try {
    await db.delete(cards).where(eq(cards.id, cardId));
    revalidate(["boards:detail", "boards:list"]);
    return { success: true } as const;
  } catch (error) {
    console.error("Failed to delete card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete card. Please try again."
    } as const;
  }
}, "cards:delete");