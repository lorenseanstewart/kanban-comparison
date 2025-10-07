"use server";

import { eq } from "drizzle-orm";
import { db } from "./db";
import { cards } from "../../drizzle/schema";
import { revalidate, action } from "@solidjs/router";

const normalizeListId = (listId: string) =>
  listId.startsWith("list-") ? listId : listId.replace(/^card-/, "");

export const updateCardListAction = action(async (cardId: string, targetId: string) => {
  const normalizedTarget = normalizeListId(targetId);

  try {
    await db
      .update(cards)
      .set({ listId: normalizedTarget })
      .where(eq(cards.id, cardId));

    revalidate("boards:detail");
    return { success: true, listId: normalizedTarget } as const;
  } catch (error) {
    console.error("Failed to update card list:", error);
    return { success: false, error: "Failed to move card. Please try again." } as const;
  }
}, "cards:move-list");

export const updateCardPositionsAction = action(async (cardIds: string[]) => {
  try {
    await db.transaction((tx) => {
      cardIds.forEach((cardId, index) => {
        tx.update(cards)
          .set({ position: index })
          .where(eq(cards.id, cardId))
          .run();
      });
    });

    revalidate("boards:detail");
    return { success: true } as const;
  } catch (error) {
    console.error("Failed to update card positions:", error);
    return { success: false, error: "Failed to reorder cards. Please try again." } as const;
  }
}, "cards:update-positions");