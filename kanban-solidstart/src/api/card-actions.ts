import { action, CustomResponse, json } from "@solidjs/router";
import { eq, max } from "drizzle-orm";
import * as v from "valibot";
import { cards, cardTags, comments, lists } from "../../drizzle/schema";
import { CardSchema, CardUpdateSchema, CommentSchema } from "../lib/validation";
import { getDatabase } from "./db";

export type CardActionResponse =
  | { success: true; data?: { id?: string; listId?: string; commentId?: string } }
  | { success: false; error: string };

const validateCardUpdate = (formData: FormData) =>
  v.safeParse(CardUpdateSchema, {
    cardId: formData.get("cardId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
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
    description: formData.get("description") || undefined,
    assigneeId: formData.get("assigneeId"),
    tagIds: formData.getAll("tagIds"),
  });

export const updateCardAction = action(
  async (formData: FormData): Promise<CardActionResponse | CustomResponse<CardActionResponse>> => {
    "use server";
    const validation = validateCardUpdate(formData);
    if (!validation.success) {
      const firstIssue = validation.issues[0];
      return { success: false, error: firstIssue.message } as const;
    }

    const { cardId, title, description, assigneeId, tagIds } = validation.output;

    
    const db = getDatabase();

    await db
      .update(cards)
      .set({
        title,
        description: description ?? null,
        assigneeId,
      })
      .where(eq(cards.id, cardId));

    await db.delete(cardTags).where(eq(cardTags.cardId, cardId));

    if (tagIds && tagIds.length > 0) {
      await db.insert(cardTags).values(tagIds.map((tagId) => ({ cardId, tagId })));
    }

    return json({ success: true } as const, { revalidate: ["boards:detail", "boards:list"] });
  },
  "cards:update"
);

export const addCommentAction = action(
  async (formData: FormData): Promise<CardActionResponse | CustomResponse<CardActionResponse>> => {
    "use server";
    const validation = validateComment(formData);
    if (!validation.success) {
      const firstIssue = validation.issues[0];
      return { success: false, error: firstIssue.message } as const;
    }

    const { cardId, userId, text } = validation.output;
    const commentId = crypto.randomUUID();

    
    const db = getDatabase();

    await db.insert(comments).values({
      id: commentId,
      cardId,
      userId,
      text,
    });

    return json({ success: true, data: { commentId } } as const, { revalidate: ["boards:detail"] });
  },
  "cards:add-comment"
);

export const createCardAction = action(
  async (formData: FormData): Promise<CardActionResponse | CustomResponse<CardActionResponse>> => {
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

    
    const db = getDatabase();

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

    await db.insert(cards).values({
      id: cardId,
      listId: todoList.id,
      title: validation.output.title,
      description: validation.output.description ?? null,
      assigneeId: validation.output.assigneeId,
      position: nextPosition,
      completed: false,
    });

    if (validation.output.tagIds && validation.output.tagIds.length > 0) {
      await db.insert(cardTags).values(
        validation.output.tagIds.map((tagId) => ({
          cardId,
          tagId,
        }))
      );
    }

    return json(
      { success: true, data: { id: cardId, listId: todoList.id } },
      {
        revalidate: ["boards:detail", "boards:list"],
      }
    );
  },
  "cards:create"
);

export const deleteCardAction = action(
  async (cardId: string): Promise<CardActionResponse | CustomResponse<CardActionResponse>> => {
    "use server";
    if (!cardId) {
      return { success: false, error: "Card ID is required" } as const;
    }

    try {
      
      const db = getDatabase();

      await db.delete(cards).where(eq(cards.id, cardId));
      return json({ success: true } as const, {
        revalidate: ["boards:detail", "boards:list"],
      });
    } catch (error) {
      console.error("Failed to delete card:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete card. Please try again.",
      } as const;
    }
  },
  "cards:delete"
);
