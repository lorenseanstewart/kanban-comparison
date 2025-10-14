import { eq, inArray, asc, max } from "drizzle-orm";
import { db } from "./db";
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

export async function getBoards(): Promise<BoardSummary[]> {
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

export async function getBoard(boardId: string): Promise<BoardDetails | null> {
  const board = await db
    .select({
      id: boards.id,
      title: boards.title,
      description: boards.description,
    })
    .from(boards)
    .where(eq(boards.id, boardId))
    .get();

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

export async function getUsers() {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.name));
}

export async function getTags() {
  return db
    .select({ id: tags.id, name: tags.name, color: tags.color })
    .from(tags)
    .orderBy(asc(tags.name));
}

export async function createBoard(data: { title: string; description: string | null }) {
  const boardId = crypto.randomUUID();

  await db.insert(boards).values({
    id: boardId,
    title: data.title,
    description: data.description,
  });

  // Create the four default lists for the board
  const listTitles = ["Todo", "In-Progress", "QA", "Done"];
  await db.insert(lists).values(
    listTitles.map((listTitle, index) => ({
      id: crypto.randomUUID(),
      boardId,
      title: listTitle,
      position: index + 1,
    }))
  );

  return { id: boardId, title: data.title, description: data.description };
}

export async function createCard(data: {
  boardId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  tagIds: string[];
}) {
  // Find the Todo list for this board
  const todoLists = await db
    .select()
    .from(lists)
    .where(eq(lists.boardId, data.boardId));

  const todoList = todoLists.find((list) => list.title === "Todo");

  if (!todoList) {
    throw new Error("Todo list not found for this board");
  }

  // Get the highest position in the Todo list
  const maxPositionResult = await db
    .select({ maxPos: max(cards.position) })
    .from(cards)
    .where(eq(cards.listId, todoList.id));

  const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

  // Create the card
  const cardId = crypto.randomUUID();

  // Use a transaction to create card and tags atomically
  db.transaction((tx) => {
    tx.insert(cards)
      .values({
        id: cardId,
        listId: todoList.id,
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        position: nextPosition,
        completed: false,
      })
      .run();

    // Add tags if any
    if (data.tagIds && data.tagIds.length > 0) {
      tx.insert(cardTags)
        .values(
          data.tagIds.map((tagId) => ({
            cardId,
            tagId,
          }))
        )
        .run();
    }
  });

  return { id: cardId };
}

export async function updateCard(data: {
  cardId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  tagIds: string[];
}) {
  // Use a transaction to update card and tags atomically
  db.transaction((tx) => {
    // Update card basic fields
    tx.update(cards)
      .set({
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
      })
      .where(eq(cards.id, data.cardId))
      .run();

    // Update tags - delete existing and insert new ones
    tx.delete(cardTags).where(eq(cardTags.cardId, data.cardId)).run();

    if (data.tagIds && data.tagIds.length > 0) {
      tx.insert(cardTags)
        .values(
          data.tagIds.map((tagId) => ({
            cardId: data.cardId,
            tagId,
          }))
        )
        .run();
    }
  });
}

export async function addComment(data: {
  cardId: string;
  userId: string;
  text: string;
}) {
  const commentId = crypto.randomUUID();

  await db.insert(comments).values({
    id: commentId,
    cardId: data.cardId,
    userId: data.userId,
    text: data.text,
  });

  return { id: commentId };
}

export async function updateCardPositions(updates: Array<{ cardId: string; listId: string; position: number }>) {
  db.transaction((tx) => {
    for (const update of updates) {
      tx.update(cards)
        .set({ listId: update.listId, position: update.position })
        .where(eq(cards.id, update.cardId))
        .run();
    }
  });
}
