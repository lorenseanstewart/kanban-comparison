# Trello Clone App Specifications

## Project Overview
This is a simplified Trello-inspired Kanban board application built with SolidStart (SolidJS full-stack framework). It demonstrates core features like draggable task cards, reactive state management, and real-time collaboration across browser tabs. The app uses SQLite for persistent storage via Drizzle ORM, with seeded initial data. There is no user authentication—users are static entities for assignment and authorship purposes. The primary goal is to evaluate bundle sizes in a decently complex, reactive app scenario: multiple nested components, global stores, API integrations, and WebSocket-based sync without external dependencies.

The app supports multiple boards, each with lists (columns) containing cards (tasks). Cards can be dragged between lists, assigned to static users, tagged, marked complete, and commented on. Real-time updates ensure changes (e.g., card moves, new comments) sync instantly across open tabs.

**Target Complexity**: Mid-sized app for bundle testing—~10-15 components, reactive stores for data (boards/lists/cards/tags/comments/users), server actions for mutations, and custom WebSocket for broadcasting changes. Estimated production bundle: 35-70KB gzipped (main + splits), focusing on SolidStart's efficiency with fine-grained reactivity.

## Key Features
- **Boards Dashboard**: View and navigate to all available boards (global access, no ownership).
- **Seeded users**: There will be five users (Loren, Alex, Dolly, Bobby, and Sofia).
- **Kanban Board View**: 
  - Display lists (columns) in horizontal order.
  - Cards within each list, ordered vertically.
  - Drag-and-drop cards between lists (updates position and list ID reactively).
  - Card details: Title, description, assignee (from static users), tags (colored badges), and comments list.
- **Card Management**:
  - Add new cards to a list via form (title, story points, and assignee required, optional description/tags).
  - Edit card: Update title/description, assign user, toggle completed, add/remove tags.
  - Delete cards (hard delete, cascades to comments/tags).
- **List Management**:
  - All boards have the same four lists: Todo, In-Progress, QA, Done
- **Board Analytics**:
  - Bar chart showing number of tickets per person
  - Pie chart of card states (i.e. the proportion of cards in each list: Todo, In-Progress, QA, Done)
- **Tags**:
  - Global tags (not board-specific) with name and color.
  - Assign multiple tags to cards; display as colored chips.
  - Add new tags dynamically (or seed initial set).
- **Comments**:
  - Add comments to cards (text only, authored by a selectable static user).
  - Display comments in chronological order (by creation timestamp).
  - Real-time append: New comments appear instantly in all connected views.
- **Real-Time Collaboration**:
  - Use custom WebSocket (native browser/Node APIs) for broadcasting mutations (e.g., card move, comment add, assignee change).
  - Optimistic updates: Local state changes immediately, then sync via WS to DB and other clients.
  - No user sessions—broadcast to all connected clients (simulate multi-tab collab).
- **Search/Filter (Basic)**:
  - Filter cards by assignee or tag (reactive input in board view).
- **Reactivity Focus**:
  - SolidJS signals/stores for global state (e.g., active board data updates on drag/comment).
  - Derived state: E.g., sorted lists/cards by position, computed completed stats.

## Data Model
The app uses a relational SQLite database managed by Drizzle ORM. Schema includes the following entities (DB tables):

- **Users**: Seeded with five static users (Loren, Alex, Dolly, Bobby, Sofia). Fields: `id` (UUID primary key), `name` (string). Used for card assignees and comment authors. No creation/deletion in app—read-only after seeding.
- **Boards**: Top-level containers. Fields: `id` (UUID), `title` (string, required), `description` (optional string), `createdAt` (timestamp). No ownership.
- **Lists**: Columns within a board. Fields: `id` (UUID), `boardId` (foreign key to boards, cascade delete), `title` (string constrained to `Todo`, `In-Progress`, `QA`, `Done`), `position` (integer for ordering), `createdAt` (timestamp).
- **Cards**: Tasks/draggable items. Fields: `id` (UUID), `listId` (foreign key to lists, cascade delete), `title` (string, required), `description` (optional string), `assigneeId` (optional foreign key to users, null on delete), `position` (integer for ordering within list), `completed` (boolean, default false), `createdAt` (timestamp).
- **Tags**: Global labels for cards. Fields: `id` (UUID), `name` (string), `color` (string, e.g., '#FF0000'), `createdAt` (timestamp).
- **CardTags**: Many-to-many junction. Composite primary key: `cardId` (foreign key to cards, cascade delete), `tagId` (foreign key to tags, cascade delete).
- **Comments**: Threaded notes on cards. Fields: `id` (UUID), `cardId` (foreign key to cards, cascade delete), `userId` (foreign key to users, set null on delete), `text` (string, required), `createdAt` (timestamp). Ordered by `createdAt` (no separate position field).

