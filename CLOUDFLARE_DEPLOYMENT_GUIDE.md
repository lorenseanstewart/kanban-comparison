# Cloudflare Pages Deployment Guide

This guide documents the complete process for deploying framework apps to Cloudflare Pages with D1 database support. This was developed while migrating the Next.js kanban app and should be used as a reference for migrating other apps in this project.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [D1 Database Setup](#d1-database-setup)
- [Code Changes Required](#code-changes-required)
- [Framework-Specific Configuration](#framework-specific-configuration)
- [Deployment Process](#deployment-process)
- [Common Issues & Solutions](#common-issues--solutions)
- [Testing & Verification](#testing--verification)

---

## Architecture Overview

### Before: Local SQLite
- **Database**: better-sqlite3 (synchronous SQLite)
- **Hosting**: Traditional Node.js server
- **Environment**: Single environment (local only)

### After: Cloudflare D1
- **Database**: Cloudflare D1 (async SQLite on edge)
- **Hosting**: Cloudflare Pages (Edge Runtime)
- **Environment**: Separate local and production D1 instances
- **Benefits**:
  - Global edge deployment
  - Low latency worldwide
  - No server management
  - Automatic scaling

---

## Prerequisites

### 1. Cloudflare Account
- Sign up at https://dash.cloudflare.com/
- Note your account ID (found in dashboard)

### 2. Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 3. GitHub Repository
- Code must be in a GitHub repository
- Cloudflare Pages connects to GitHub for automatic deployments

---

## D1 Database Setup

### Step 1: Create D1 Database

```bash
# Create production D1 database
wrangler d1 create kanban-db

# Output will include:
# - Database name: kanban-db
# - Database ID: <uuid>
# - Save these for wrangler.toml
```

### Step 2: Create wrangler.toml

Create `wrangler.toml` in your app directory:

```toml
name = "kanban-nextjs"  # Change per app
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "kanban-db"
database_id = "your-database-id-here"  # From wrangler d1 create output
```

**Important Configuration Notes:**
- `compatibility_flags = ["nodejs_compat"]` is REQUIRED for frameworks like Next.js
- `binding = "DB"` - this name must match your code's environment variable access
- Same database can be shared across all apps for fair performance comparison

### Step 3: Database Schema Migration

You have two options for applying schema:

#### Option A: SQL File (Recommended for production)
```bash
# Create migration SQL from Drizzle schema
# (use your existing drizzle migrations or export schema)

# Apply to production
wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_migration.sql

# Apply to local dev
wrangler d1 execute kanban-db --local --file=./drizzle/migrations/0000_migration.sql
```

#### Option B: Migration API Route (Better for development)
Create `/api/migrate` route that applies schema via HTTP POST:

```typescript
// app/api/migrate/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  // @ts-ignore
  const d1 = process.env.DB as D1Database;

  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS users (...)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS boards (...)`),
    // ... more tables
  ]);

  return NextResponse.json({ success: true });
}
```

Then run:
```bash
# Local dev
curl -X POST http://localhost:8788/api/migrate

# Production
curl -X POST https://your-app.pages.dev/api/migrate
```

### Step 4: Seed Data

Similar to migration, create `/api/seed` route:

```typescript
export const runtime = 'edge';

export async function POST() {
  const d1 = process.env.DB as D1Database;
  const db = getDatabase(d1);

  // Insert seed data using Drizzle ORM
  await db.insert(users).values([...]);
  await db.insert(boards).values([...]);

  return NextResponse.json({ success: true });
}
```

---

## Code Changes Required

### 1. Remove better-sqlite3 Dependency

**package.json:**
```diff
{
  "dependencies": {
-   "better-sqlite3": "^12.4.1"
  },
  "devDependencies": {
-   "@types/better-sqlite3": "^7.6.13"
  }
}
```

### 2. Update Database Connection

**Before (better-sqlite3):**
```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database('kanban.db');
export const db = drizzle(sqlite);
```

**After (D1):**
```typescript
/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';

export function getDatabase(d1Binding: D1Database) {
  return drizzle(d1Binding);
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    // @ts-ignore
    const d1 = process.env.DB as D1Database | undefined;

    if (!d1) {
      throw new Error('D1 binding not found');
    }

    const instance = getDatabase(d1);
    return (instance as any)[prop];
  }
});
```

### 3. Make All Database Operations Async

**Before:**
```typescript
const users = db.select().from(usersTable).all();
```

**After:**
```typescript
const users = await db.select().from(usersTable);
```

**Critical:** ALL database operations must use `await`. D1 is fully async.

### 4. Remove Drizzle Transactions

D1 doesn't support SQL `BEGIN TRANSACTION`. Remove `db.transaction()`:

**Before:**
```typescript
await db.transaction(async (tx) => {
  await tx.insert(cards).values({...});
  await tx.insert(cardTags).values([...]);
});
```

**After:**
```typescript
// Sequential operations
await db.insert(cards).values({...});
await db.insert(cardTags).values([...]);
```

**Note:** For true atomicity needs, use D1's batch API:
```typescript
await d1.batch([
  d1.prepare('INSERT INTO cards ...'),
  d1.prepare('INSERT INTO card_tags ...'),
]);
```

### 5. Delete Old Migration Scripts

Remove any scripts that use better-sqlite3:
- `scripts/migrate-db.ts`
- `scripts/reset-db.js`
- Any other files importing better-sqlite3

---

## Framework-Specific Configuration

### Next.js

#### 1. Install Cloudflare Adapter

```bash
npm install --save-dev @cloudflare/next-on-pages
```

#### 2. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "npm run pages:build && wrangler pages dev .vercel/output/static --d1=DB=kanban-db --live-reload",
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static",
    "pages:watch": "npx @cloudflare/next-on-pages --watch"
  }
}
```

