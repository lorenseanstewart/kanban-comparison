# Kanban Board - Next.js Implementation (with React Compiler)

A full-featured Kanban board application built with Next.js, featuring drag-and-drop, real-time updates, and Cloudflare D1 database persistence.

Experimental variant with **React 19's compiler** enabled for automatic optimization.

## Tech Stack

- **Framework**: Next.js 16 (beta) with React 19 + React Compiler
- **Database**: Cloudflare D1 (serverless SQLite) with Drizzle ORM
- **Deployment**: Cloudflare Pages (Edge Runtime)
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @dnd-kit
- **Charts**: charts.css

## What's Different About This Variant?

- Enables `experimental.reactCompiler: true` in `next.config.ts`
- Auto-memoizes renders, computations, and callbacks without manual `useMemo`/`useCallback`
- Same code as standard Next.js app - compiler optimizes automatically
- ~3% smaller bundle size
- **Cloudflare D1 database** - runs on the edge, same code locally and in production

**Note**: React Compiler is still experimental - not recommended for production.

## Quick Start

### First Time Setup

```bash
# Install dependencies
npm install

# Start the dev server (builds and starts wrangler)
npm run dev
```

The dev server will start on [http://localhost:8788](http://localhost:8788)

**In a second terminal, initialize the database:**

```bash
npm run setup
```

Or use curl commands directly:

```bash
# Apply database schema
curl -X POST http://localhost:8788/api/migrate

# Seed with sample data
curl -X POST http://localhost:8788/api/seed
```

> **Note**: The app uses `wrangler pages dev` which runs on Cloudflare's local runtime (workerd), not Node.js. This ensures local dev matches production exactly.

### Subsequent Runs

```bash
npm run dev
```

Visit [http://localhost:8788](http://localhost:8788)

## Production Deployment

This app is deployed at: **https://kanban-nextjs.pages.dev/**

### Initial Production Setup

After deploying to Cloudflare Pages for the first time, set up the production database:

```bash
# 1. Create production D1 database
npx wrangler d1 create kanban-db

# 2. Copy the database_id and update wrangler.toml (already done in this repo)

# 3. Apply schema to production
npm run db:migrate

# 4. Seed production database
npm run seed
```

### Quick Production Setup (Already Deployed)

If the app is already deployed at https://kanban-nextjs.pages.dev/, you can set up the database via API:

```bash
# 1. Apply database schema
curl -X POST https://kanban-nextjs.pages.dev/api/migrate

# 2. Seed with sample data
curl -X POST https://kanban-nextjs.pages.dev/api/seed \
  -H "Authorization: Bearer development-only"
```

> **Note**: In production, you should change the `SEED_SECRET` environment variable in Cloudflare Pages settings for security.

### Verify Deployment

```bash
# Check if database is seeded
curl https://kanban-nextjs.pages.dev/api/seed

# Visit the app
open https://kanban-nextjs.pages.dev/
```

## Available Scripts

### Development
- `npm run dev` - Build and start local Cloudflare dev server (port 8788)
- `npm run build` - Build Next.js production bundle
- `npm run pages:build` - Build for Cloudflare Pages deployment
- `npm run start` - Run production server (Node.js)
- `npm run lint` - Run ESLint

### Database
- `npm run setup` - Initialize local D1 database (migrate + seed)
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:migrate:local` - Apply migrations to local D1
- `npm run db:migrate` - Apply migrations to production D1
- `npm run seed:local` - Seed local D1 with sample data
- `npm run seed` - Seed production D1 with sample data

## Database Architecture

The app uses **Cloudflare D1**, a serverless SQLite database that runs on Cloudflare's global network.

### Local Development
- Uses local D1 database (stored in `.wrangler/state/v3/d1/`)
- Same async API as production
- Runs on Cloudflare's workerd runtime via `wrangler pages dev`

### Production
- Uses remote D1 database on Cloudflare's network
- Identical code to local development
- Automatic global distribution

### Schema Management

The database schema is defined in `drizzle/schema.ts`. Migrations are in `drizzle/migrations/`.

**To make schema changes:**

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply to local: `npm run db:migrate:local`
4. Apply to production: `npm run db:migrate`

### API Routes for Database Setup

The app includes two API routes for database management:

#### `/api/migrate` - Apply Database Schema
```bash
# Local
curl -X POST http://localhost:8788/api/migrate

# Production
curl -X POST https://kanban-nextjs.pages.dev/api/migrate
```

#### `/api/seed` - Seed Sample Data
```bash
# Local
curl -X POST http://localhost:8788/api/seed \
  -H "Authorization: Bearer development-only"

# Production
curl -X POST https://kanban-nextjs.pages.dev/api/seed \
  -H "Authorization: Bearer development-only"
```

> **Security**: Set `SEED_SECRET` environment variable in Cloudflare Pages for production.

#### `/api/seed` (GET) - Check Database Status
```bash
# Check if database is seeded
curl https://kanban-nextjs.pages.dev/api/seed
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
- ✅ Edge runtime deployment (Cloudflare Pages)
- ✅ Serverless database (D1)

## Environment Configuration

### Local Development
No environment variables needed - `wrangler pages dev` automatically provides D1 binding.

### Production (Cloudflare Pages)
Configure in Cloudflare Pages dashboard (Settings → Environment Variables):

- `SEED_SECRET` - Secret for `/api/seed` endpoint (optional, defaults to "development-only")

### D1 Database Binding
Configure in Cloudflare Pages dashboard (Settings → Functions → D1 database bindings):

- Variable name: `DB`
- D1 database: `kanban-db`

Or use `wrangler.toml` (already configured):
```toml
[[d1_databases]]
binding = "DB"
database_name = "kanban-db"
database_id = "58c3811a-0dfd-4f17-8d1a-16bb8fada81b"
```

## Deployment

### Via Cloudflare Pages Dashboard
1. Connect your Git repository
2. Build command: `npm run pages:build`
3. Build output directory: `.vercel/output/static`
4. Add D1 database binding (Settings → Functions → D1 database bindings)
5. Deploy!

### Via Wrangler CLI
```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=kanban-nextjs
```

## Troubleshooting

### Local dev server shows "no such table" error
The local D1 database needs to be set up. Run:
```bash
npm run setup
```

Or use the API routes:
```bash
curl -X POST http://localhost:8788/api/migrate
curl -X POST http://localhost:8788/api/seed -H "Authorization: Bearer development-only"
```

### Production shows "no such table" error
The production D1 database needs to be set up. Run:
```bash
curl -X POST https://kanban-nextjs.pages.dev/api/migrate
curl -X POST https://kanban-nextjs.pages.dev/api/seed -H "Authorization: Bearer development-only"
```

### Build fails with "nodejs_compat" error
Ensure `compatibility_flags = ["nodejs_compat"]` is in `wrangler.toml` and in Cloudflare Pages settings (Settings → Functions → Compatibility Flags).

### View production logs
To debug issues on production, stream live logs from your deployment:
```bash
npx wrangler pages deployment tail --project-name=kanban-nextjs
```

This shows real-time logs from your Edge Functions including errors, console.log statements, and request information.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [React Compiler + Next.js](https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)

## License

MIT
