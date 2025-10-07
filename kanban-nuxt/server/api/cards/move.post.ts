import { eq, inArray } from 'drizzle-orm'
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

    await db.transaction(async (tx) => {
      if (sourceListId !== targetListId) {
        await tx
          .update(cards)
          .set({ listId: targetListId })
          .where(eq(cards.id, cardId))
      }

      const sourceCardIds = await tx
        .select({ id: cards.id })
        .from(cards)
        .where(eq(cards.listId, sourceListId))
        .orderBy(cards.position)

      for (const [index, card] of sourceCardIds.entries()) {
        await tx
          .update(cards)
          .set({ position: index })
          .where(eq(cards.id, card.id))
      }

      const targetCardIds = await tx
        .select({ id: cards.id })
        .from(cards)
        .where(eq(cards.listId, targetListId))
        .orderBy(cards.position)

      const reordered: { id: string }[] = targetCardIds
        .filter((card) => card.id !== cardId)
        .map((card) => ({ id: card.id }))

      reordered.splice(newPosition, 0, { id: cardId })

      for (const [index, card] of reordered.entries()) {
        await tx
          .update(cards)
          .set({ position: index })
          .where(eq(cards.id, card.id))
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
