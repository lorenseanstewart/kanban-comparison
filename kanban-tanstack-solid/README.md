# Kanban Board - TanStack Start (Solid)

A modern kanban board application built with TanStack Start for Solid.js, deployable to Cloudflare Workers.

## Features

- Drag-and-drop kanban board with multiple lists
- Card management with tags and assignees
- Comments on cards
- Board overview with charts
- Type-safe server functions
- Full-stack Solid.js with SSR

## Tech Stack

- **Framework**: TanStack Start (Solid Router + Vite)
- **UI**: Solid.js, DaisyUI, Tailwind CSS
- **Database**: Cloudflare D1 (SQLite) / better-sqlite3 (local) with Drizzle ORM
- **Deployment**: Cloudflare Workers & Pages
- **Drag & Drop**: @thisbeyond/solid-dnd
- **Validation**: Valibot
- **Charts**: charts.css

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare CLI) - installed automatically via npm

### Installation

```bash
npm install
```

### Local Development

For local development, the app uses better-sqlite3:

```bash
# Set up database (reset, migrate, and seed)
npm run setup

# Start development server
npm run dev
```

The dev server will start at `http://localhost:3008` with:
- Hot module replacement (HMR) enabled
- Local SQLite database

## Cloudflare Deployment

This app is designed to be deployed to Cloudflare Pages with D1 database.

### Setting Up Cloudflare

1. **Create a D1 Database**:
   ```bash
   npx wrangler d1 create kanban-db-solid
   ```

   Copy the database ID from the output and update `wrangler.toml` and `scripts/build-cloudflare.mjs` with your database ID.

2. **Apply Database Schema**:
   ```bash
   # Generate Drizzle migrations
   npm run db:generate

   # Apply schema to production D1
   npx wrangler d1 execute kanban-db-solid --file=./drizzle/migrations/0000_*.sql
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
   - Externalizes Solid.js (Wrangler bundles it correctly)
   - Creates a single `_worker.js` file with env.ASSETS support
   - Copies client assets and worker to `dist/pages`

   **Option B: Deploy via Git (Cloudflare Dashboard)**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Workers & Pages → Create Application → Pages → Connect to Git
   - Select your repository
   - Configure build settings:
     - **Build command**: `npm run build:cloudflare`
     - **Build output directory**: `dist/pages`
     - **Root directory**: Leave empty (or set to `/kanban-tanstack-solid` if monorepo)

4. **Configure D1 Database Binding** (Required):

   After deploying, the D1 database must be bound manually in Cloudflare Dashboard:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
   - Select your `kanban-tanstack-solid` project
   - Go to **Settings** → **Functions**
   - Scroll to **D1 database bindings**
   - Click **Add binding**:
     - **Variable name**: `DB`
     - **D1 database**: `kanban-db-solid`
   - Click **Save**

   **Note:** The D1 binding in `wrangler.toml` is for local development only. Pages deployments require manual dashboard configuration.

5. **Seed Production Database** (optional):
   - You can create API endpoints to seed data, or
   - Insert data directly via Wrangler CLI:
     ```bash
     npx wrangler d1 execute kanban-db-solid --command="INSERT INTO..."
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
kanban-tanstack-solid/
├── src/
│   ├── components/        # Solid components
│   ├── routes/           # File-based routing
│   ├── lib/              # Shared utilities
│   │   ├── db.ts         # Database connection (dual support)
│   │   ├── db.d1.ts      # D1-specific implementation
│   │   ├── db.local.ts   # better-sqlite3 implementation
│   │   ├── api.ts        # API types
│   │   ├── actions.ts    # Server actions
│   │   ├── validation.ts # Valibot schemas
│   │   └── drag-drop/    # Drag-drop logic
│   └── db/               # Database utilities
│       └── seed.ts       # Database seeding
├── drizzle/              # Database files
│   ├── schema.ts         # Database schema
│   └── migrations/       # Migration files
├── scripts/              # Build and setup scripts
│   └── build-cloudflare.mjs  # Cloudflare build script
└── public/               # Static assets
```

## Server-Side Rendering (SSR)

This application uses full server-side rendering with TanStack Start:

- **Server actions** handle all mutations using Solid's `"use server"` directive
- **Complete HTML** is sent to the browser with all content visible
- **No loading spinners** on initial page load - everything is pre-rendered
- **Automatic hydration** - Solid hydrates interactive components on the client

## Key Differences from React Version

This is the Solid.js version of the kanban board with the following differences:

### Framework
- Uses Solid.js instead of React
- Uses TanStack Start for Solid (`@tanstack/solid-start`) instead of TanStack Start for React
- Uses `@thisbeyond/solid-dnd` instead of `@dnd-kit` for drag-and-drop

### Reactivity
- Uses Solid's fine-grained reactivity (signals, stores) instead of React's hooks
- More efficient re-rendering with compile-time optimizations
- No virtual DOM - updates happen directly

### Server Functions
- Uses `"use server"` directive for server actions
- All mutations handled through server actions (form submissions)

## License

MIT
