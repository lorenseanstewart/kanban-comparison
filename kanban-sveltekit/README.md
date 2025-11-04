# Kanban SvelteKit

Kanban board built with SvelteKit 5, remote functions, and Cloudflare D1.

## Features

- SvelteKit 5 with experimental remote functions (`query`, `form`, `command`)
- Cloudflare D1 for serverless SQL database
- Drizzle ORM for type-safe database queries
- TailwindCSS 4 + DaisyUI for styling
- Deployed to Cloudflare Pages

## Prerequisites

- Node.js 20+
- npm or pnpm
- Cloudflare account (for deployment)
- Wrangler CLI (installed as dev dependency)

## Setup

```bash
npm install
```

## Local Development

This project is configured to run with Cloudflare's Wrangler for local development.

### 1. Create Local D1 Database

First, create a local D1 database:

```bash
npx wrangler d1 create kanban-db
```

This will output a database ID. Update the `database_id` in `wrangler.toml` with this value.

### 2. Build the Application

```bash
npm run build
```

### 3. Start Dev Server

In one terminal, start the Wrangler dev server:

```bash
npm run dev
```

This runs the app at [http://localhost:8788](http://localhost:8788) using Wrangler Pages with D1 binding.

### 4. Initialize Database

In another terminal, run the setup script to apply migrations and seed data:

```bash
npm run setup
```

This script will:
- Wait for the dev server to start
- Apply the database schema via `/api/migrate` endpoint
- Seed the database with sample data via `/api/seed` endpoint

You can now visit [http://localhost:8788](http://localhost:8788) to see the app!

## Database Management

### Schema Changes

If you modify the schema in `drizzle/schema.ts`:

1. Generate new migration:
   ```bash
   npm run db:generate
   ```

2. Update `/api/migrate/+server.ts` with the new schema SQL

3. Restart dev server and run setup again

### Reset Database

To reset your local database, just run the setup script again:

```bash
npm run setup
```

The seed endpoint clears all existing data before inserting fresh data.

## Deployment to Cloudflare Pages

### 1. Create Production D1 Database

```bash
npx wrangler d1 create kanban-db --env production
```

### 2. Connect Repository to Cloudflare Pages

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Framework preset**: SvelteKit
   - **Build command**: `npm run build`
   - **Build output directory**: `.svelte-kit/cloudflare`

### 3. Add D1 Binding

In your Cloudflare Pages project settings:

1. Go to **Settings** → **Functions** → **D1 database bindings**
2. Add a binding:
   - **Variable name**: `DB`
   - **D1 database**: Select your `kanban-db` database

### 4. Deploy

Trigger a deployment. Once deployed, initialize your production database:

```bash
# Get your production URL
curl -X POST https://your-app.pages.dev/api/migrate
curl -X POST https://your-app.pages.dev/api/seed
```

Your app is now live!

## API Endpoints

- `POST /api/migrate` - Apply database schema
- `POST /api/seed` - Seed database with sample data

## Tech Stack

- **Framework**: SvelteKit 5
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Styling**: TailwindCSS 4 + DaisyUI
- **Validation**: Valibot
- **Deployment**: Cloudflare Pages
- **Local Dev**: Wrangler

## Project Structure

```
kanban-sveltekit/
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts          # D1 database factory
│   │   │   └── schema.ts         # Database schema export
│   │   ├── server/
│   │   │   └── boards.ts         # Server-side queries
│   │   ├── board.remote.ts       # Remote functions for board operations
│   │   └── boards.remote.ts      # Remote functions for boards list
│   ├── routes/
│   │   ├── api/
│   │   │   ├── migrate/+server.ts  # Schema migration endpoint
│   │   │   └── seed/+server.ts     # Database seed endpoint
│   │   └── ...                     # Page routes
│   └── app.d.ts                    # Platform types
├── drizzle/
│   ├── migrations/                 # SQL migrations
│   └── schema.ts                   # Drizzle schema definitions
├── scripts/
│   └── seed-dev.sh                 # Local setup script
├── wrangler.toml                   # Cloudflare configuration
└── package.json

```

## Key Differences from Traditional SvelteKit

### 1. Database Access Pattern

Instead of importing a singleton database instance, all functions accept a D1 binding:

```typescript
// ❌ Old pattern (doesn't work with D1)
import { db } from '$lib/db';
export async function getBoards() {
  return db.select().from(boards);
}

// ✅ New pattern (works with D1)
export async function getBoards(d1: D1Database) {
  const db = getDatabase(d1);
  return db.select().from(boards);
}
```

### 2. Remote Functions Access Platform

Remote functions (query, form, command) receive the event object to access D1:

```typescript
export const getBoards = query(async (event) => {
  const d1 = event.platform?.env?.DB as D1Database;
  return await getBoardsFromServer(d1);
});
```

### 3. No Transactions

D1 doesn't support `db.transaction()`. Use sequential operations instead:

```typescript
// ❌ Doesn't work with D1
db.transaction((tx) => {
  tx.insert(cards).values({...});
  tx.insert(cardTags).values([...]);
});

// ✅ Works with D1
await db.insert(cards).values({...});
await db.insert(cardTags).values([...]);
```

### 4. Parameter Limits

D1 has a 448 parameter limit for prepared statements. Batch large inserts:

```typescript
const BATCH_SIZE = 10;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await db.insert(table).values(batch);
}
```

## Troubleshooting

### Dev server not starting

Make sure you've built the app first:
```bash
npm run build
npm run dev
```

### Database errors

Reset your database:
```bash
npm run setup
```

### Type errors with D1Database

Make sure you have `@cloudflare/workers-types` installed and the reference in your files:
```typescript
/// <reference types="@cloudflare/workers-types" />
```

## Resources

- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Cloudflare Pages Deployment Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/)
