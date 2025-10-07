# Trello Clone App Specifications

## Project Overview

This is a simplified Trello-inspired Kanban board application that demonstrates core features like draggable task cards, reactive state management, and optimistic updates. The app uses SQLite for persistent storage via Drizzle ORM, with seeded initial data. There is no user authentication—users are static entities for assignment and authorship purposes.

The app supports multiple boards, each with four fixed lists (Todo, In-Progress, QA, Done) containing cards (tasks). Cards can be dragged between lists and reordered within lists, assigned to static users, tagged with colored labels, marked complete, and commented on. The app uses optimistic updates to provide instant UI feedback, with server confirmation and cache invalidation following mutations.

**Target Complexity**: Mid-sized app for framework comparison—~15-20 components, reactive state for data (boards/lists/cards/tags/comments/users), server actions for mutations, and optimistic updates for instant UI feedback. Production bundle target: 35-70KB gzipped (main + splits), focusing on framework efficiency with fine-grained reactivity.

## Key Features Implemented

### Core Features
- **Boards Dashboard**: View and navigate to all available boards (global access, no ownership)
- **Seeded users**: Five static users (Loren, Alex, Dolly, Bobby, and Sofia)
- **Kanban Board View**:
  - Display lists (columns) in horizontal scrollable layout
  - Cards within each list, ordered vertically by position
  - Drag-and-drop cards between lists and reorder within lists
  - Visual feedback with drag overlays and smooth animations
  - Card details: Title, description, assignee, colored tags, comments count, and completion status

### Card Management
- **Add new cards**: Form with title (required), description (optional), assignee selection, and tag selection
- **Edit cards**: Update title, description, assignee, and tags via modal
- **Card details**:
  - Title and description
  - Assignee (from static users)
  - Multiple colored tags
  - Comments with authorship
  - Completion checkbox (visual indicator)
  - Creation timestamp

### List Management
- **Fixed lists**: All boards have the same four lists: Todo, In-Progress, QA, Done
- **Position-based ordering**: Cards ordered by integer position field
- **List creation**: Lists are automatically created when a board is created

### Board Features
- **Board creation**: Add new boards with title and description
- **Board overview**: Header section with board title and description
- **Board analytics**:
  - Bar chart showing number of cards per list
  - Pie chart showing distribution of cards across lists
  - Uses CSS-only charts (charts.css library)

### Tags
- **Global tags**: Five seeded tags (Design, Product, Engineering, Marketing, QA)
- **Colored badges**: Each tag has a hex color code
- **Multi-tag support**: Cards can have multiple tags
- **Tag selection**: Tag picker in card creation/edit modals

### Comments
- **Add comments**: Text input with user selection
- **Display comments**: Chronological order by creation timestamp
- **Comment authorship**: Shows which user wrote each comment
- **Optimistic updates**: Comments appear instantly before server confirmation

### Optimistic Updates
- **Instant UI feedback**: All mutations update UI immediately
- **Server confirmation**: Background server requests validate changes
- **Rollback on error**: Reverts to server state if mutation fails
- **Cache invalidation**: Refreshes data after successful mutations

### Drag-and-Drop
- **Library**: @thisbeyond/solid-dnd (SolidJS-native drag-drop)
- **Same-list reordering**: Drag cards to reorder within a list
- **Cross-list moves**: Drag cards between lists
- **Visual feedback**: Drag overlay with rotated/scaled preview
- **View Transitions**: Smooth animations using View Transitions API
- **Collision detection**: closestCenter algorithm for drop target

### Error Handling
- **Error boundaries**: Multiple levels (page, section, component)
- **Server error handling**: Try-catch blocks in all server actions
- **User-friendly errors**: Generic error messages (no internal details exposed)
- **Graceful degradation**: Sections fail independently
- **Database connection handling**: Initialization error handling with WAL mode

## Data Model

The app uses a relational SQLite database managed by Drizzle ORM. Schema includes the following entities:

### Tables

**users**: Static user entities
- `id` (text, UUID primary key)
- `name` (text, required)
- No creation/deletion in app—read-only after seeding

**boards**: Top-level containers
- `id` (text, UUID primary key)
- `title` (text, required, max 255 chars)
- `description` (text, optional, max 500 chars)
- `createdAt` (integer timestamp, auto-generated)

**lists**: Columns within a board
- `id` (text, UUID primary key)
- `boardId` (text, foreign key to boards, cascade delete)
- `title` (text, constrained to: Todo, In-Progress, QA, Done)
- `position` (integer for ordering, 1-4)
- `createdAt` (integer timestamp, auto-generated)

