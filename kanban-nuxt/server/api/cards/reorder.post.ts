import { eq } from 'drizzle-orm'
import { useDatabase } from '../../utils/db'
import { cards } from '../../../drizzle/schema'

interface ReorderPayload {
  cardIds: string[]
  listId: string
}

export default defineEventHandler(async (event) => {
  try {
    const d1 = event.context.cloudflare?.env?.DB as D1Database | undefined
    const db = useDatabase(d1)
    const body = await readBody<ReorderPayload>(event)
    const { cardIds, listId } = body

    if (!cardIds || !Array.isArray(cardIds) || !listId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      })
    }

    // Update positions for all cards in the order they appear in cardIds
    db.transaction((tx) => {
      cardIds.forEach((cardId, index) => {
        tx.update(cards)
          .set({ position: index })
          .where(eq(cards.id, cardId))
          .run()
      })
    })

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