#### 3. Add Edge Runtime to All Dynamic Routes

**CRITICAL:** Every route that uses D1 must export `runtime = 'edge'`:

```typescript
// app/page.tsx
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// app/board/[id]/page.tsx
export const runtime = 'edge';

// app/api/*/route.ts
export const runtime = 'edge';
```

#### 4. Server Actions → API Routes

**Issue:** Server Actions return 404 errors on Cloudflare Pages.

**Solution:** Convert all Server Actions to API routes.

**Before (Server Action):**
```typescript
// lib/actions.ts
'use server';

export async function createCard(formData: FormData) {
  const title = formData.get('title') as string;
  await db.insert(cards).values({ title });
  revalidatePath('/board/[id]');
  return { success: true };
}
```

**After (API Route):**
```typescript
// app/api/cards/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const body = await request.json() as { title: string };

  const d1 = process.env.DB as D1Database;
  const db = getDatabase(d1);

  await db.insert(cards).values({ title: body.title });

  revalidatePath('/board/[id]');
  return NextResponse.json({ success: true });
}
```

**Component Update:**
```typescript
// Before
import { createCard } from '@/lib/actions';
await createCard(formData);

// After
const response = await fetch('/api/cards/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Card title' }),
});
const result = await response.json();
```

**Benefits:**
- Works reliably on Cloudflare Pages
- 8-12KB smaller bundle size per route
- Better TypeScript support
- Clearer separation of concerns

#### 5. TypeScript Type Annotations

Always type your API request/response bodies:

```typescript
const body = await request.json() as {
  title: string;
  description?: string;
  assigneeId?: string;
};

const result = await response.json() as {
  success: boolean;
  error?: string;
  data?: { id: string };
};
```

### Other Frameworks

#### SolidStart
- Use `@cloudflare/workers-types` for D1 types
- Configure `solid-start-cloudflare-pages` adapter
- Ensure all server functions are async

#### Qwik City
- Use `vite-plugin-cloudflare` adapter
- Configure edge runtime in `vite.config.ts`
- Update all loaders/actions to be async