**cards**: Tasks/draggable items
- `id` (text, UUID primary key)
- `listId` (text, foreign key to lists, cascade delete)
- `title` (text, required, max 255 chars)
- `description` (text, optional, max 2000 chars)
- `assigneeId` (text, optional foreign key to users, set null on delete)
- `position` (integer for ordering within list)
- `completed` (boolean, default false)
- `createdAt` (integer timestamp, auto-generated)

**tags**: Global labels for cards
- `id` (text, UUID primary key)
- `name` (text, required)
- `color` (text, hex color like '#8B5CF6')
- `createdAt` (integer timestamp, auto-generated)

**card_tags**: Many-to-many junction
- `cardId` (text, foreign key to cards, cascade delete)
- `tagId` (text, foreign key to tags, cascade delete)
- Composite primary key: (cardId, tagId)

**comments**: Notes on cards
- `id` (text, UUID primary key)
- `cardId` (text, foreign key to cards, cascade delete)
- `userId` (text, foreign key to users, set null on delete)
- `text` (text, required, max 1000 chars)
- `createdAt` (integer timestamp, auto-generated)
- Ordered by createdAt

### Relations
- Boards → Lists (one-to-many)
- Lists → Cards (one-to-many)
- Cards → Assignee (many-to-one, Users)
- Cards → Tags (many-to-many via CardTags)
- Cards → Comments (one-to-many)
- Comments → Author (many-to-one, Users)

### Constraints/Indexes
- Foreign keys with cascade deletes and set null where appropriate
- Indexes on: `lists.boardId`, `lists.position`, `cards.listId`, `cards.position`, `cards.assigneeId`, `card_tags.cardId`, `card_tags.tagId`, `comments.cardId`, `comments.userId`, `comments.createdAt`
- No soft deletes—all deletions are hard
- Initial data: Seeded with 5 users, 2 boards, 4 lists per board (8 total), 16 cards with varied assignees/tags/completion status, 32 comments

## Technical Stack

### Framework-Specific (SolidStart)
- **Framework**: SolidStart (SolidJS with SSR, file-based routing)
- **Build Tool**: Vinxi (Vite-based)
- **State Management**:
  - SolidJS `createSignal` for local mutable state
  - `createAsync` for server data with caching
  - `createEffect` for syncing server state to local state
  - `query()` wrapper for cached server queries
  - No global stores—state scoped to routes

### Shared Stack (Framework-Agnostic)
- **Database**: SQLite (file: `drizzle/db.sqlite`) with Drizzle ORM
- **Styling**: Tailwind CSS + DaisyUI (pastel theme)
- **Drag-and-Drop**: @thisbeyond/solid-dnd (framework-specific)
- **Charts**: charts.css (CSS-only, no JavaScript)
- **API Layer**:
  - Server functions with "use server" directive
  - FormData-based mutations
  - Cache invalidation via `revalidate()`
  - Transactions for multi-table updates

### Features NOT Implemented
- **Real-time collaboration**: No WebSockets (originally planned but removed)
- **Search/Filter**: No filtering by assignee or tag (not implemented)
- **Bundle analysis**: No rollup-plugin-visualizer (not needed for requirements)
- **Story points**: Not in data model (removed from spec)
- **Card deletion**: No delete functionality (not implemented)
- **List reordering**: Lists are fixed in order (not implemented)

## Code Quality

### Implemented
- **Error boundaries**: Used at page, section, and component levels
- **Input validation**: All server actions validate input (length, required fields, empty strings)
- **Database transactions**: Card+tag updates wrapped in transactions
- **Database connection handling**: WAL mode enabled, busy timeout set, graceful shutdown handlers
- **Type safety**: Full TypeScript coverage with Drizzle ORM types
- **JSDoc comments**: Comprehensive documentation on drag-drop logic functions
- **Error handling**: Try-catch blocks in all server actions with user-friendly messages

### Not Implemented
- **Valibot validation**: Not used (basic validation implemented instead)
- **Frontend form validation**: Only server-side validation implemented

## User Flows

### 1. Dashboard (Home: `/`)
- Load all boards via cached query
- Display grid of board cards with title and description
- Click card to navigate to board view
- "Add Board" button opens modal
- Form submission creates board with 4 default lists
- Optimistic update shows new board immediately

### 2. Board View (`/board/[id]`)
- Load board data (with nested lists/cards/tags/comments) via cached query
- Render breadcrumb navigation (Boards > Board Title)
- Display board overview section:
  - Board title and description
  - Bar chart (cards per list)
  - Pie chart (distribution)
- Render horizontal scrollable list of 4 lists
- Each list shows:
  - Title header
  - Card count badge
  - Cards in vertical stack
  - Minimum height for empty lists
- Each card shows:
  - Title
  - Assignee badge (if assigned)
  - Description (if present)
  - Colored tag badges
  - Comments indicator
  - Completion badge (if completed)
  - Edit button
