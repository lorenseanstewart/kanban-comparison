import { pgTable, text, varchar, timestamp, integer, boolean, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const boards = pgTable('boards', {
  id: text('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const lists = pgTable('lists', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  boardIdIdx: index('lists_board_id_idx').on(table.boardId),
  positionIdx: index('lists_position_idx').on(table.position),
}));

export const cards = pgTable('cards', {
  id: text('id').primaryKey(),
  listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  position: integer('position').notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  listIdIdx: index('cards_list_id_idx').on(table.listId),
  positionIdx: index('cards_position_idx').on(table.position),
  assigneeIdx: index('cards_assignee_id_idx').on(table.assigneeId),
}));

export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const cardTags = pgTable('card_tags', {
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.cardId, table.tagId] }),
  cardIdIdx: index('card_tags_card_id_idx').on(table.cardId),
  tagIdIdx: index('card_tags_tag_id_idx').on(table.tagId),
}));

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'set null' }),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  cardIdIdx: index('comments_card_id_idx').on(table.cardId),
  userIdIdx: index('comments_user_id_idx').on(table.userId),
  createdAtIdx: index('comments_created_at_idx').on(table.createdAt),
}));

export const usersRelations = relations(users, ({ many }) => ({
  assignedCards: many(cards, { relationName: 'assignee' }),
  comments: many(comments, { relationName: 'author' }),
}));

export const boardsRelations = relations(boards, ({ many }) => ({
  lists: many(lists),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  board: one(boards, {
    fields: [lists.boardId],
    references: [boards.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  list: one(lists, {
    fields: [cards.listId],
    references: [lists.id],
  }),
  assignee: one(users, {
    fields: [cards.assigneeId],
    references: [users.id],
    relationName: 'assignee',
  }),
  tags: many(cardTags, { relationName: 'card' }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  card: one(cards, {
    fields: [comments.cardId],
    references: [cards.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
    relationName: 'author',
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  cards: many(cardTags, { relationName: 'tag' }),
}));

export type User = typeof users.$inferSelect;
export type Board = typeof boards.$inferSelect;
export type List = typeof lists.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
