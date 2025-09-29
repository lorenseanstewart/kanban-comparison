"use server";

import { eq } from "drizzle-orm";
import { db } from "./db";
import { cards } from "../../drizzle/schema";
import { revalidate } from "@solidjs/router";

export async function updateCardList(cardId: string, newListId: string) {
  await db
    .update(cards)
    .set({ listId: newListId })
    .where(eq(cards.id, cardId));

  revalidate(fetchBoard.key);
  return { success: true };
}

export async function updateCardPositions(cardIds: string[]) {
  // Update each card's position based on its index in the array
  await Promise.all(
    cardIds.map((cardId, index) =>
      db
        .update(cards)
        .set({ position: index })
        .where(eq(cards.id, cardId))
    )
  );

  revalidate(fetchBoard.key);
  return { success: true };
}

// Import to get the cache key
import { fetchBoard } from "./index";