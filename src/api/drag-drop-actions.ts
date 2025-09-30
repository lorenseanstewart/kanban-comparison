"use server";

import { eq } from "drizzle-orm";
import { db } from "./db";
import { cards } from "../../drizzle/schema";
import { revalidate } from "@solidjs/router";

export async function updateCardList(cardId: string, newListId: string) {
  try {
    await db
      .update(cards)
      .set({ listId: newListId })
      .where(eq(cards.id, cardId));

    revalidate("boards:detail");
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

    revalidate("boards:detail");
    return { success: true };
  } catch (error) {
    console.error("Failed to update card positions:", error);
    throw new Error("Failed to reorder cards. Please try again.");
  }
}