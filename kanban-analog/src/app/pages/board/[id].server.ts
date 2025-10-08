import { PageServerLoad } from '@analogjs/router';
import { db } from '../../../server/db/index';
import { boards, lists, cards, tags, cardTags, comments, users } from '../../../../drizzle/schema';
import { eq, inArray, asc } from 'drizzle-orm';
import type { Tag, Comment } from '../../../../drizzle/schema';

export const load = async ({ params }: PageServerLoad) => {
  const id = params?.['id'];

  if (!id) {
    throw new Error('Board ID is required');
  }

  // Get board
  const board = await db
    .select({
      id: boards.id,
      title: boards.title,
      description: boards.description,
    })
    .from(boards)
    .where(eq(boards.id, id))
    .get();

  if (!board) {
    throw new Error('Board not found');
  }

  // Get lists
  const listRows = await db
    .select({
      id: lists.id,
      title: lists.title,
      position: lists.position,
    })
    .from(lists)
    .where(eq(lists.boardId, id))
    .orderBy(asc(lists.position));

  // Get cards
  const listIds = listRows.map((list) => list.id);
  const cardRows = listIds.length
    ? await db
        .select({
          id: cards.id,
          title: cards.title,
          description: cards.description,
          position: cards.position,
          completed: cards.completed,
          assigneeId: cards.assigneeId,
          listId: cards.listId,
        })
        .from(cards)
        .where(inArray(cards.listId, listIds))
        .orderBy(asc(cards.position))
    : [];

  // Get tags and comments
  const cardIds = cardRows.map((card) => card.id);
  const tagRows = cardIds.length
    ? await db
        .select({
          cardId: cardTags.cardId,
          tagId: tags.id,
          tagName: tags.name,
          tagColor: tags.color,
        })
        .from(cardTags)
        .innerJoin(tags, eq(cardTags.tagId, tags.id))
        .where(inArray(cardTags.cardId, cardIds))
    : [];

  const commentRows = cardIds.length
    ? await db
        .select({
          id: comments.id,
          cardId: comments.cardId,
          userId: comments.userId,
          text: comments.text,
          createdAt: comments.createdAt,
        })
        .from(comments)
        .where(inArray(comments.cardId, cardIds))
        .orderBy(asc(comments.createdAt))
    : [];

  // Get all users
  const allUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.name));

  // Get all tags
  const allTags = await db
    .select({ id: tags.id, name: tags.name, color: tags.color })
    .from(tags)
    .orderBy(asc(tags.name));

  // Group tags by card
  const tagsByCard = new Map<string, Array<Pick<Tag, 'id' | 'name' | 'color'>>>();
  for (const row of tagRows) {
    const list = tagsByCard.get(row.cardId);
    const entry = {
      id: row.tagId,
      name: row.tagName,
      color: row.tagColor,
    } as Pick<Tag, 'id' | 'name' | 'color'>;
    if (list) {
      list.push(entry);
    } else {
      tagsByCard.set(row.cardId, [entry]);
    }
  }

  // Group comments by card
  const commentsByCard = new Map<string, Array<Pick<Comment, 'id' | 'userId' | 'text' | 'createdAt'>>>();
  for (const row of commentRows) {
    const entry = {
      id: row.id,
      userId: row.userId,
      text: row.text,
      createdAt: row.createdAt,
    } as Pick<Comment, 'id' | 'userId' | 'text' | 'createdAt'>;
    const list = commentsByCard.get(row.cardId);
    if (list) {
      list.push(entry);
    } else {
      commentsByCard.set(row.cardId, [entry]);
    }
  }

  // Build the response
  const boardData = {
    ...board,
    lists: listRows.map((list) => ({
      ...list,
      cards: cardRows
        .filter((card) => card.listId === list.id)
        .map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          position: card.position,
          completed: card.completed,
          assigneeId: card.assigneeId,
          tags: tagsByCard.get(card.id) ?? [],
          comments: commentsByCard.get(card.id) ?? [],
        })),
    })),
  };

  return {
    board: boardData,
    allUsers,
    allTags,
  };
};