**Relations**:
- Boards → Lists (one-to-many).
- Lists → Cards (one-to-many).
- Cards → Assignee (many-to-one, Users).
- Cards → Tags (many-to-many via CardTags).
- Cards → Comments (one-to-many).
- Comments → Author (many-to-one, Users).
- Users → Assigned Cards and Authored Comments (one-to-many).

**Constraints/Indexes**:
- Foreign keys with cascades (deletes propagate logically).
- Indexes on `lists.boardId`, `lists.position`, `cards.listId`, `cards.position`, `cards.assigneeId`, `card_tags.cardId`, `card_tags.tagId`, `comments.cardId`, `comments.userId`, and `comments.createdAt`.
- No soft deletes—all deletions are hard.
- Initial data: Seeded with 5 users, 1-2 boards, 4 lists per board, 6-9 cards (with assignees/tags/completed variety), 2-3 comments per card.

## Code quality

- Use error boundaries whenever appropriate.
- Validate form data on the front end and incoming api data on the backend with Valibot.

## Technical Stack
- **Framework**: SolidStart (SolidJS for UI/reactivity, Vite for building, file-based routing).
- **Database**: SQLite (file: `sqlite.db`) with Drizzle ORM (schema migrations via Drizzle Kit).
- **State Management**: SolidJS `createStore` for global reactive data (boards, lists, cards, etc.); `createResource` for async fetches; `createEffect`/`createMemo` for derived reactivity.
- **API Layer**: SolidStart server actions and API routes (e.g., `/api/boards/[id].json.ts`) for CRUD. Use Drizzle for server-side queries/joins.
- **Real-Time**: Native WebSocket (browser `WebSocket` client; Node.js `ws` library server-side, hooked into SolidStart's HTTP server via Vite config). Broadcast events like `{ type: 'cardMoved', cardId: '...', newListId: '...', newPosition: ... }`.
- **Drag-and-Drop**: HTML5 Drag and Drop API (no libraries: `draggable`, `onDragStart/Over/End/Drop` handlers).
- **Styling**: Vanilla CSS (inline or `src/styles.css`); no frameworks (e.g., no Tailwind).
- **Utilities**: UUID for IDs (`uuid` lib); no other deps (e.g., no bcrypt for auth).
- **Build/Dev**: Vite config for production builds; `npm run dev` for hot reload; `npm run build` + `npm run preview` for bundle analysis.
- **Bundle Testing**: Use `rollup-plugin-visualizer` to analyze JS chunks. Measure gzipped sizes: Main entry (~30-50KB), route splits (~5-15KB each). Focus on reactivity overhead (e.g., store updates during drags/comments).
- **Environment**: Node.js 18+, npm/pnpm. Local dev only—no deployment.

## User Flows
1. **Dashboard (Home: `/`)**:
   - Load all boards via API.
   - Display list of board titles (click to navigate: `/board/[id]`).
   - Button to create new board (form: title, optional description → POST to API → redirect).

2. **Board View (`/board/[id]`)**:
   - Load board data (with nested lists/cards/tags/comments) via API.
   - Render horizontal lists (flexbox grid).
   - Each list: Title header, add-card form (title → insert to DB/store/WS).
   - Each card: Draggable div with title, description (expandable), assignee dropdown (static users), completed checkbox, tag chips (add/remove modal), comments section (list + add form).
   - Drag: Select card → move to target list → calculate new position (e.g., append or insert at drop index) → update store/DB/WS.
   - Filter: Search input filters cards by assignee/tag (reactive, client-side).

3. **Mutations**:
   - All via forms/server actions (e.g., `<form use:serverAction={addComment}>`).
   - Optimistic: Update local store first → API call → WS broadcast (if success, confirm; else revert).
   - Examples: Toggle completed (checkbox onClick → API update position unchanged), add tag (select from list or new → insert CardTags).

4. **Real-Time Sync**:
   - On connect (board mount): WS handshake, fetch/subscribe to board events.
   - Mutations trigger: Local update → DB persist → Broadcast to others → Receivers update store (e.g., re-sort cards by position).
   - Multi-tab: Open two boards → Drag in one → See instant move in the other.

## Setup and Seeding
- **Project Init**: `npm create solid@latest . -- --template vanilla` → install Drizzle/SQLite deps.
- **Schema**: Place in `drizzle/schema.ts`; run `npx drizzle-kit generate:sqlite && npx drizzle-kit push:sqlite`.
- **Seeding**: Custom script (`src/db/seed.ts`, run `npm run seed` once):
  - Insert 5 static users (Loren, Alex, Dolly, Bobby, Sofia with UUIDs).
  - Insert 1-2 boards (titles like "Sample Project").
  - Per board: 4 lists ("Todo", "In-Progress", "QA", "Done", positions 1-4).
  - Per list: 2-3 cards (titles/descriptions, random assignees/tags, mix completed).