# Kanban Board - Qwik City Implementation ⚡️

A full-featured Kanban board application built with Qwik City, featuring drag-and-drop, real-time updates, and Cloudflare D1 database persistence.

## Tech Stack

- **Framework**: Qwik City with Vite
- **Database**: Cloudflare D1 with Drizzle ORM
- **Hosting**: Cloudflare Pages
- **Styling**: Tailwind CSS + DaisyUI
- **Charts**: charts.css

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

### Subsequent Runs

```bash
npm run dev
```

Visit [http://localhost:8788](http://localhost:8788)

## Available Scripts

### Development
- `npm run dev` - Build and start Cloudflare Pages dev server with D1
- `npm run build` - Build for production (alias for pages:build)
- `npm run pages:build` - Build for Cloudflare Pages deployment
- `npm run pages:deploy` - Deploy to Cloudflare Pages
- `npm run setup` - Initialize database via API (migrate + seed)
- `npm run fmt` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

### Database
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:migrate:local` - Apply migrations to local D1
- `npm run db:migrate` - Apply migrations to production D1
- `npm run seed:local` - Seed local D1 with sample data
- `npm run seed` - Seed production D1 with sample data

## Database Setup

The app uses **Cloudflare D1** (SQLite on the edge) with Drizzle ORM. The database is configured in `wrangler.toml`.

### Local Development

The D1 database runs in-memory during local development. To set it up:

1. Start the dev server: `npm run dev`
2. Run setup script: `npm run setup` (or use curl commands above)

### Seed Database Manually

```bash
# Apply schema
curl -X POST http://localhost:8788/api/migrate

# Seed data
curl -X POST http://localhost:8788/api/seed
```

### Schema Changes

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Update API routes (`src/routes/api/migrate.ts`) with new schema SQL
4. Restart dev server and run migration endpoint

## Deployment to Cloudflare Pages

### Prerequisites

1. Cloudflare account
2. Wrangler CLI authenticated: `npx wrangler login`
3. D1 database created (already configured in `wrangler.toml`)

### Deploy

```bash
npm run pages:deploy
```

### Post-Deployment

After deploying, initialize the production database:

```bash
# Apply schema
curl -X POST https://your-app.pages.dev/api/migrate

# Seed data (optional)
curl -X POST https://your-app.pages.dev/api/seed
```

### Cloudflare Pages Configuration

1. Go to your Cloudflare Pages project settings
2. Navigate to **Settings** → **Functions**
3. Add **D1 database binding**:
   - Variable name: `DB`
   - D1 database: Select `kanban-db`
4. Save and redeploy

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

## Learn More

- [Qwik Documentation](https://qwik.dev/)
- [Qwik City Routing](https://qwik.dev/qwikcity/routing/overview/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)

## License

MIT
