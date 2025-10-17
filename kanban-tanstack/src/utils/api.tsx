import { createServerFn } from '@tanstack/react-start'
import { eq, max } from 'drizzle-orm'
import { db } from '../lib/db'
import { boards, lists, cards, cardTags, comments } from '../../drizzle/schema'
import * as v from 'valibot'
import {
  BoardSchema,
  CardSchema,
  CardUpdateSchema,
  CommentSchema,
} from '../lib/validation'

// Fetch all boards
export const fetchBoards = createServerFn().handler(async () => {
  const allBoards = await db.select().from(boards)
  return allBoards
})

// Fetch single board with all related data
export const fetchBoard = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: boardId }) => {
    const board = await db.select().from(boards).where(eq(boards.id, boardId))

    if (!board || board.length === 0) {
      return null
    }

    const allLists = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, boardId))

    const allCards = await db
      .select()
      .from(cards)
      .where(
        eq(
          cards.listId,
          allLists[0]?.id || '',
        ),
      )

    // Get all cards for all lists in the board
    const listsWithCards = await Promise.all(
      allLists.map(async (list) => {
        const listCards = await db
          .select()
          .from(cards)
          .where(eq(cards.listId, list.id))
          .orderBy(cards.position)

        // Get tags for each card
        const cardsWithTags = await Promise.all(
          listCards.map(async (card) => {
            const { tags } = await import('../../drizzle/schema')
            const cardTagsData = await db
              .select({
                tagId: tags.id,
                tagName: tags.name,
                tagColor: tags.color,
              })
              .from(cardTags)
              .innerJoin(tags, eq(cardTags.tagId, tags.id))
              .where(eq(cardTags.cardId, card.id))

            const cardComments = await db
              .select()
              .from(comments)
              .where(eq(comments.cardId, card.id))

            return {
              ...card,
              tags: cardTagsData.map((t) => ({
                id: t.tagId,
                name: t.tagName,
                color: t.tagColor,
              })),
              comments: cardComments,
            }
          }),
        )

        return {
          ...list,
          cards: cardsWithTags,
        }
      }),
    )

    return {
      ...board[0],
      lists: listsWithCards,
    }
  })

// Fetch all users
export const fetchUsers = createServerFn().handler(async () => {
  const { users } = await import('../../drizzle/schema')
  const allUsers = await db.select().from(users)
  return allUsers
})

// Fetch all tags
export const fetchTags = createServerFn().handler(async () => {
  const { tags } = await import('../../drizzle/schema')
  const allTags = await db.select().from(tags)
  return allTags
})

// Create board
type CreateBoardInput = {
  title: string
  description: string | null
}

export const createBoard = createServerFn({ method: 'POST' })
  .inputValidator((d: CreateBoardInput) => d)
  .handler(async ({ data }) => {
    try {
      // Validate with Valibot
      const result = v.safeParse(BoardSchema, {
        title: data.title,
        description: data.description || null,
      })

      if (!result.success) {
        const firstIssue = result.issues[0]
        return { success: false, error: firstIssue.message }
      }

      // Create the board
      const boardId = crypto.randomUUID()

      await db.insert(boards).values({
        id: boardId,
        title: result.output.title,
        description: result.output.description,
      })

      // Create the four default lists for the board
      const listTitles = ['Todo', 'In-Progress', 'QA', 'Done']
      await db.insert(lists).values(
        listTitles.map((listTitle, index) => ({
          id: crypto.randomUUID(),
          boardId,
          title: listTitle,
          position: index + 1,
        })),
      )

      return {
        success: true,
        data: {
          id: boardId,
          title: result.output.title,
          description: result.output.description,
        },
      }
    } catch (error) {
      console.error('Failed to create board:', error)
      return {
        success: false,
        error: 'Failed to create board. Please try again.',
      }
    }
  })

// Update card
type UpdateCardInput = {
  cardId: string
  title: string
  description: string | null
  assigneeId: string | null
  tagIds: string[]
}

