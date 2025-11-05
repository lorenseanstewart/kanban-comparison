# Vercel Migration Plan

## Executive Summary

Migrating all 10 frameworks from Cloudflare Pages (D1 SQLite) to Vercel (Postgres) to enable:
1. **Fair comparison** - all frameworks on same hosting platform
2. **CSS optimization** - Next.js CSS inlining works natively on Vercel
3. **Better performance tooling** - Vercel has built-in analytics and optimization

**Estimated time:** 2-3 days

## Why Vercel?

### Advantages Over Cloudflare Pages
1. **Native Next.js support** - CSS optimization works out-of-box
2. **Better framework adapters** - Official Vercel adapters for most frameworks
3. **Integrated database** - Vercel Postgres with automatic connection pooling
4. **Edge functions** - Middleware support across all frameworks
5. **Analytics** - Built-in performance monitoring

### Trade-offs
- Smaller edge network than Cloudflare (but still global)
- PostgreSQL instead of SQLite (more powerful, slightly different syntax)

## Phase 1: Database Migration (D1 SQLite → Vercel Postgres)

### Current Setup
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Schema**: Identical across all 10 frameworks
- **Seed data**: Standard Kanban boards/cards/comments

### Migration Strategy

#### 1.1: Create Vercel Postgres Database

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Create Postgres database
vercel postgres create kanban-db
```

#### 1.2: Update Drizzle Schema for PostgreSQL

**Key differences SQLite → PostgreSQL:**

| SQLite | PostgreSQL |
|--------|------------|
| `integer().primaryKey()` | `serial().primaryKey()` |
| `text()` | `varchar()` or `text()` |
| `integer()` (timestamps) | `timestamp()` |
| No native UUID | `uuid` type available |

**Example schema update:**

```typescript
// BEFORE (SQLite/D1)
export const boards = sqliteTable('boards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// AFTER (PostgreSQL)
export const boards = pgTable('boards', {
  id: text('id').primaryKey(), // Keep text IDs for consistency
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### 1.3: Database Connection

**Environment Variables:**
```bash
# Vercel automatically provides these:
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
```

**Drizzle connection:**
```typescript
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

export const db = drizzle(sql, { schema });
```

#### 1.4: Migrate Seed Data

**Process:**
1. Export data from D1 to JSON
2. Transform data if needed (timestamps, IDs)
3. Import to Vercel Postgres via seed script

```bash
# Export from D1
wrangler d1 execute kanban-db --command "SELECT * FROM boards" > boards.json
wrangler d1 execute kanban-db --command "SELECT * FROM cards" > cards.json
wrangler d1 execute kanban-db --command "SELECT * FROM comments" > comments.json

# Seed Vercel Postgres
tsx scripts/seed-vercel-postgres.ts
```

## Phase 2: Framework-by-Framework Migration

### Migration Order (Easiest → Hardest)

1. ✅ **Next.js** (native Vercel support)
2. **SvelteKit** (official Vercel adapter)
3. **SolidStart** (official Vercel adapter)
4. **Nuxt** (official Vercel preset)
5. **Astro (HTMX)** (official Vercel adapter)
6. **Analog** (Angular + Vite, has Vercel support)
7. **Qwik City** (official Vercel adapter)
8. **TanStack React** (Vite + React, needs custom setup)
9. **TanStack Solid** (Vite + Solid, needs custom setup)
10. **Marko** (needs custom Vercel configuration)

### Per-Framework Checklist

For each framework:
- [ ] Install Vercel adapter/preset (if needed)
- [ ] Update `package.json` dependencies
- [ ] Replace D1 database with Vercel Postgres
- [ ] Update Drizzle schema imports
- [ ] Update environment variable access
- [ ] Add `vercel.json` configuration
- [ ] Remove Cloudflare-specific files
- [ ] Test locally with `vercel dev`
- [ ] Deploy to Vercel
- [ ] Verify deployment works
- [ ] Run smoke tests (create board, add card, etc.)

## Phase 3: Detailed Migration Steps

### 3.1: Next.js

**Current config:** `@cloudflare/next-on-pages`
**New config:** Native Vercel deployment (zero-config)

**Steps:**
1. Remove Cloudflare dependencies:
```bash
npm uninstall @cloudflare/next-on-pages @cloudflare/workers-types wrangler
```

2. Add Vercel Postgres:
```bash
npm install @vercel/postgres drizzle-orm
```

3. Update database connection:
```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

export const db = drizzle(sql, { schema });
```

4. Update Drizzle schema (see 1.2 above)

5. Remove `wrangler.toml`, `functions/` folder

6. Deploy:
```bash
vercel --prod
```

### 3.2: SvelteKit

**Current:** Cloudflare adapter
**New:** Vercel adapter

```bash
npm uninstall @sveltejs/adapter-cloudflare
npm install @sveltejs/adapter-vercel @vercel/postgres
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'edge', // Use Edge Runtime for better performance
    })
  }
};
```

### 3.3: SolidStart

**Current:** Cloudflare preset
**New:** Vercel preset

```bash
npm install @vercel/postgres
```

```typescript
// app.config.ts
import { defineConfig } from '@solidjs/start/config';

export default defineConfig({
  server: {
    preset: 'vercel'
  }
});
```

### 3.4: Nuxt

**Current:** Cloudflare preset
**New:** Vercel preset

```bash
npm uninstall nitropack-cloudflare
npm install @vercel/postgres
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel'
  }
});
```

### 3.5: Astro (HTMX)

**Current:** Cloudflare adapter
**New:** Vercel adapter

```bash
npm uninstall @astrojs/cloudflare
npm install @astrojs/vercel @vercel/postgres
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel()
});
```

### 3.6: Analog (Angular)

**Current:** Cloudflare Pages via Vite
**New:** Vercel via Vite

```bash
npm install @vercel/postgres
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

export default defineConfig({
  plugins: [
    analog({
      nitro: {
        preset: 'vercel'
      }
    })
  ]
});
```

### 3.7: Qwik City

**Current:** Cloudflare Pages adapter
**New:** Vercel Edge adapter

```bash
npm install @vercel/postgres
```

```typescript
// adapters/vercel-edge/vite.config.ts
import { vercelEdgeAdapter } from '@builder.io/qwik-city/adapters/vercel-edge/vite';

export default defineConfig({
  plugins: [
    qwikCity({
      adapter: vercelEdgeAdapter()
    })
  ]
});
```

### 3.8-3.10: Vite-based Frameworks (TanStack, Marko)

**These need custom `vercel.json` configuration:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**For SSR support, may need:**
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@2.15.0"
    }
  }
}
```

## Phase 4: Common Database Schema

**Single source of truth** - use one schema file for all frameworks.

```typescript
// shared/schema.ts (PostgreSQL version)
import { pgTable, text, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const boards = pgTable('boards', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cards = pgTable('cards', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 50 }),
  assigneeId: text('assignee_id'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

## Phase 5: Testing & Validation

### 5.1: Local Testing

For each framework:
```bash
# Install Vercel CLI
npm i -g vercel

# Link to Vercel project
vercel link

# Pull environment variables (including Postgres connection)
vercel env pull

# Test locally
vercel dev

# Verify:
# - Homepage loads
# - Can create board
# - Can add/move/delete cards
# - Can add comments
# - Database persists data
```

### 5.2: Deployment Testing

```bash
# Deploy to preview
vercel

# Test preview deployment thoroughly
# - All routes work
# - Database operations work
# - No console errors
# - Performance acceptable

# Deploy to production
vercel --prod
```

### 5.3: Smoke Tests

For each framework:
- [ ] Homepage renders
- [ ] Board list loads
- [ ] Can create new board
- [ ] Board detail page loads
- [ ] Can create card
- [ ] Can drag-and-drop cards
- [ ] Can edit card
- [ ] Can delete card
- [ ] Can add comment
- [ ] Charts render correctly

## Phase 6: CSS Optimization (Post-Migration)

Once all frameworks are on Vercel:

### 6.1: Next.js (Native)
```typescript
// next.config.ts
export default {
  experimental: {
    optimizeCss: true, // Works natively on Vercel!
  }
};
```

### 6.2: Vite Frameworks
```typescript
// vite.config.ts
export default {
  build: {
    inlineStylesheets: 'always',
    cssCodeSplit: false,
  }
};
```

### 6.3: Nuxt
```typescript
// nuxt.config.ts
export default {
  features: {
    inlineStyles: true, // Already working
  }
};
```

## Phase 7: Re-measurement

```bash
# Measure each framework (now on Vercel)
tsx scripts/measure-single.ts --url https://kanban-nextjs.vercel.app --runs 10
tsx scripts/measure-single.ts --url https://kanban-nuxt.vercel.app --runs 10
# ... etc for all 10

# Aggregate results
tsx scripts/aggregate-measurements.ts

# Generate charts
tsx scripts/generate-charts.ts
```

## Timeline & Effort Estimate

### Day 1: Database & Infrastructure (6-8 hours)
- ✅ Create Vercel account/project
- ✅ Set up Vercel Postgres database
- ✅ Update shared Drizzle schema for PostgreSQL
- ✅ Create seed script for Vercel Postgres
- ✅ Test database connection
- ✅ Migrate Next.js (easiest, test case)

### Day 2: Framework Migration Batch 1 (8-10 hours)
- Migrate SvelteKit
- Migrate SolidStart
- Migrate Nuxt
- Migrate Astro (HTMX)
- Test all deployments

### Day 3: Framework Migration Batch 2 + Optimization (8-10 hours)
- Migrate Analog
- Migrate Qwik City
- Migrate TanStack React
- Migrate TanStack Solid
- Migrate Marko
- Implement CSS optimization (all frameworks)
- Run full measurement suite
- Update documentation

**Total: 22-28 hours over 3 days**

## Risks & Mitigation

### Risk 1: Framework adapter incompatibilities
**Mitigation:** Start with well-supported frameworks (Next, SvelteKit, Nuxt), document issues

### Risk 2: PostgreSQL query differences
**Mitigation:** Drizzle ORM abstracts most differences; test thoroughly

### Risk 3: Vercel free tier limits
**Mitigation:** May need to use paid plan for all 10 deployments

### Risk 4: Environment variable migration
**Mitigation:** Use `vercel env pull` to sync all envs locally before deploying

### Risk 5: Build time differences
**Mitigation:** Some frameworks may build slower/faster on Vercel vs Cloudflare

## Success Criteria

- [ ] All 10 frameworks deployed to Vercel
- [ ] All frameworks using Vercel Postgres
- [ ] All frameworks pass smoke tests
- [ ] CSS optimization implemented where possible
- [ ] Full measurement suite completed
- [ ] Performance improvements documented
- [ ] Fair comparison achieved (same platform for all)

## Rollback Plan

If migration fails catastrophically:
1. All Cloudflare deployments still exist
2. Git history preserved
3. Can rollback to pre-migration state
4. Keep D1 database as backup

## Questions to Resolve

- [ ] Vercel account/plan - which tier?
- [ ] Database name convention?
- [ ] URL structure - `{framework}.vercel.app` or custom domains?
- [ ] Environment variable strategy across 10 projects?

---

**Ready to begin?** Start with Phase 1 (Database) and Next.js migration as proof of concept.
