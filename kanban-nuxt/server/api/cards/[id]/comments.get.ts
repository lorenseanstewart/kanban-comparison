import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../utils/db'
import { comments, users } from '../../../../drizzle/schema'

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
    const cardComments = await db.select().from(comments).where(eq(comments.cardId, cardId))

    const allUsers = await db.select().from(users)

    const commentsWithAuthors = cardComments.map((comment) => {
      const author = allUsers.find((u) => u.id === comment.userId)
      return {
        ...comment,
        author: author || null,
      }
    })

    return commentsWithAuthors
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch comments',
    })
  }
})
