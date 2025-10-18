import { eq, inArray } from 'drizzle-orm'
import { db } from '../../utils/db'
import { cards } from '../../../drizzle/schema'

interface MoveCardPayload {
  cardId: string
  sourceListId: string
  targetListId: string
  newPosition: number
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<MoveCardPayload>(event)
    const { cardId, sourceListId, targetListId, newPosition } = body

    if (!cardId || !targetListId || newPosition === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      })
    }

    db.transaction((tx) => {
      // Step 1: Get all cards from source list BEFORE moving the dragged card
      const sourceCardIds = tx
        .select({ id: cards.id, position: cards.position })
        .from(cards)
        .where(eq(cards.listId, sourceListId))
        .orderBy(cards.position)
        .all()

      // Step 2: Move the card to the target list if it's a different list
      if (sourceListId !== targetListId) {

        // First, move the card to the target list (we'll set the correct position later)
        tx
          .update(cards)
          .set({ listId: targetListId })
          .where(eq(cards.id, cardId))
          .run()

        // Step 3: Reorder remaining cards in source list (exclude moved card)
        const remainingSourceCards = sourceCardIds.filter((card) => card.id !== cardId)
        for (const [index, card] of remainingSourceCards.entries()) {
          tx
            .update(cards)
            .set({ position: index })
            .where(eq(cards.id, card.id))
            .run()
        }

        // Step 4: Get all cards from target list (now including the moved card)
        const targetCardIds = tx
          .select({ id: cards.id, position: cards.position })
          .from(cards)
          .where(eq(cards.listId, targetListId))
          .orderBy(cards.position)
          .all()

        // Insert the moved card at the new position
        const reordered: { id: string }[] = targetCardIds
          .filter((card) => card.id !== cardId)
          .map((card) => ({ id: card.id }))

        reordered.splice(newPosition, 0, { id: cardId })

        // Update positions for all cards in target list (including the moved card)
        for (const [index, card] of reordered.entries()) {
          tx
            .update(cards)
            .set({ position: index })
            .where(eq(cards.id, card.id))
            .run()
        }
      } else {
        // Step 5: Same list - just reorder
        const reordered: { id: string }[] = sourceCardIds
          .filter((card) => card.id !== cardId)
          .map((card) => ({ id: card.id }))

        reordered.splice(newPosition, 0, { id: cardId })

        // Update positions for all cards in the list
        for (const [index, card] of reordered.entries()) {
          tx
            .update(cards)
            .set({ position: index })
            .where(eq(cards.id, card.id))
            .run()
        }
      }
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Failed to move card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to move card',
    })
  }
})
