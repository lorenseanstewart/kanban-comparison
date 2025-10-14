import * as v from 'valibot'
import { comments } from '../../../../drizzle/schema'
import { CommentSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const cardId = getRouterParam(event, 'id')

  if (!cardId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Card ID is required',
    })
  }

  try {
    const body = await readBody(event)

    const result = v.safeParse(CommentSchema, { ...body, cardId })
    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.issues[0].message,
      })
    }

    const commentId = crypto.randomUUID()
    const createdAt = new Date()

    await db.insert(comments).values({
      id: commentId,
      text: result.output.text,
      cardId: result.output.cardId,
      userId: result.output.userId,
      createdAt,
    })

    return {
      success: true,
      comment: {
        id: commentId,
        userId: result.output.userId,
        text: result.output.text,
        cardId: result.output.cardId,
        createdAt: createdAt.toISOString(),
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Failed to create comment:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create comment',
    })
  }
})