- "Add Card" button opens modal (creates card in Todo list)

### 3. Card Interactions
- **Drag-and-drop**:
  - Click and hold to start drag
  - Drag overlay shows preview with rotation/scale
  - Original card fades to 25% opacity
  - Drop on list or another card
  - Same-list: reorders cards
  - Cross-list: moves card to new list
  - Optimistic update with View Transitions animation
  - Server persists change
  - Rollback if server fails

- **Edit card**:
  - Click edit button to open modal
  - Update title, description, assignee, tags
  - Submit form
  - Optimistic update
  - Server action with transaction (card + tags)
  - Cache invalidation

- **Add comment**:
  - Click comment button to open modal
  - Select user and enter text
  - Submit form
  - Optimistic update (comment appears instantly)
  - Server action persists comment
  - Cache invalidation

### 4. Optimistic Updates Pattern
All mutations follow this flow:
1. User action (form submit, drag-drop, checkbox)
2. Extract data from form/event
3. Update local state immediately (optimistic)
4. UI re-renders with new state
5. Submit to server action (background)
6. Server validates, mutates database, invalidates cache
7. On success: keep optimistic state, refresh from server
8. On error: revert to server state, log error

## Setup and Seeding

### Project Init
```bash
npm install
```

### Database Setup
```bash
# Create database and apply schema
npx drizzle-kit push

# Seed with initial data
npm run seed
```

### Development
```bash
# Start dev server (hot reload)
npm run dev

# Access at http://localhost:3000
```

### Seeding Details
Custom script (`src/db/seed.ts`) populates:
- 5 static users (Loren, Alex, Dolly, Bobby, Sofia)
- 2 boards ("Product Launch", "Website Refresh")
- 8 lists (4 per board: Todo, In-Progress, QA, Done)
- 16 cards with varied:
  - Titles and descriptions
  - Assignees (distributed across users)
  - Tags (1-2 per card)
  - Completion status (some completed in "Done" list)
  - Positions (sequential)
- 5 global tags (Design, Product, Engineering, Marketing, QA)
- 32 comments (2 per card, various authors)

## Performance Optimizations

### Implemented
1. **Route preloading**: `preload()` functions fetch data before route renders
2. **Code splitting**: File-based routing creates separate chunks per route
3. **Database indexes**: Indexed foreign keys and position fields
4. **Transactions**: Atomic multi-table updates (card + tags)
5. **WAL mode**: Better concurrent SQLite access
6. **View Transitions**: Hardware-accelerated animations
7. **Optimistic updates**: Instant UI without waiting for server
8. **Fine-grained reactivity**: SolidJS signals update only affected components
9. **Cached queries**: `query()` wrapper prevents redundant fetches

### Bundle Size (SolidStart Implementation)
- Target: 35-70KB gzipped
- Actual measurements pending (use browser DevTools Network tab)

## Framework Comparison Notes

This spec is designed to be framework-agnostic where possible, to enable fair comparison between SolidStart and Next.js implementations.

### Framework-Specific Differences Expected

**SolidStart:**
- Fine-grained reactivity (signals)
- `createAsync` + `query()` for data fetching
- Server actions with "use server" directive
- @thisbeyond/solid-dnd for drag-drop
- Smaller bundle size (no virtual DOM)

**Next.js:**
- React (virtual DOM, reconciliation)
- Server Components + Client Components split
- Server Actions with useFormState/useFormStatus
- @dnd-kit or react-beautiful-dnd for drag-drop
- Larger bundle size (React runtime)

### Comparable Metrics
- **Bundle size**: Main JS + route chunks (gzipped)
- **Time to Interactive**: Lighthouse metric
- **First Contentful Paint**: Lighthouse metric
- **Drag-drop performance**: Frame rate during drag
- **Optimistic update speed**: Time from action to UI update
- **Code complexity**: Lines of code, component count
- **Developer experience**: Setup time, documentation clarity

## Documentation

All technical details are documented in `/docs`:

1. **architecture-overview.md** - System design, patterns, decisions
2. **database-schema.md** - Complete schema reference with ERD
3. **drag-and-drop-system.md** - Drag-drop implementation details
4. **optimistic-updates.md** - Optimistic update pattern with examples
5. **server-actions.md** - Server functions, validation, mutations
6. **error-handling.md** - Error boundaries and error flow
7. **state-management.md** - Signal patterns and data flow
8. **styling-system.md** - Tailwind + DaisyUI usage
9. **view-transitions.md** - Animation implementation
10. **development-workflow.md** - Setup, commands, deployment

These docs should be replicated for the Next.js version, with framework-specific adaptations.
