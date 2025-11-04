import { useDatabase } from '../../utils/db'
import { boards } from '../../../drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const d1 = event.context.cloudflare?.env?.DB as D1Database | undefined
    const db = useDatabase(d1)
    const allBoards = await db.select({
      id: boards.id,
      title: boards.title,
      description: boards.description,
    }).from(boards)

    return allBoards
  } catch (error) {
    console.error('Failed to fetch boards:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch boards',
    })
  }
})
