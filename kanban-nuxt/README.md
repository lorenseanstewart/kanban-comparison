# Kanban Board - Nuxt Implementation

A full-featured Kanban board application built with Nuxt 3, featuring drag-and-drop, real-time updates, and SQLite/D1 persistence.

## Tech Stack

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **Database**: SQLite (local) / Cloudflare D1 (production) with Drizzle ORM
- **Deployment**: Cloudflare Pages
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @formkit/drag-and-drop
- **Animations**: @formkit/auto-animate
- **Charts**: charts.css
- **Validation**: Valibot

## Local Development

The app uses a dual-database setup:
- **Development**: Better-SQLite3 with `drizzle/db.sqlite`
- **Production**: Cloudflare D1

### First Time Setup

```bash
npm install
npm run setup  # Resets, migrates, and seeds the SQLite database
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

> **Note**: Migration files are included in the repo, so you don't need to generate them.

### Subsequent Runs

```bash
npm run dev
```

## Production Deployment

**Production URL**: https://kanban-nuxt.pages.dev/

### First-time Setup

1. **Install dependencies**:

```bash
npm install
```

2. **Migrate production D1 database** (one time only):

```bash
npm run db:migrate:d1
```

This runs:
```bash
wrangler d1 execute kanban-db --remote --file=./drizzle/migrations/0000_calm_captain_britain.sql
```

3. **Seed production database** (optional):

```bash
npm run seed:d1
```

This runs:
```bash
wrangler d1 execute kanban-db --remote --file=./scripts/seed-d1.sql
```

4. **Deploy to Cloudflare Pages**:

```bash
npm run pages:deploy
```

The D1 database binding is configured in `wrangler.toml` and should automatically work once deployed.

### Subsequent Deployments

Just build and deploy:

```bash
npm run pages:deploy
```

### Database Setup Commands

**Migrate production D1 database:**
```bash
wrangler d1 execute kanban-db --remote --file=./drizzle/migrations/0000_calm_captain_britain.sql
```

**Seed production D1 database:**
```bash
wrangler d1 execute kanban-db --remote --file=./scripts/seed-d1.sql
```

**Verify deployment:**
```bash
curl https://kanban-nuxt.pages.dev/api
```

**View production logs:**
```bash
npx wrangler pages deployment tail --project-name=kanban-nuxt --format=pretty
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build production bundle (Node.js)
- `npm run build:cf` - Build for Cloudflare Pages
- `npm run preview` - Preview production build
- `npm run pages:deploy` - Build and deploy to Cloudflare Pages

### Database (Local SQLite)
- `npm run setup` - Initialize database (reset + migrate + seed)
- `npm run db:reset` - Delete database files
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:migrate` - Apply pending migrations to local SQLite
- `npm run db:push` - Push schema changes directly (dev only)
- `npm run seed` - Seed local SQLite database with sample data

### Database (Cloudflare D1)
- `npm run db:migrate:d1` - Apply migrations to production D1 database
- `npm run db:migrate:d1:local` - Apply migrations to local D1 database
- `npm run seed:d1` - Seed production D1 database with sample data
- `npm run seed:d1:local` - Seed local D1 database with sample data
- `npm run setup:d1` - Set up local D1 database (migrate + seed)

## Database Setup

The app uses a dual-database setup:
- **Local Development**: Better-SQLite3 at `drizzle/db.sqlite`
- **Production**: Cloudflare D1

### Local Database (SQLite)

```bash
npm run setup  # This automatically resets, migrates, and seeds
```

### Production Database (D1)

```bash
npm run db:migrate:d1  # Apply schema to production
npm run seed:d1        # Seed production data (optional)
```

### Schema Changes

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply to local: `npm run db:migrate`
4. Apply to D1 production: `npm run db:migrate:d1`

## Project Structure

```
server/
├── api/               # API endpoints
├── db/                # Database seeds
└── utils/             # Server utilities
drizzle/
├── schema.ts          # Database schema
└── migrations/        # Migration files
components/            # Vue components
pages/                 # File-based routing
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
- ✅ Vue 3 Composition API with `<script setup>`
- ✅ Auto-imports for composables and components
- ✅ Typed API routes with Nuxt server handlers
- ✅ Error handling with loading states
- ✅ Server ID reconciliation for optimistic updates

## Learn More

- [Nuxt 3 Documentation](https://nuxt.com/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## License

MIT
