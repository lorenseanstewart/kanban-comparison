# Kanban Board - Next.js Implementation (Cloudflare Pages + D1)

A full-featured Kanban board application built with Next.js, featuring drag-and-drop, real-time updates, and Cloudflare D1 database persistence.

Experimental variant with **React 19's compiler** enabled for automatic optimization, deployed on **Cloudflare Pages** with **D1 database**.

## Tech Stack

- **Framework**: Next.js 16 (beta) with React 19 + React Compiler
- **Database**: Cloudflare D1 (serverless SQLite) with Drizzle ORM
- **Local Database**: better-sqlite3 for local development
- **Deployment**: Cloudflare Pages
- **Styling**: Tailwind CSS v4 + DaisyUI
- **Drag & Drop**: @dnd-kit
- **Charts**: charts.css

## What's Different About This Variant?

- Enables `experimental.reactCompiler: true` in `next.config.ts`
- Auto-memoizes renders, computations, and callbacks without manual `useMemo`/`useCallback`
- **Cloudflare D1 database** - serverless SQLite for production
- **better-sqlite3** - local SQLite for development
- **Proxy-based database switching** - runtime selection between D1 and local SQLite
- Same codebase works locally and in production without environment-specific code

**Note**: React Compiler is still experimental - not recommended for production.

## CSS Optimization

This implementation includes several CSS optimizations documented in [CSS.md](./CSS.md):

- **Tailwind CSS v4**: Native CSS features with better tree-shaking
- **Font loading optimization**: `display: "optional"` for non-blocking font rendering
- **CSS consolidation**: Single entry point for better compression
- **Next.js CSS optimization**: `optimizeCss: true` for critical CSS extraction

## Quick Start

### First Time Setup

```bash
# Install dependencies
npm install

# Local development uses better-sqlite3
# Database will be created automatically at:
# .wrangler/state/v3/d1/miniflare-D1DatabaseObject/<database-id>.sqlite
```

**Initialize Database:**
```bash
# Generate migration files
npm run db:generate

# Database will be created and migrations applied on first run of dev server
```

### Development Server

```bash
npm run dev
```

This will:
- Start Next.js development server on port 3000
- Use better-sqlite3 for local database (no Wrangler needed)
- Create local SQLite database automatically if it doesn't exist
- Database location: `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/58c3811a0dfd4f178d1a16bb8fada81b.sqlite`

Visit [http://localhost:3000](http://localhost:3000)

## Production Deployment

This app is deployed on **Cloudflare Pages**.

### Deploy to Cloudflare Pages

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create D1 Database** (first time only):
   ```bash
   # The database is already created and shared across apps
   # Database ID: 58c3811a-0dfd-4f17-8d1a-16bb8fada81b
   # Database Name: kanban-db
   ```

4. **Apply Database Migrations**:
   ```bash
   # Generate migration SQL from schema
   npm run db:generate

   # Apply to remote D1 database
   npm run db:migrate:remote
   ```

5. **Build and Deploy**:
   ```bash
   npm run deploy
   ```

This will:
- Build the Next.js app
- Deploy to Cloudflare Pages
- Bind the D1 database automatically via wrangler.toml

## Available Scripts

### Development
- `npm run dev` - Start Next.js development server (uses better-sqlite3 locally)
- `npm run build` - Build Next.js production bundle
- `npm run start` - Run production server locally
- `npm run deploy` - Build and deploy to Cloudflare Pages
- `npm run lint` - Run ESLint

### Database (Drizzle ORM + D1)
- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate:local` - Apply migrations to local D1 database
- `npm run db:migrate:remote` - Apply migrations to remote D1 database
- `npm run db:seed` - Seed database with sample data

## Database Architecture

The app uses **Cloudflare D1**, a serverless SQLite database, with automatic fallback to **better-sqlite3** for local development.

### Local Development
- Uses **better-sqlite3** (local SQLite file)
- Database location: `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/58c3811a0dfd4f178d1a16bb8fada81b.sqlite`
- Wrangler provides D1 bindings locally via `process.env.DB`
- Proxy pattern automatically selects local SQLite when D1 is unavailable

### Production (Cloudflare Pages)
- Uses **Cloudflare D1** (serverless SQLite)
- Accessed via `process.env.DB` environment binding
- Shared database across all Cloudflare deployments
- Database ID: `58c3811a-0dfd-4f17-8d1a-16bb8fada81b`

### Database Proxy Pattern

The database connection uses a Proxy pattern for runtime switching:

```typescript
// src/lib/db.ts
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const d1 = process.env.DB as D1Database | undefined;

    if (d1) {
      // Production: use D1
      const instance = drizzle(d1, { schema });
      return (instance as any)[prop];
    }

    if (localDb) {
      // Development: use better-sqlite3
      return (localDb as any)[prop];
    }

    throw new Error('D1 binding not found and local database unavailable');
  }
});
```

**Key Benefits:**
- Same codebase for local and production
- No environment-specific code paths
- Automatic database selection at runtime
- Type-safe with full Drizzle ORM support

### Schema Management

The database schema is defined in `drizzle/schema.ts`.

**To make schema changes:**

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply to local: `npm run db:migrate:local`
4. Apply to remote: `npm run db:migrate:remote`

**Schema Overview:**
- `boards` - Kanban boards
- `lists` - Lists within boards (Todo, In-Progress, QA, Done)
- `cards` - Cards within lists
- `users` - User accounts
- `tags` - Tags for categorizing cards
- `card_tags` - Many-to-many relationship between cards and tags
- `comments` - Comments on cards

**Type Conversions from Postgres:**
- `pgTable` → `sqliteTable`
- `varchar()` → `text()`
- `timestamp()` → `integer({ mode: 'timestamp' })`
- `boolean()` → `integer({ mode: 'boolean' })`

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
- ✅ Cloudflare Pages deployment
- ✅ Cloudflare D1 serverless database

## Deployment Configuration

### wrangler.toml

The `wrangler.toml` file configures Cloudflare Pages deployment:

```toml
name = "kanban-nextjs-cf"
compatibility_date = "2025-11-07"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "kanban-db"
database_id = "58c3811a-0dfd-4f17-8d1a-16bb8fada81b"
```

**Key Configuration:**
- `nodejs_compat` - Enables Node.js compatibility for Next.js
- `DB` binding - Makes D1 database available as `process.env.DB`
- Shared database ID across all apps in the comparison

## Troubleshooting

### "D1 binding not found" error
The D1 binding isn't available. Ensure:
- Local: Run `npm run dev` (uses Wrangler to provide bindings)
- Production: Database binding is configured in `wrangler.toml`

### "no such table" error
The database schema hasn't been applied. Run:
```bash
# Local
npm run db:migrate:local

# Remote (Cloudflare)
npm run db:migrate:remote
```

### Local dev doesn't connect to database
The database will be created automatically when you run `npm run dev`. Check that better-sqlite3 is installed and the database file can be created in the `.wrangler/state` directory.

### Type errors after schema changes
Regenerate migration files:
```bash
npm run db:generate
```

## Performance

**Bundle Sizes** (similar to Vercel variant):
- **Home Page**: ~156 kB compressed
- **Board Page**: ~177 kB compressed
- **Compression Ratio**: 69%

**Cloudflare Pages Benefits:**
- Global edge network deployment
- Automatic CDN caching
- D1 database co-located with compute
- Fast TTFB due to edge proximity

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)

## License

MIT
