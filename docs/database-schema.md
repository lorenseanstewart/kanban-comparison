# Database Schema

This document describes the SQLite database schema using Drizzle ORM.

## Entity Relationship Diagram

```
┌─────────┐
│  Users  │
└────┬────┘
     │
     ├──────────┐
     │          │
     ▼          ▼
┌─────────┐  ┌──────────┐
│  Cards  │  │ Comments │
│(assignee)│  └──────────┘
└────┬────┘
     │
     ├──────────┬──────────┐
     │          │          │
     ▼          ▼          ▼
┌────────┐ ┌─────────┐ ┌──────────┐
│ Lists  │ │CardTags │ │   Tags   │
└───┬────┘ └─────────┘ └──────────┘
    │
    ▼
┌────────┐
│ Boards │
└────────┘
```

## Tables

### users

Static user entities for assignment and authorship.

```typescript
{
  id: text('id').primaryKey(),           // e.g., "user-loren"
  name: text('name').notNull(),          // e.g., "Loren"
}
```

**Relationships:**
- One user can be assigned to many cards
- One user can author many comments

---

### boards

Top-level containers for organizing work.

```typescript
{
  id: text('id').primaryKey(),           // UUID
  title: text('title').notNull(),        // Board name
  description: text('description'),      // Optional description
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}
```

**Relationships:**
- One board has many lists
- Cascade delete: deleting a board deletes all its lists and their cards

---

### lists

Fixed columns within a board (Todo, In-Progress, QA, Done).

```typescript
{
  id: text('id').primaryKey(),           // UUID
  boardId: text('board_id').notNull()    // Foreign key to boards
    .references(() => boards.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),        // List name
  position: integer('position').notNull(), // Order within board
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}
```

**Indexes:**
- `lists_board_id_idx` on `boardId` (for board queries)
- `lists_position_idx` on `position` (for ordering)

**Relationships:**
- Many lists belong to one board
- One list has many cards
- Cascade delete: deleting a list deletes all its cards

---

### cards

Draggable tasks with metadata.

```typescript
{
  id: text('id').primaryKey(),           // UUID
  listId: text('list_id').notNull()      // Foreign key to lists
    .references(() => lists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),        // Card title
  description: text('description'),      // Optional description
  assigneeId: text('assignee_id')        // Foreign key to users (nullable)
    .references(() => users.id, { onDelete: 'set null' }),
  position: integer('position').notNull(), // Order within list
  completed: integer('completed', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}
```

**Indexes:**
- `cards_list_id_idx` on `listId` (for list queries)
- `cards_position_idx` on `position` (for ordering)
- `cards_assignee_id_idx` on `assigneeId` (for user queries)

**Relationships:**
- Many cards belong to one list
- One card can be assigned to one user (optional)
- One card can have many tags (via CardTags junction)
- One card can have many comments
- Set null: deleting a user sets `assigneeId` to null

---

### tags

Global labels with colors for categorization.

```typescript
{
  id: text('id').primaryKey(),           // UUID
  name: text('name').notNull(),          // Tag name (e.g., "Design")
  color: text('color').notNull(),        // Hex color (e.g., "#8B5CF6")
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}
```

**Relationships:**
- Many tags can be applied to many cards (via CardTags junction)

---

### cardTags

Many-to-many junction table between cards and tags.

```typescript
{
  cardId: text('card_id').notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
}
```

**Primary Key:** Composite key on `(cardId, tagId)`

**Indexes:**
- `card_tags_card_id_idx` on `cardId`
- `card_tags_tag_id_idx` on `tagId`

**Relationships:**
- Cascade delete: deleting a card or tag removes the association

---

### comments

Text notes on cards with authorship.

```typescript
{
  id: text('id').primaryKey(),           // UUID
  cardId: text('card_id').notNull()      // Foreign key to cards
    .references(() => cards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull()      // Foreign key to users
    .references(() => users.id, { onDelete: 'set null' }),
  text: text('text').notNull(),          // Comment content
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}
```

**Indexes:**
- `comments_card_id_idx` on `cardId`
- `comments_user_id_idx` on `userId`
- `comments_created_at_idx` on `createdAt` (for chronological sorting)

**Relationships:**
- Many comments belong to one card
- One comment is authored by one user
- Cascade delete: deleting a card deletes its comments

---

## Key Design Decisions

### Text UUIDs as Primary Keys

```typescript
id: text('id').primaryKey()
```

**Rationale:**
- UUIDs prevent ID collisions in distributed systems
- Text type is more portable than INTEGER
- Client-side generation enables optimistic updates

### Integer Timestamps

```typescript
createdAt: integer('created_at', { mode: 'timestamp' })
```

**Rationale:**
- SQLite stores dates most efficiently as integers (Unix timestamps)
- Drizzle's `mode: 'timestamp'` auto-converts to/from JavaScript Date objects
- Easier to compare and sort than text date strings

### Position Fields

```typescript
position: integer('position').notNull()
```

**Rationale:**
- Explicit ordering field for deterministic sorting
- Indexed for fast ORDER BY queries
- Updated atomically during drag-and-drop

### Cascade Deletes

```typescript
onDelete: 'cascade'
```

**Rationale:**
- Referential integrity maintained automatically
- No orphaned records (cards without lists, etc.)
- Simplifies deletion logic (delete board → cascade to all children)

### Set Null on User Deletion

```typescript
assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' })
```

**Rationale:**
- Cards shouldn't be deleted when a user is removed
- Preserves historical work even if assignee no longer exists
- User ID can be set to null to indicate "Unassigned"

---

## Migrations

Drizzle Kit generates migration files from schema changes:

```bash
# Generate migration
npx drizzle-kit generate

# Apply to database
npx drizzle-kit push
```

Migration files are stored in `drizzle/migrations/`.

---

## Seed Data

The `src/db/seed.ts` script populates the database with sample data:

- 5 static users (Loren, Alex, Dolly, Bobby, Sofia)
- 2 boards (Product Launch, Website Refresh)
- 8 lists (4 per board: Todo, In-Progress, QA, Done)
- 16 cards with realistic titles, descriptions, and assignments
- 5 tags (Design, Product, Engineering, Marketing, QA)
- 32 comments across various cards

**Run seed:**
```bash
npm run seed
```

---

## Database File Location

```
./drizzle/db.sqlite
```

This file is gitignored but persists locally for development.

For production, consider:
- Persistent volume mounts (Docker)
- Managed SQLite services (Turso, LiteFS)
- Migration to PostgreSQL for scale