#### Analog (Angular)
- Use Nitro's Cloudflare preset
- Update `vite.config.ts` with cloudflare adapter
- Make all server routes async

---

## Deployment Process

### Step 1: Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers & Pages**
3. Click **Create Application** → **Pages** → **Connect to Git**
4. Select your GitHub repository
5. Configure build settings

### Step 2: Build Configuration

**Framework**: Next.js (Static HTML + Worker)

**Build Settings:**
```
Build command: npm run pages:build
Build output directory: .vercel/output/static
Root directory: /kanban-nextjs (or your app folder)
Node version: 20
```

**Environment Variables:**
```
NODE_VERSION = 20
```

### Step 3: D1 Database Binding

**CRITICAL STEP** - Without this, you'll get "D1 binding not found" errors.

1. After deployment, go to your Pages project settings
2. Navigate to **Settings** → **Functions**
3. Scroll to **D1 database bindings**
4. Add binding:
   - **Variable name**: `DB` (must match wrangler.toml binding)
   - **D1 database**: Select your `kanban-db` database
5. Click **Save**
6. Redeploy your application

### Step 4: Apply Schema & Seed Data

```bash
# Using API routes (recommended)
curl -X POST https://your-app.pages.dev/api/migrate
curl -X POST https://your-app.pages.dev/api/seed

# Or using wrangler CLI
wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_migration.sql
wrangler d1 execute kanban-db --file=./scripts/seed-d1.sql
```

### Step 5: Verify Deployment

1. Visit https://your-app.pages.dev/
2. Test creating/editing/deleting data
3. Check drag-and-drop functionality
4. Verify all features work

---

## Common Issues & Solutions

### Issue 1: "D1 binding not found"

**Cause:** D1 database not bound to Pages project.

**Solution:**
1. Go to Pages project → Settings → Functions
2. Add D1 database binding with variable name `DB`
3. Redeploy

### Issue 2: "nodejs_compat compatibility flag not set"

**Cause:** Missing compatibility flag in wrangler.toml.

**Solution:**
Add to `wrangler.toml`:
```toml
compatibility_flags = ["nodejs_compat"]
```

### Issue 3: "Failed query: begin" (Transaction Error)

**Cause:** Using `db.transaction()` which tries to execute SQL BEGIN TRANSACTION.

**Solution:** Remove transaction wrappers, use sequential operations:
```typescript
// Instead of db.transaction()
await db.insert(cards).values({...});
await db.insert(cardTags).values([...]);
```

### Issue 4: Server Actions Return 404

**Cause:** Cloudflare Pages doesn't support Next.js Server Actions reliably.

**Solution:** Convert to API routes (see Framework-Specific Configuration above).

### Issue 5: "no such table: boards"

**Cause:** Database schema not applied.

**Solution:**
```bash
# Local
curl -X POST http://localhost:8788/api/migrate

# Production
curl -X POST https://your-app.pages.dev/api/migrate
```

### Issue 6: Build Fails with better-sqlite3 Errors

**Cause:** Old scripts still reference better-sqlite3.

**Solution:**
- Remove better-sqlite3 from package.json
- Delete old migration scripts
- Remove all imports of better-sqlite3

### Issue 7: TypeScript Errors "Property does not exist on type 'unknown'"

**Cause:** Missing type annotations on JSON parsing.

**Solution:**
```typescript
const body = await request.json() as { title: string };
const result = await response.json() as { success: boolean };
```

### Issue 8: Local Dev "404" on Root Path

**Cause:** Need to rebuild after changes.

**Solution:**
```bash
npm run dev
# This runs pages:build first, then starts wrangler
```

---

## Testing & Verification

### Local Testing

1. **Start dev server:**
   ```bash
   npm run dev
   # Server runs at http://localhost:8788
   ```

2. **Apply schema & seed locally:**
   ```bash
   curl -X POST http://localhost:8788/api/migrate
   curl -X POST http://localhost:8788/api/seed
   ```

