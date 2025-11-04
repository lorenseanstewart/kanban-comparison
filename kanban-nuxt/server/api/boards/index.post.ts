import * as v from 'valibot'
import { useDatabase } from '../../utils/db'
import { boards, lists } from '../../../drizzle/schema'
import { BoardSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const db = useDatabase()
    const body = await readBody(event)

    const result = v.safeParse(BoardSchema, body)
    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.issues[0].message,
      })
    }

    const boardId = crypto.randomUUID()
    await db.insert(boards).values({
      id: boardId,
      title: result.output.title,
      description: result.output.description ?? null,
    })

    // Create the four default lists for the board
    const listTitles = ['Todo', 'In-Progress', 'QA', 'Done']
    await db.insert(lists).values(
      listTitles.map((listTitle, index) => ({
        id: crypto.randomUUID(),
        boardId,
        title: listTitle,
        position: index + 1,
      }))
    )

    return {
      success: true,
      boardId,
      title: result.output.title,
      description: result.output.description ?? null,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Failed to create board:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create board',
    })
  }
})
