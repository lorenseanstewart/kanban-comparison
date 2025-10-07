import { eq, asc, inArray } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { boards, lists, cards, users, tags, cardTags, comments } from '../../../../drizzle/schema'

export default defineEventHandler(async (event) => {
  const boardId = getRouterParam(event, 'id')

  if (!boardId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Board ID is required',
    })
  }

  try {
    const [boardRecord] = await db.select().from(boards).where(eq(boards.id, boardId))

    if (!boardRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Board not found',
      })
    }

    const boardLists = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, boardId))
      .orderBy(asc(lists.position))

    const listIds = boardLists.map((list) => list.id)
    const allUsers = await db.select().from(users)
    const allTags = await db.select().from(tags)

    const boardCards = listIds.length
      ? await db
          .select()
          .from(cards)
          .where(inArray(cards.listId, listIds))
          .orderBy(asc(cards.position))
      : []

    const cardIds = boardCards.map((card) => card.id)

    const cardTagRows = cardIds.length
      ? await db.select().from(cardTags).where(inArray(cardTags.cardId, cardIds))
      : []

    const commentRows = cardIds.length
      ? await db.select().from(comments).where(inArray(comments.cardId, cardIds)).orderBy(asc(comments.createdAt))
      : []

    const tagsByCard = new Map<string, typeof allTags>()
    for (const relation of cardTagRows) {
      const tag = allTags.find((t) => t.id === relation.tagId)
      if (!tag) continue
      const list = tagsByCard.get(relation.cardId) ?? []
      tagsByCard.set(relation.cardId, [...list, tag])
    }

    const commentsByCard = new Map<string, typeof commentRows>()
    for (const comment of commentRows) {
      const list = commentsByCard.get(comment.cardId) ?? []
      commentsByCard.set(comment.cardId, [...list, comment])
    }

    const listsWithCards = boardLists.map((list) => {
      const cardsForList = boardCards.filter((card) => card.listId === list.id).map((card) => ({
        ...card,
        tags: tagsByCard.get(card.id) ?? [],
        comments: commentsByCard.get(card.id) ?? [],
      }))

      return {
        ...list,
        cards: cardsForList,
      }
    })

    return {
      board: boardRecord,
      lists: listsWithCards,
      users: allUsers,
      tags: allTags,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Failed to fetch board:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch board',
    })
  }
})
