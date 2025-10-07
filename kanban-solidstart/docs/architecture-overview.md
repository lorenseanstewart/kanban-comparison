# Architecture Overview

This document provides a high-level overview of the Trello-inspired Kanban board application's architecture and design decisions.

## Tech Stack

- **Framework**: SolidStart (SolidJS meta-framework with SSR)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS + DaisyUI (pastel theme)
- **Drag & Drop**: @thisbeyond/solid-dnd
- **Build Tool**: Vinxi

## Project Structure

```
/src
  /routes          - File-based routing pages
    index.tsx      - Boards dashboard (home page)
    /board
      [id].tsx     - Individual board view
  /api             - Server-side logic
    db.ts          - Database connection
    boards.ts      - Board queries
    card-actions.ts    - Card mutations
    board-actions.ts   - Board mutations
    drag-drop-actions.ts - Drag-drop mutations
  /components      - UI components
    /modals        - Modal dialogs
    /charts        - Data visualization
  /lib             - Shared utilities
    /drag-drop     - Drag-drop logic
    /utils         - Utility functions
/drizzle
  schema.ts        - Database schema definitions
  db.sqlite        - SQLite database file
```

## Core Patterns

### 1. File-Based Routing

SolidStart uses file-based routing with automatic code splitting:

```tsx
// src/routes/board/[id].tsx
export const route = {
  preload({ params }) {
    // Preload data before route renders
    fetchBoard({ id: params.id });
  },
} satisfies RouteDefinition;
```

### 2. Server Functions

API logic uses "use server" directive for type-safe server functions:

```tsx
"use server";

export async function getBoards(): Promise<BoardSummary[]> {
  return await db.select().from(boards);
}
```

### 3. Query/Cache Pattern

Uses `query` from @solidjs/router for cached, reactive data:

```tsx
export const listBoards = query(() => getBoards(), "boards:list");
export const fetchBoard = query(
  (input: BoardId) => getBoard(input.id),
  "boards:detail"
);
```

### 4. Optimistic Updates

UI updates immediately before server confirmation:

```tsx
// Update local state first
setBoard(updatedBoard);

// Then persist to server
try {
  await updateCardList(cardId, newListId);
} catch {
  // Revert on error
  setBoard(originalBoard);
}
```

### 5. Component Composition

Components are small, focused, and composable:

- `DragDropBoard` - Drag-drop context provider
- `CardList` - List container with droppable zone
- `DraggableCard` - Individual draggable card
- Error boundaries wrap sections for graceful degradation

## Data Flow

1. **Route Load**: Preload functions fetch data via query functions
2. **SSR**: Server renders initial HTML with data
3. **Hydration**: Client takes over with reactive signals
4. **User Action**: Optimistic UI update + server mutation
5. **Cache Invalidation**: Revalidate affected queries
6. **Re-render**: Components reactively update from fresh data

## Key Design Decisions

### Why SQLite?

- Simple deployment (single file database)
- No separate database server needed
- WAL mode enables good concurrent access
- Perfect for embedded/self-hosted apps

### Why Optimistic Updates?

- Instant UI feedback improves perceived performance
- Network latency doesn't block interactions
- Graceful rollback on errors maintains consistency

### Why Server Functions?

- Type safety between client and server
- No manual API endpoint definitions
- Automatic request/response serialization
- Better DX with colocation of logic

### Why Signals over Stores?

- Signals are more granular (fine-grained reactivity)
- Better performance for frequently updated state
- Simpler mental model for local component state
- Stores used only when needed (shared state)

## Performance Optimizations

1. **Route Preloading**: Data fetched before route renders
2. **Code Splitting**: Each route is a separate chunk
3. **Database Indexes**: Indexed foreign keys and position fields
4. **Transactions**: Atomic multi-table updates
5. **WAL Mode**: Better concurrent database access
6. **View Transitions**: Smooth animations with native API

## Security Considerations

- No authentication (demo app with static users)
- Input validation on all server functions
- SQL injection protection via Drizzle ORM

## Deployment

This app can be deployed to:

- Node.js servers (with SQLite file persistence)
- Serverless platforms (with persistent storage)
- Edge runtimes (with D1 or Turso)
- Docker containers

See `Development Workflow` doc for deployment instructions.
