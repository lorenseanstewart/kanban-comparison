import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../utils/db'
import { cards } from '../../../../drizzle/schema'

export default defineEventHandler(async (event) => {
  const cardId = getRouterParam(event, 'id')

  if (!cardId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Card ID is required',
    })
  }

  try {
    const d1 = event.context.cloudflare?.env?.DB as D1Database | undefined
    const db = useDatabase(d1)
    await db.delete(cards).where(eq(cards.id, cardId))

    return { success: true }
  } catch (error) {
    console.error('Failed to delete card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete card',
    })
  }
})
