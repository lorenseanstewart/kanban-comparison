import { eq, inArray, asc } from "drizzle-orm";
import { getDatabase } from "./index";
import {
  boards,
  lists,
  cards,
  tags,
  comments,
  cardTags,
  users,
  type Board,
  type List,
  type Card,
  type Comment,
  type Tag,
} from "../../drizzle/schema";

export type BoardSummary = Pick<Board, "id" | "title" | "description">;

export type BoardDetails = BoardSummary & {
  lists: Array<
    Pick<List, "id" | "title" | "position"> & {
      cards: Array<
        Pick<
          Card,
          | "id"
          | "title"
          | "description"
          | "position"
          | "completed"
          | "assigneeId"
        > & {
          tags: Array<Pick<Tag, "id" | "name" | "color">>;
          comments: Array<
            Pick<Comment, "id" | "userId" | "text" | "createdAt">
          >;
        }
      >;
    }
  >;
};

export type BoardList = BoardDetails["lists"][number];
export type BoardCard = BoardList["cards"][number];
export type UsersList = Array<{ id: string; name: string }>;
export type TagsList = Array<Pick<Tag, "id" | "name" | "color">>;

export async function getBoards(d1: D1Database): Promise<BoardSummary[]> {
  const db = getDatabase(d1);
  const rows = await db
    .select({
      id: boards.id,
      title: boards.title,
      description: boards.description,
    })
    .from(boards)
    .orderBy(asc(boards.createdAt));
  return rows;
}

export async function getBoard(d1: D1Database, boardId: string): Promise<BoardDetails | null> {
  const db = getDatabase(d1);
  const boardRows = await db
    .select({
      id: boards.id,
      title: boards.title,
      description: boards.description,
    })
    .from(boards)
    .where(eq(boards.id, boardId));

  const board = boardRows[0];

  if (!board) {
    return null;
  }

  const listRows = await db
    .select({
      id: lists.id,
      title: lists.title,
      position: lists.position,
    })
    .from(lists)
    .where(eq(lists.boardId, boardId))
    .orderBy(asc(lists.position));

  if (listRows.length === 0) {
    return { ...board, lists: [] };
  }

  const listIds = listRows.map((list) => list.id);
  const cardRows = await db
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
    .orderBy(asc(cards.position));

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

  const tagsByCard = new Map<
    string,
    Array<Pick<Tag, "id" | "name" | "color">>
  >();
  for (const row of tagRows) {
    const list = tagsByCard.get(row.cardId);
    const entry = {
      id: row.tagId,
      name: row.tagName,
      color: row.tagColor,
    } as Pick<Tag, "id" | "name" | "color">;
    if (list) {
      list.push(entry);
    } else {
      tagsByCard.set(row.cardId, [entry]);
    }
  }

  const commentsByCard = new Map<
    string,
    Array<Pick<Comment, "id" | "userId" | "text" | "createdAt">>
  >();
  for (const row of commentRows) {
    const entry = {
      id: row.id,
      userId: row.userId,
      text: row.text,
      createdAt: row.createdAt,
    } as Pick<Comment, "id" | "userId" | "text" | "createdAt">;
    const list = commentsByCard.get(row.cardId);
    if (list) {
      list.push(entry);
    } else {
      commentsByCard.set(row.cardId, [entry]);
    }
  }

  return {
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
}

export async function getUsers(d1: D1Database) {
  const db = getDatabase(d1);
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.name));
}

export async function getTags(d1: D1Database) {
  const db = getDatabase(d1);
  return db
    .select({ id: tags.id, name: tags.name, color: tags.color })
    .from(tags)
    .orderBy(asc(tags.name));
}
