import { action, json } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { cards } from "../../drizzle/schema";
import { db } from "./db";

const normalizeListId = (listId: string) => (listId.startsWith("list-") ? listId : listId.replace(/^card-/, ""));

export const updateCardListAction = action(async (cardId: string, targetId: string) => {
  "use server";
  const normalizedTarget = normalizeListId(targetId);

  try {
    await db.update(cards).set({ listId: normalizedTarget }).where(eq(cards.id, cardId));

    return json({ success: true, listId: normalizedTarget } as const, { revalidate: "boards:detail" });
  } catch (error) {
    console.error("Failed to update card list:", error);
    return { success: false, error: "Failed to move card. Please try again." } as const;
  }
}, "cards:move-list");

export const updateCardPositionsAction = action(async (cardIds: string[]) => {
  "use server";
  try {
    for (let index = 0; index < cardIds.length; index++) {
      await db.update(cards).set({ position: index }).where(eq(cards.id, cardIds[index]));
    }

    return json({ success: true } as const, { revalidate: "boards:detail" });
  } catch (error) {
    console.error("Failed to update card positions:", error);
    return { success: false, error: "Failed to reorder cards. Please try again." } as const;
  }
}, "cards:update-positions");