export const updateCard = createServerFn({ method: 'POST' })
  .inputValidator((d: UpdateCardInput) => d)
  .handler(async ({ data }) => {
    try {
      // Validate with Valibot
      const result = v.safeParse(CardUpdateSchema, {
        cardId: data.cardId,
        title: data.title,
        description: data.description || null,
        assigneeId: data.assigneeId || null,
        tagIds: data.tagIds,
      })

      if (!result.success) {
        const firstIssue = result.issues[0]
        throw new Error(firstIssue.message)
      }

      // Use a transaction to update card and tags atomically
      db.transaction((tx) => {
        // Update card basic fields
        tx.update(cards)
          .set({
            title: result.output.title,
            description: result.output.description,
            assigneeId: result.output.assigneeId,
          })
          .where(eq(cards.id, result.output.cardId))
          .run()

        // Update tags - delete existing and insert new ones
        tx.delete(cardTags).where(eq(cardTags.cardId, result.output.cardId)).run()

        if (result.output.tagIds && result.output.tagIds.length > 0) {
          tx.insert(cardTags)
            .values(
              result.output.tagIds.map((tagId) => ({
                cardId: result.output.cardId,
                tagId,
              })),
            )
            .run()
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to update card:', error)
      throw new Error('Failed to update card. Please try again.')
    }
  })

// Add comment
type AddCommentInput = {
  cardId: string
  userId: string
  text: string
}

export const addComment = createServerFn({ method: 'POST' })
  .inputValidator((d: AddCommentInput) => d)
  .handler(async ({ data }) => {
    try {
      // Validate with Valibot
      const result = v.safeParse(CommentSchema, {
        cardId: data.cardId,
        userId: data.userId,
        text: data.text,
      })

      if (!result.success) {
        const firstIssue = result.issues[0]
        throw new Error(firstIssue.message)
      }

      const commentId = crypto.randomUUID()

      await db.insert(comments).values({
        id: commentId,
        cardId: result.output.cardId,
        userId: result.output.userId,
        text: result.output.text,
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw new Error('Failed to add comment. Please try again.')
    }
  })

// Create card
type CreateCardInput = {
  boardId: string
  title: string
  description: string | null
  assigneeId: string | null
  tagIds: string[]
}

export const createCard = createServerFn({ method: 'POST' })
  .inputValidator((d: CreateCardInput) => d)
  .handler(async ({ data }) => {
    try {
      if (!data.boardId) {
        return { success: false, error: 'Board ID is required' }
      }

      // Validate with Valibot
      const result = v.safeParse(CardSchema, {
        title: data.title,
        description: data.description || null,
        assigneeId: data.assigneeId || null,
        tagIds: data.tagIds,
      })

      if (!result.success) {
        const firstIssue = result.issues[0]
        return { success: false, error: firstIssue.message }
      }

      // Find the Todo list for this board
      const todoLists = await db
        .select()
        .from(lists)
        .where(eq(lists.boardId, data.boardId))

      const todoList = todoLists.find((list) => list.title === 'Todo')

      if (!todoList) {
        return { success: false, error: 'Todo list not found for this board' }
      }

      // Get the highest position in the Todo list
      const maxPositionResult = await db
        .select({ maxPos: max(cards.position) })
        .from(cards)
        .where(eq(cards.listId, todoList.id))

      const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1

      // Create the card
      const cardId = crypto.randomUUID()

      // Use a transaction to create card and tags atomically
      db.transaction((tx) => {
        tx.insert(cards)
          .values({
            id: cardId,
            listId: todoList.id,
            title: result.output.title,
            description: result.output.description,
            assigneeId: result.output.assigneeId,
            position: nextPosition,
            completed: false,
          })
          .run()

        // Add tags if any
        if (result.output.tagIds && result.output.tagIds.length > 0) {
          tx.insert(cardTags)
            .values(
              result.output.tagIds.map((tagId) => ({
                cardId,
                tagId,
              })),
            )
            .run()
        }
      })

      return { success: true, data: { id: cardId } }
    } catch (error) {
      console.error('Failed to create card:', error)
      return {
        success: false,
        error: 'Failed to create card. Please try again.',
      }
    }
  })

// Update card list (for moving cards)
type UpdateCardListInput = {
  cardId: string
  newListId: string
  newPosition?: number
}

export const updateCardList = createServerFn({ method: 'POST' })
  .inputValidator((d: UpdateCardListInput) => d)
  .handler(async ({ data }) => {
    try {
      const updateData: { listId: string; position?: number } = {
        listId: data.newListId,
      }

      if (data.newPosition !== undefined) {
        updateData.position = data.newPosition
      }

      await db.update(cards).set(updateData).where(eq(cards.id, data.cardId))

      return { success: true }
    } catch (error) {
      console.error('Failed to update card list:', error)
      throw new Error('Failed to move card. Please try again.')
    }
  })

// Update card positions
type UpdateCardPositionsInput = {
  cardIds: string[]
}

export const updateCardPositions = createServerFn({ method: 'POST' })
  .inputValidator((d: UpdateCardPositionsInput) => d)
  .handler(async ({ data }) => {
    try {
      // Update each card's position based on its index in the array
      await Promise.all(
        data.cardIds.map((cardId, index) =>
          db.update(cards).set({ position: index }).where(eq(cards.id, cardId)),
        ),
      )

      return { success: true }
    } catch (error) {
      console.error('Failed to update card positions:', error)
      throw new Error('Failed to reorder cards. Please try again.')
    }
  })

// Delete card
export const deleteCard = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: cardId }) => {
    try {
      if (!cardId) {
        return { success: false, error: 'Card ID is required' }
      }

      await db.delete(cards).where(eq(cards.id, cardId))

      return { success: true }
    } catch (error) {
      console.error('Failed to delete card:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete card. Please try again.',
      }
    }
  })
