# Kanban Board - Marko Implementation

A full-featured Kanban board application built with Marko, featuring drag-and-drop, real-time updates, and database persistence with support for both local development and Cloudflare Pages deployment.

## Tech Stack

- **Framework**: Marko 6 with [@marko/run](https://github.com/marko-js/run)
- **Database**:
  - **Local**: SQLite with better-sqlite3
  - **Production**: Cloudflare D1
  - **ORM**: Drizzle ORM
- **Deployment**: Cloudflare Pages with Workers
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @formkit/drag-and-drop
- **Animations**: @formkit/auto-animate
- **Charts**: charts.css

## Quick Start

### First Time Setup

```bash
npm install
npm run setup  # Applies migrations and seeds the database
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

> **Note**: Migration files are included in the repo, so you don't need to generate them.

### Subsequent Runs

```bash
npm run dev
```

## Available Scripts

### Development & Building

- `npm run dev` - Start development server (uses SQLite)
- `npm run build` - Build production bundle for Node.js
- `npm run build:cloudflare` - Build for Cloudflare Pages deployment
- `npm run preview` - Preview production build
- `npm run start` - Run production server

### Database Management

- `npm run setup` - Initialize database (reset + migrate + seed)
- `npm run db:reset` - Delete database files
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:migrate` - Apply pending migrations
- `npm run db:push` - Push schema changes directly (dev only)
- `npm run seed` - Seed database with sample data

## Database Setup

The app supports two database configurations:

- **Local Development**: Uses SQLite with better-sqlite3 (`drizzle/db.sqlite`)
- **Cloudflare Production**: Uses Cloudflare D1 (serverless SQLite)

The database adapter is automatically selected based on the environment:
- Local: `src/lib/db.local.ts` (better-sqlite3)
- Cloudflare: `src/lib/db.d1.ts` (D1 binding)

### Reset Local Database

```bash
npm run setup  # This automatically resets, migrates, and seeds
```

### Schema Changes

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration locally: `npm run db:migrate`
4. Apply migration to D1: See Cloudflare Deployment section

## Project Structure

```
src/
├── routes/              # File-based routing
│   ├── +layout.marko   # Root layout
│   ├── index/          # Homepage (board list)
│   └── board/          # Board detail pages
├── components/         # Reusable components
├── lib/               # Utilities and helpers
│   ├── db.ts          # Database entry point (dynamic import)
│   ├── db.local.ts    # SQLite adapter (local dev)
│   ├── db.d1.ts       # D1 adapter (Cloudflare)
│   ├── api.ts         # Data fetching functions
│   └── actions.ts     # Data mutation functions
├── entry.cloudflare.ts # Cloudflare Worker entry point
└── db/                # Database seeds
drizzle/
├── schema.ts          # Database schema
└── migrations/        # Migration files
scripts/
└── build-cloudflare.mjs # Cloudflare build script
wrangler.toml          # Cloudflare configuration
```

## Features

- ✅ Create and manage multiple boards
- ✅ Four fixed lists per board (Todo, In-Progress, QA, Done)
- ✅ Create, edit, and delete cards
- ✅ Drag-and-drop cards within and between lists
- ✅ Assign users to cards
- ✅ Add tags to cards with color coding
- ✅ Add comments to cards
- ✅ Mark cards as complete
- ✅ Real-time optimistic UI updates
- ✅ Responsive design with DaisyUI theme
- ✅ Board overview charts

## Cloudflare Pages Deployment

This app is configured for deployment on Cloudflare Pages with D1 database support.

### Prerequisites

1. Install Wrangler CLI: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Create a D1 database:
   ```bash
   wrangler d1 create kanban-db
   ```
4. Update `wrangler.toml` with your D1 database ID

### Initial Setup

1. Apply migrations to D1:
   ```bash
   wrangler d1 migrations apply kanban-db --remote
   ```

2. (Optional) Seed the D1 database:
   ```bash
   # You'll need to create a seed script or manually insert data
   ```

### Deploy

```bash
npm run build:cloudflare
npx wrangler pages deploy dist --project-name=kanban-marko
```

### View Deployment Logs

For Cloudflare Pages deployments, logs are available through:

1. **Cloudflare Dashboard**: Visit the [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages → kanban-marko → Deployments
2. **Real-time Logs** (requires Workers/Functions): If using Pages Functions, use:
   ```bash
   npx wrangler pages deployment tail --project-name=kanban-marko
   ```
   Note: Static deployments don't support live tailing. Add `console.log()` statements and view them in the dashboard.

### How It Works

The Cloudflare build process:
1. Runs standard Marko build
2. Removes Node.js-specific imports (better-sqlite3, http, etc.)
3. Builds a custom `_worker.js` entry point
4. Moves static assets to dist root for ASSETS binding
5. Includes the Marko manifest for client-side hydration

Key files for Cloudflare:
- `src/entry.cloudflare.ts` - Worker entry point that handles static assets and routes
- `src/lib/db.d1.ts` - D1 database adapter
- `scripts/build-cloudflare.mjs` - Custom build script
- `wrangler.toml` - Cloudflare configuration

### Environment Variables

The app automatically detects the environment:
- **Local**: Uses `src/lib/db.local.ts` with SQLite
- **Cloudflare**: Uses `src/lib/db.d1.ts` with D1 binding

No environment variables needed - the D1 binding is configured in `wrangler.toml`.

## Learn More

- [Marko Documentation](https://markojs.com/)
- [@marko/run Documentation](https://github.com/marko-js/run)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)

## License

MIT
