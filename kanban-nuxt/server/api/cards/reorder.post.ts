import { eq } from 'drizzle-orm'
import { useDatabase } from '../../utils/db'
import { cards } from '../../../drizzle/schema'

interface ReorderPayload {
  cardIds: string[]
  listId: string
}

export default defineEventHandler(async (event) => {
  try {
    const db = useDatabase()
    const body = await readBody<ReorderPayload>(event)
    const { cardIds, listId } = body

    if (!cardIds || !Array.isArray(cardIds) || !listId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      })
    }

    // Update positions for all cards in the order they appear in cardIds
    for (let index = 0; index < cardIds.length; index++) {
      await db
        .update(cards)
        .set({ position: index })
        .where(eq(cards.id, cardIds[index]))
    }

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Failed to reorder cards:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reorder cards',
    })
  }
})
