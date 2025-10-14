import { db } from '../../utils/db'
import { boards } from '../../../drizzle/schema'

export default defineEventHandler(async () => {
  try {
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
