# Kanban Board - Next.js Implementation (with React Compiler)

A full-featured Kanban board application built with Next.js, featuring drag-and-drop, real-time updates, and Neon Postgres database persistence.

Experimental variant with **React 19's compiler** enabled for automatic optimization.

## Tech Stack

- **Framework**: Next.js 16 (beta) with React 19 + React Compiler
- **Database**: Neon Postgres (serverless PostgreSQL) with Drizzle ORM
- **Deployment**: Vercel (serverless functions)
- **Styling**: Tailwind CSS v4 + DaisyUI
- **Drag & Drop**: @dnd-kit
- **Charts**: charts.css

## What's Different About This Variant?

- Enables `experimental.reactCompiler: true` in `next.config.ts`
- Auto-memoizes renders, computations, and callbacks without manual `useMemo`/`useCallback`
- Same code as standard Next.js app - compiler optimizes automatically
- ~3% smaller bundle size
- **Neon Postgres database** - serverless PostgreSQL shared across all framework implementations

**Note**: React Compiler is still experimental - not recommended for production.

## CSS Optimization

This implementation includes several CSS optimizations documented in [CSS.md](./CSS.md):

- **Tailwind CSS v4**: Native CSS features with better tree-shaking
- **Font loading optimization**: `display: "optional"` for non-blocking font rendering
- **CSS consolidation**: Single entry point for better compression
- **Next.js CSS optimization**: `optimizeCss: true` for critical CSS extraction

**Performance**: Achieves **96/100 Lighthouse score** with ~2280ms FCP on 4G mobile emulation.

## Quick Start

### First Time Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials
```

**Environment Variables (.env.local):**
```bash
# Neon Postgres connection string (required)
POSTGRES_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/kanban?sslmode=require"

# Alternative: separate DATABASE_URL (either works)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/kanban?sslmode=require"
```

**Initialize Database:**
```bash
# Apply schema
npm run db:push

# Seed with sample data
npm run db:seed
```

### Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Production Deployment

This app is deployed at: **https://kanban-nextjs-ochre.vercel.app/**

### Deploy to Vercel

1. **Connect to Vercel**:
   ```bash
   vercel
   ```

2. **Configure Environment Variables** in Vercel Dashboard:
   - `POSTGRES_URL` - Neon Postgres connection string
   - Vercel automatically injects this at runtime (no need for `.env` files in production)

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Database Setup

The Neon Postgres database is shared across all framework implementations in this project. If you're setting up a fresh deployment:

1. Create a Neon Postgres database at [neon.tech](https://neon.tech)
2. Copy the connection string to `POSTGRES_URL` environment variable
3. Apply schema: `npm run db:push`
4. Seed data: `npm run db:seed`

## Available Scripts

### Development
- `npm run dev` - Start Next.js development server (port 3000)
- `npm run build` - Build Next.js production bundle
- `npm run start` - Run production server locally
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Database (Drizzle ORM)
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Apply pending migrations to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Database Architecture

The app uses **Neon Postgres**, a serverless PostgreSQL database with automatic scaling and branching.

### Local Development
- Connects to remote Neon database (same as production)
- Uses connection string from `.env.local`
- Singleton pattern with global caching for connection pooling
- Max 10 connections in development

### Production (Vercel)
- Connects to same Neon database via environment variable
- Uses connection string from Vercel environment variables (`POSTGRES_URL`)
- Singleton pattern optimized for serverless (max 1 connection per function instance)
- Automatic connection management

### Schema Management

The database schema is defined in `src/drizzle/schema.ts`.

**To make schema changes:**

1. Modify schema in `src/drizzle/schema.ts`
2. Push changes: `npm run db:push` (development)
3. Or generate migration: `npm run db:generate`
4. Apply migration: `npm run db:migrate`

**Schema Overview:**
- `boards` - Kanban boards
- `lists` - Lists within boards (Todo, In-Progress, QA, Done)
- `cards` - Cards within lists
- `users` - User accounts
- `tags` - Tags for categorizing cards
- `card_tags` - Many-to-many relationship between cards and tags
- `card_users` - Many-to-many relationship between cards and assigned users
- `comments` - Comments on cards

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
- ✅ Serverless deployment (Vercel)
- ✅ Serverless database (Neon Postgres)

## Environment Configuration

### Local Development (.env.local)
```bash
# Required: Neon Postgres connection string
POSTGRES_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/kanban?sslmode=require"
```

### Production (Vercel)
Configure in Vercel Dashboard (Project Settings → Environment Variables):

- `POSTGRES_URL` - Neon Postgres connection string (production database)

Vercel automatically injects environment variables at runtime into serverless functions.

## Deployment

### Via Vercel CLI
```bash
# First time setup
vercel

# Production deployment
vercel --prod
```

### Via Vercel Dashboard
1. Connect your Git repository
2. Build command: `npm run build`
3. Build output directory: `.next`
4. Add environment variable: `POSTGRES_URL`
5. Deploy!

## Database Connection Pattern

This app uses a **singleton pattern** for database connections optimized for Vercel serverless:

```typescript
// src/lib/db.ts
if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({
    connectionString,
    max: 1, // Serverless: single connection per function instance
  });
  db = drizzle(pool, { schema });
} else {
  if (!global.db) {
    const pool = new Pool({
      connectionString,
      max: 10, // Local dev: can handle more connections
    });
    global.db = drizzle(pool, { schema });
  }
  db = global.db;
}
```

**Key Points:**
- Production: 1 connection per serverless function instance
- Development: Global singleton with connection pooling (max 10)
- No connection string fallbacks (fails explicitly if missing)
- Connection string can be undefined during build (pg.Pool doesn't connect until first query)

## Troubleshooting

### "connect ECONNREFUSED 127.0.0.1:5432" error
The connection string is missing or invalid. Ensure `POSTGRES_URL` or `DATABASE_URL` is set in:
- Local: `.env.local`
- Production: Vercel environment variables

### "no such table" error
The database schema hasn't been applied. Run:
```bash
npm run db:push
```

### Local dev connects to localhost instead of Neon
Check that `.env.local` exists and contains the correct `POSTGRES_URL`. The app will fall back to localhost if the environment variable is not set.

### Type errors after schema changes
Regenerate TypeScript types:
```bash
npm run db:push
```

## Performance

See [CSS.md](./CSS.md) for detailed CSS optimization analysis.

**Lighthouse Scores** (4G mobile, production):
- **Performance**: 96/100
- **FCP**: ~2280ms
- **LCP**: ~2280ms
- **TBT**: 0ms
- **CLS**: 0

**Bundle Sizes**:
- **Home Page**: 156.3 kB compressed (497.9 kB raw)
- **Board Page**: 177.3 kB compressed (563.7 kB raw)
- **Compression Ratio**: 69%

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [React Compiler + Next.js](https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Postgres Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)

## License

MIT
