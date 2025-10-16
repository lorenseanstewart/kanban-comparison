import { eq, and, gte, lt, lte, sql } from "drizzle-orm";
import { db } from "./index";
import { cards } from "../../drizzle/schema";

/**
 * Update a card's list and position
 */
export async function updateCardListAndPosition(
  cardId: string,
  newListId: string,
  newPosition: number,
): Promise<void> {
  // Get the current card
  const card = await db.select().from(cards).where(eq(cards.id, cardId)).get();

  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }

  const oldListId = card.listId;
  const oldPosition = card.position;

  // If moving to a different list
  if (oldListId !== newListId) {
    // Get all cards in the old list that come after the removed card
    await db
      .update(cards)
      .set({ position: sql`${cards.position} - 1` })
      .where(
        and(eq(cards.listId, oldListId), gte(cards.position, oldPosition + 1)),
      )
      .run();

    // Get all cards in the new list at or after the target position
    await db
      .update(cards)
      .set({ position: sql`${cards.position} + 1` })
      .where(and(eq(cards.listId, newListId), gte(cards.position, newPosition)))
      .run();

    // Update the card itself
    await db
      .update(cards)
      .set({ listId: newListId, position: newPosition })
      .where(eq(cards.id, cardId))
      .run();
  } else {
    // Moving within the same list
    if (newPosition < oldPosition) {
      // Moving up: get cards between new and old position
      await db
        .update(cards)
        .set({ position: sql`${cards.position} + 1` })
        .where(
          and(
            eq(cards.listId, oldListId),
            gte(cards.position, newPosition),
            lt(cards.position, oldPosition),
          ),
        )
        .run();
    } else if (newPosition > oldPosition) {
      // Moving down: decrement positions of cards between old and new
      await db
        .update(cards)
        .set({ position: sql`${cards.position} - 1` })
        .where(
          and(
            eq(cards.listId, oldListId),
            gte(cards.position, oldPosition + 1),
            lte(cards.position, newPosition),
          ),
        )
        .run();
    }

    // Update the card itself
    await db
      .update(cards)
      .set({ position: newPosition })
      .where(eq(cards.id, cardId))
      .run();
  }
}

/**
 * Update only a card's position within its current list
 */
export async function updateCardPosition(
  cardId: string,
  newPosition: number,
): Promise<void> {
  // Get the current card
  const card = await db.select().from(cards).where(eq(cards.id, cardId)).get();

  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }

  const listId = card.listId;
  const oldPosition = card.position;

  if (newPosition === oldPosition) {
    return; // No change needed
  }

  if (newPosition < oldPosition) {
    // Moving up: get cards between new and old position
    await db
      .update(cards)
      .set({ position: sql`${cards.position} + 1` })
      .where(
        and(
          eq(cards.listId, listId),
          gte(cards.position, newPosition),
          lt(cards.position, oldPosition),
        ),
      )
      .run();
  } else {
    // Moving down: get cards between old and new position
    await db
      .update(cards)
      .set({ position: sql`${cards.position} - 1` })
      .where(
        and(
          eq(cards.listId, listId),
          gte(cards.position, oldPosition + 1),
          lte(cards.position, newPosition),
        ),
      )
      .run();
  }

  // Update the card itself
  await db
    .update(cards)
    .set({ position: newPosition })
    .where(eq(cards.id, cardId))
    .run();
}
