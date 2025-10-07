import * as v from 'valibot'
import { eq, max } from 'drizzle-orm'
import { cards, cardTags, lists } from '../../../drizzle/schema'
import { CardSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.boardId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Board ID is required',
      })
    }

    const result = v.safeParse(CardSchema, body)
    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.issues[0].message,
      })
    }

    // Find the Todo list for this board
    const boardLists = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, body.boardId))

    const todoList = boardLists.find((list) => list.title === 'Todo')

    if (!todoList) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Todo list not found for this board',
      })
    }

    // Get the highest position in the Todo list
    const maxPositionResult = await db
      .select({ maxPos: max(cards.position) })
      .from(cards)
      .where(eq(cards.listId, todoList.id))

    const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1

    const cardId = crypto.randomUUID()

    await db.insert(cards).values({
      id: cardId,
      title: result.output.title,
      description: result.output.description ?? null,
      listId: todoList.id,
      assigneeId: result.output.assigneeId ?? null,
      position: nextPosition,
      completed: false,
    })

    if (result.output.tagIds && result.output.tagIds.length > 0) {
      await db.insert(cardTags).values(
        result.output.tagIds.map((tagId) => ({
          cardId,
          tagId,
        }))
      )
    }

    return {
      success: true,
      cardId,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Failed to create card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create card',
    })
  }
})