3. **Test all features:**
   - Create/read/update/delete operations
   - Drag and drop
   - Complex queries
   - Error handling

### Production Testing

1. **Deploy to Cloudflare Pages** (auto-deploy on git push)

2. **Apply schema & seed production:**
   ```bash
   curl -X POST https://your-app.pages.dev/api/migrate
   curl -X POST https://your-app.pages.dev/api/seed
   ```

3. **Monitor logs:**
   ```bash
   npx wrangler pages deployment tail --project-name=your-app-name
   ```

4. **Test production:**
   - Visit https://your-app.pages.dev/
   - Test all functionality
   - Check for errors in console
   - Verify data persistence

### Performance Testing

Once deployed, test with:
- Lighthouse (for Web Vitals)
- WebPageTest
- Cloudflare Analytics (automatic)

---

## Sharing D1 Database Across Apps

For fair performance comparison, all apps can share one D1 database:

1. **Create one D1 database:**
   ```bash
   wrangler d1 create kanban-db
   ```

2. **Use same database ID in all apps' wrangler.toml:**
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "kanban-db"
   database_id = "58c3811a-0dfd-4f17-8d1a-16bb8fada81b"  # Same for all
   ```

3. **Schema must be identical** across all apps.

4. **No data isolation** - all apps see same data.

**Benefits:**
- Fair performance comparison
- Single source of truth
- Easier data management

**Considerations:**
- Schema changes affect all apps
- Need consistent seed data
- Careful with destructive operations

---

## Summary Checklist

Use this checklist when migrating each app:

### Setup
- [ ] Create/reuse D1 database (`wrangler d1 create`)
- [ ] Create `wrangler.toml` with database ID and nodejs_compat flag
- [ ] Install framework's Cloudflare adapter

### Code Changes
- [ ] Remove better-sqlite3 from package.json
- [ ] Update database connection to use D1
- [ ] Make ALL database operations async
- [ ] Remove Drizzle transactions
- [ ] Delete old migration scripts that use better-sqlite3
- [ ] Add `export const runtime = 'edge'` to all dynamic routes
- [ ] Convert Server Actions to API routes (Next.js only)
- [ ] Add TypeScript type annotations to JSON parsing
- [ ] Create /api/migrate and /api/seed routes

### Configuration
- [ ] Update package.json scripts for Cloudflare deployment
- [ ] Add build configuration files (if needed)
- [ ] Test local dev with wrangler

### Deployment
- [ ] Push code to GitHub
- [ ] Connect repository to Cloudflare Pages
- [ ] Configure build settings
- [ ] Add D1 database binding in Pages settings
- [ ] Deploy application
- [ ] Apply schema via /api/migrate
- [ ] Seed data via /api/seed
- [ ] Test all functionality

### Verification
- [ ] All CRUD operations work
- [ ] Drag and drop works (if applicable)
- [ ] No console errors
- [ ] Data persists correctly
- [ ] Performance is acceptable
- [ ] Monitor logs show no errors

---

## Additional Resources

- **Cloudflare D1 Docs:** https://developers.cloudflare.com/d1/
- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Next.js on Cloudflare:** https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/
- **Drizzle ORM D1:** https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1

---

## Notes

### Database Security
- D1 database IDs are safe to commit to version control
- They're not secrets - they identify the database but don't grant access
- Access control is via Cloudflare account permissions

### Cost Considerations
- Cloudflare Pages: Free tier includes 500 deployments/month
- D1 Database: Free tier includes 5GB storage, 5M reads/day, 100K writes/day
- More than sufficient for development and testing

### Migration Strategy
1. Start with Next.js (already complete)
2. Move to similar frameworks (React-based like SolidStart)
3. Then different paradigms (Qwik, Analog)
4. Document framework-specific issues in this guide

---

**Document Version:** 1.0
**Last Updated:** 2025-01-03
**Based On:** kanban-nextjs successful deployment
