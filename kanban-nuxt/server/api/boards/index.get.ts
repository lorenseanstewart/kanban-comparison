import { eq, count, sql } from 'drizzle-orm'
import { db } from '../../utils/db'
import { boards, lists, cards } from '../../../drizzle/schema'

export default defineEventHandler(async () => {
  try {
    const allBoards = await db.select().from(boards)

    const listCounts = await db
      .select({ boardId: lists.boardId, listCount: count(lists.id) })
      .from(lists)
      .groupBy(lists.boardId)

    const cardCounts = await db
      .select({ boardId: lists.boardId, cardCount: sql<number>`count(${cards.id})` })
      .from(lists)
      .leftJoin(cards, eq(cards.listId, lists.id))
      .groupBy(lists.boardId)

    const listCountMap = new Map(listCounts.map((row) => [row.boardId, row.listCount]))
    const cardCountMap = new Map(cardCounts.map((row) => [row.boardId, Number(row.cardCount)]))

    return allBoards.map((board) => ({
      id: board.id,
      title: board.title,
      description: board.description,
      listCount: listCountMap.get(board.id) ?? 0,
      cardCount: cardCountMap.get(board.id) ?? 0,
    }))
  } catch (error) {
    console.error('Failed to fetch boards:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch boards',
    })
  }
})
