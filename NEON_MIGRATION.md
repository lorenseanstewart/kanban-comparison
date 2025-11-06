# Neon Postgres Migration Tracking

## Overview
Converting all kanban apps from better-sqlite3 to Neon Postgres for Vercel deployment.

## Apps to Migrate
- [x] kanban-nextjs ✅
- [ ] kanban-htmx
- [ ] kanban-analog
- [ ] kanban-nuxt
- [ ] kanban-sveltekit

## Migration Steps Per App

### 1. Update Dependencies
- Remove: `better-sqlite3`, `@types/better-sqlite3`
- Add: `@neondatabase/serverless`, `drizzle-orm` (postgres flavor)
- Update: `drizzle-kit` configuration for postgres

### 2. Update Drizzle Config
- Change from better-sqlite3 to Neon Postgres
- Update connection string to use DATABASE_URL env var
- Update drizzle.config.ts dialect to 'postgresql'

### 3. Update Schema
- Convert SQLite types to PostgreSQL types
- Change `text()` with modes to proper postgres types
- Update timestamps to use `timestamp()` instead of `integer()`
- Ensure UUIDs use `uuid()` type

### 4. Update Database Layer
- Replace better-sqlite3 imports with @neondatabase/serverless
- Update connection initialization
- Remove SQLite pragmas (WAL, busy_timeout)
- Add Neon-specific configuration

### 5. Update Migration Runner
- Switch from better-sqlite3/migrator to postgres/migrator
- Update migration application logic

### 6. Environment Variables
- Add DATABASE_URL to .env.local
- Update .env.example
- Configure Vercel environment variables

### 7. Generate New Migrations
- Run `npm run db:generate` to create new postgres migrations
- Review migration files for correctness

### 8. Testing
- Test locally with Neon database
- Verify all CRUD operations work
- Check seed scripts work correctly

---

## kanban-nextjs Status: ✅ COMPLETE

### Files Modified:
- ✅ package.json - dependencies updated
- ✅ drizzle.config.ts - postgres dialect
- ✅ drizzle/schema.ts - postgres types
- ✅ src/lib/db.ts - Neon connection
- ✅ src/app/api/migrate/route.ts - postgres migrator
- ✅ migrations regenerated

### Testing:
- ✅ Local development working
- ✅ Deployed to Vercel
- ✅ All features functional

---

## kanban-htmx Status: ⏳ IN PROGRESS

### Files to Modify:
- [ ] package.json
- [ ] drizzle.config.ts
- [ ] drizzle/schema.ts
- [ ] src/lib/db.ts
- [ ] src/lib/api.ts (if needed)
- [ ] migrations

---

## kanban-analog Status: 🔜 PENDING

### Files to Modify:
- [ ] package.json
- [ ] drizzle.config.ts
- [ ] drizzle/schema.ts
- [ ] src/server/db/index.ts
- [ ] migrations

---

## kanban-nuxt Status: 🔜 PENDING

### Files to Modify:
- [ ] package.json
- [ ] drizzle.config.ts
- [ ] drizzle/schema.ts
- [ ] server/utils/db.ts
- [ ] migrations

---

## kanban-sveltekit Status: 🔜 PENDING

### Files to Modify:
- [ ] package.json
- [ ] drizzle.config.ts
- [ ] drizzle/schema.ts (need to find/create)
- [ ] src/lib/db/index.ts
- [ ] migrations

---

## Common Issues and Solutions

### Issue: SQLite types don't translate directly
**Solution**: Map SQLite types to Postgres equivalents:
- `integer()` timestamps → `timestamp()`
- `text()` → `text()` or `varchar()`
- UUIDs stored as text → `uuid()`

### Issue: Migration files are SQLite-specific
**Solution**: Regenerate all migrations after schema conversion

### Issue: Pragma statements don't exist in Postgres
**Solution**: Remove all SQLite pragma calls

---

## Environment Setup

### Neon Database Connection
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
```

### Required in Vercel:
- DATABASE_URL environment variable

---

## Next Steps
1. ✅ Create this tracking document
2. ⏳ Convert kanban-htmx
3. 🔜 Convert kanban-analog
4. 🔜 Convert kanban-nuxt
5. 🔜 Convert kanban-sveltekit
6. 🔜 Test all apps
7. 🔜 Deploy and measure

---

Last Updated: 2025-11-05
