import { eq, max } from 'drizzle-orm'
import { useDatabase } from '../../utils/db'
import { cards } from '../../../drizzle/schema'

interface MoveCardPayload {
  cardId: string
  targetListId: string
}

export default defineEventHandler(async (event) => {
  try {
    const db = useDatabase()
    const body = await readBody<MoveCardPayload>(event)
    const { cardId, targetListId } = body

    if (!cardId || !targetListId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      })
    }

    // Get the highest position in the target list
    const maxPositionResults = await db
      .select({ maxPos: max(cards.position) })
      .from(cards)
      .where(eq(cards.listId, targetListId))

    const maxPositionResult = maxPositionResults[0]
    const newPosition = (maxPositionResult?.maxPos ?? -1) + 1

    // Move the card to the target list with the new position
    await db
      .update(cards)
      .set({ listId: targetListId, position: newPosition })
      .where(eq(cards.id, cardId))

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
