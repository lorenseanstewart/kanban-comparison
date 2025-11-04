# Kanban Board - TanStack Start

A modern kanban board application built with TanStack Start, React 19, and Cloudflare D1, deployable to Cloudflare Workers.

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
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Deployment**: Cloudflare Workers & Pages
- **Drag & Drop**: dnd-kit
- **Validation**: Valibot
- **Charts**: charts.css

## Getting Started

### Prerequisites

- Node.js 20.x or higher (TanStack Start recommends Node 22+, but works with 20)
- npm or pnpm
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare CLI) - installed automatically via npm

### Installation

```bash
npm install
```

### Local Development

The app uses Cloudflare D1 database and Wrangler for local development:

```bash
# Build the app and start Wrangler dev server with D1 binding
npm run dev
```

The dev server will start at `http://localhost:8788` with:
- Hot module replacement (HMR) enabled
- Local D1 database (ephemeral, resets on restart)
- Wrangler live reload

**Note:** Since D1 local database is ephemeral, you'll need to seed it on each restart.

### Build

```bash
npm run build
```

This builds the app for Cloudflare Workers using TanStack Start and the Cloudflare Vite plugin.

## Cloudflare Deployment

This app is designed to be deployed to Cloudflare Pages with D1 database.

### Setting Up Cloudflare

1. **Create a D1 Database**:
   ```bash
   npx wrangler d1 create kanban-db
   ```

   Copy the database ID from the output and update `wrangler.toml` if needed.

2. **Apply Database Schema**:
   ```bash
   # Generate Drizzle migrations
   npm run db:generate

   # Apply schema to production D1
   npx wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_*.sql
   ```

3. **Deploy to Cloudflare Pages**:

   **Option A: Deploy via CLI (Recommended)**
   ```bash
   npm run deploy
   ```

   This runs the custom build script `scripts/build-cloudflare.mjs` which:
   - Runs standard TanStack Start build
   - Bundles worker with Vite using `inlineDynamicImports: true`
   - Externalizes Node.js built-ins (provided by `nodejs_compat` flag)
   - Externalizes React (Wrangler bundles it correctly)
   - Creates a single `_worker.js` file with env.ASSETS support
   - Copies client assets and worker to `dist/pages`

   **Option B: Deploy via Git (Cloudflare Dashboard)**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Workers & Pages → Create Application → Pages → Connect to Git
   - Select your repository
   - Configure build settings:
     - **Build command**: `npm run build:cloudflare`
     - **Build output directory**: `dist/pages`
     - **Root directory**: Leave empty (or set to `/kanban-tanstack` if monorepo)

4. **Configure D1 Database Binding** (Required):

   After deploying, the D1 database must be bound manually in Cloudflare Dashboard:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
   - Select your `kanban-tanstack` project
   - Go to **Settings** → **Functions**
   - Scroll to **D1 database bindings**
   - Click **Add binding**:
     - **Variable name**: `DB`
     - **D1 database**: `kanban-db`
   - Click **Save**

   **Note:** The D1 binding in `wrangler.toml` is for local development only. Pages deployments require manual dashboard configuration.

5. **Seed Production Database** (optional):
   - You can create API endpoints to seed data, or
   - Insert data directly via Wrangler CLI:
     ```bash
     npx wrangler d1 execute kanban-db --command="INSERT INTO..."
     ```

### Key Differences for Cloudflare

- **No Transactions**: D1 doesn't support transactions. Sequential operations are used instead.
- **Async Only**: All database operations must use `await`.
- **Parameter Limits**: D1 has a 448 parameter limit for prepared statements. Batch large inserts accordingly.
- **D1 Access**: Database is accessed via `process.env.DB` using a proxy pattern (see `src/lib/db.ts`).
- **Custom Build Script**: Uses `scripts/build-cloudflare.mjs` to bundle the worker with Vite, following the kanban-marko pattern.
- **Environment**: App runs on Cloudflare Workers runtime (V8 isolates), not Node.js.

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
