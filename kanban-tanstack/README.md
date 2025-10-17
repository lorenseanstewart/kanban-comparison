# Kanban Board - TanStack Start

A modern kanban board application built with TanStack Start, React 19, and SQLite.

## Features

- Drag-and-drop kanban board with multiple lists
- Card management with tags and assignees
- Comments on cards
- Board overview with charts
- Type-safe server functions
- Full-stack React with SSR

## Tech Stack

- **Framework**: TanStack Start (React Router + Vite)
- **UI**: React 19, DaisyUI, Tailwind CSS
- **Database**: SQLite with Drizzle ORM
- **Drag & Drop**: dnd-kit
- **Validation**: Valibot
- **Charts**: charts.css

## Getting Started

### Prerequisites

- Node.js 20.x or higher (TanStack Start recommends Node 22+, but works with 20)
- npm

### Installation

```bash
npm install
```

### Database Setup

```bash
# Generate migrations, reset db, run migrations, and seed data
npm run setup
```

Individual database commands:
```bash
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes (alternative to migrations)
npm run db:reset     # Reset database
npm run seed         # Seed database with sample data
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Production

```bash
npm run start
```

## Project Structure

```
kanban-tanstack/
├── src/
│   ├── components/        # React components
│   │   ├── modals/       # Modal components
│   │   └── charts/       # Chart components
│   ├── routes/           # File-based routing
│   │   ├── __root.tsx    # Root route layout
│   │   ├── index.tsx     # Home page
│   │   └── board.$id.tsx # Board detail page
│   ├── lib/              # Shared utilities
│   │   ├── db.ts         # Database connection
│   │   ├── api.ts        # API types
│   │   ├── validation.ts # Valibot schemas
│   │   └── drag-drop/    # Drag-drop logic
│   ├── utils/            # Server functions and utilities
│   │   └── api.tsx       # TanStack Start server functions
│   └── db/               # Database utilities
│       └── seed.ts       # Database seeding
├── drizzle/              # Database files
│   ├── schema.ts         # Database schema
│   └── migrations/       # Migration files
├── scripts/              # Build and setup scripts
└── public/               # Static assets
```

## Server-Side Rendering (SSR)

This application is **fully server-rendered** with TanStack Start:

- **Route loaders** fetch all data on the server before rendering
- **Complete HTML** is sent to the browser with all content visible (boards, lists, cards, charts)
- **No loading spinners** on initial page load - everything is pre-rendered
- **Streaming SSR** - TanStack Start streams the HTML as it's generated
- **Automatic hydration** - React hydrates interactive components on the client
- **Progressive enhancement** - The app works with JavaScript disabled (except for drag-drop and modals)

### SSR Optimizations Made:
- Removed unnecessary `useState/useEffect` from chart components
- Charts now render with pure CSS animations (server-compatible)
- BoardOverview component is fully server-renderable
- All data fetching happens in route loaders (server-side)
- Components are optimized to render complete HTML on first paint

You can verify SSR by viewing the page source (Cmd+U) or running:
```bash
curl http://localhost:3000 | grep "card-title"
```

## Key Differences from Next.js Version

This is a port of the kanban-nextjs application with the following changes:

### Routing
- Uses TanStack Router file-based routing instead of Next.js App Router
- Routes are in `src/routes/` instead of `src/app/`
- Dynamic routes use `$param` syntax (e.g., `board.$id.tsx`) instead of `[param]`

### Server Functions
- Uses TanStack Start's `createServerFn` instead of Next.js Server Actions
- Server functions are defined in `src/utils/api.tsx`
- All server functions use the pattern: `functionName({ data: params })`
- No `"use server"` directive needed

### Data Loading
- Uses route `loader` functions instead of async React Server Components
- Data is accessed via `Route.useLoaderData()` hook

### Navigation
- Uses `<Link>` from `@tanstack/react-router` instead of `next/link`
- Uses `useRouter()` from `@tanstack/react-router` for programmatic navigation
- `router.invalidate()` instead of `router.refresh()`

### Client Components
- No `"use client"` directive needed (TanStack Start handles this automatically)
- All components can be client-side by default

## Server Functions

All server-side operations are handled through TanStack Start server functions in `src/utils/api.tsx`:

- `fetchBoards()` - Get all boards
- `fetchBoard(id)` - Get single board with lists and cards
- `fetchUsers()` - Get all users
- `fetchTags()` - Get all tags
- `createBoard({ title, description })` - Create a new board
- `createCard({ boardId, title, description, assigneeId, tagIds })` - Create a new card
- `updateCard({ cardId, title, description, assigneeId, tagIds })` - Update a card
- `deleteCard(cardId)` - Delete a card
- `addComment({ cardId, userId, text })` - Add a comment to a card
- `updateCardList({ cardId, newListId, newPosition })` - Move a card to a different list
- `updateCardPositions({ cardIds })` - Reorder cards within a list

## License

MIT
