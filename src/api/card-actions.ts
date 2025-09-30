"use server";

import { eq } from "drizzle-orm";
import { db } from "./db";
import { cards, cardTags, comments } from "../../drizzle/schema";
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