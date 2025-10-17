import * as v from 'valibot'
import { eq } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { cards, cardTags } from '../../../../drizzle/schema'
import { CardUpdateSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const cardId = getRouterParam(event, 'id')

  if (!cardId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Card ID is required',
    })
  }

  try {
    const rawBody = await readRawBody(event, 'utf-8')
    const body = rawBody ? JSON.parse(rawBody) : null

    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body is required and must be an object',
      })
    }

    const result = v.safeParse(CardUpdateSchema, body)
    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.issues[0].message,
      })
    }

    const updateData: any = {}
    if (result.output.title !== undefined) updateData.title = result.output.title
    if (result.output.description !== undefined) updateData.description = result.output.description
    if (result.output.assigneeId !== undefined) updateData.assigneeId = result.output.assigneeId

    if (Object.keys(updateData).length > 0) {
      await db.update(cards).set(updateData).where(eq(cards.id, cardId))
    }

    if (result.output.tagIds !== undefined) {
      await db.delete(cardTags).where(eq(cardTags.cardId, cardId))

      if (result.output.tagIds.length > 0) {
        await db.insert(cardTags).values(
          result.output.tagIds.map((tagId) => ({
            cardId,
            tagId,
          }))
        )
      }
    }

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Failed to update card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update card',
    })
  }
})
