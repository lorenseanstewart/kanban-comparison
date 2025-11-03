# Cloudflare D1 Setup Guide for Next.js

This guide will help you set up Cloudflare D1 database for your Next.js Kanban app so it works fully on Cloudflare Pages.

## What is D1?

Cloudflare D1 is a serverless SQLite database that runs on Cloudflare's edge network. It's the perfect replacement for better-sqlite3 when deploying to Cloudflare Pages.

**Benefits:**
- ✅ SQLite-compatible (same SQL syntax)
- ✅ Runs on Cloudflare's global network
- ✅ Works with Drizzle ORM (already set up!)
- ✅ Free tier: 100,000 reads/day, 1,000 writes/day
- ✅ Your code already supports it!

---

## Prerequisites

- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Wrangler authenticated (`wrangler login`)

---

## Step 1: Create D1 Database

### Option A: Using Wrangler CLI (Recommended)

```bash
# Navigate to Next.js directory
cd kanban-nextjs

# Create D1 database
wrangler d1 create kanban-db
```

**Output:**
```
✅ Successfully created DB 'kanban-db'!

[[d1_databases]]
binding = "DB"
database_name = "kanban-db"
database_id = "xxxx-xxxx-xxxx-xxxx-xxxx"
```

**Copy the `database_id`** - you'll need it!

### Option B: Using Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages" → "D1"
3. Click "Create database"
4. Name: `kanban-db`
5. Click "Create"
6. Copy the Database ID from the overview page

---

## Step 2: Update wrangler.toml

Edit `kanban-nextjs/wrangler.toml` and replace `YOUR_D1_DATABASE_ID` with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "kanban-db"
database_id = "your-actual-database-id-here"  # ← Replace this
```

---

## Step 3: Apply Database Schema

Run the migration to create tables in D1:

```bash
# From kanban-nextjs directory
wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_redundant_onslaught.sql
```

**Expected output:**
```
🌀 Executing on kanban-db (xxxx-xxxx):
🌀 To execute on your local DB, use --local
├ 🌀 Processing ./drizzle/migrations/0000_redundant_onslaught.sql
🚣 Executed 7 commands in 0.xxs
```

This creates all the tables: users, boards, lists, cards, tags, card_tags, comments

---

## Step 4: Seed Sample Data (Optional)

To test the database, you can seed it with sample data:

```bash
# Create a seed SQL file first
cat > /tmp/seed.sql << 'EOF'
-- Create sample user
INSERT INTO users (id, name) VALUES ('user-1', 'Demo User');

-- Create sample board
INSERT INTO boards (id, title, description, created_at)
VALUES ('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Sample Board', 'A demo board for testing', strftime('%s', 'now') * 1000);

-- Create sample lists
INSERT INTO lists (id, board_id, title, position, created_at)
VALUES
  ('list-1', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'To Do', 0, strftime('%s', 'now') * 1000),
  ('list-2', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'In Progress', 1, strftime('%s', 'now') * 1000),
  ('list-3', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Done', 2, strftime('%s', 'now') * 1000);

-- Create sample cards
INSERT INTO cards (id, list_id, title, description, position, completed, created_at)
VALUES
  ('card-1', 'list-1', 'Task 1', 'First task', 0, 0, strftime('%s', 'now') * 1000),
  ('card-2', 'list-1', 'Task 2', 'Second task', 1, 0, strftime('%s', 'now') * 1000),
  ('card-3', 'list-2', 'Task 3', 'Third task', 0, 0, strftime('%s', 'now') * 1000);
EOF

# Apply seed data
wrangler d1 execute kanban-db --file=/tmp/seed.sql
```

---

## Step 5: Bind D1 to Cloudflare Pages

### In Cloudflare Pages Dashboard:

1. Go to your Cloudflare Pages project (e.g., `kanban-nextjs`)
2. Click "Settings" → "Functions"
3. Scroll to "D1 database bindings"
4. Click "Add binding"
   - Variable name: `DB`
   - D1 database: Select `kanban-db`
5. Click "Save"

This makes the D1 database available as `env.DB` in your Next.js routes.

---

## Step 6: Test Locally with Wrangler

You can test D1 locally before deploying:

```bash
# Start local Pages dev server with D1 binding
wrangler pages dev .next --d1=DB=kanban-db

# Or use Next.js dev mode (uses local SQLite)
npm run dev
```

**Note:**
- `wrangler pages dev` uses D1 (remote or local)
- `npm run dev` uses local better-sqlite3
- Both work with the same code!

---

## Step 7: Deploy to Cloudflare Pages

Now deploy your app with D1 support:

```bash
# Build the app
npm run build

# Deploy (if using wrangler)
wrangler pages deploy .vercel/output/static --project-name=kanban-nextjs

# Or deploy via Cloudflare dashboard (your existing method)
# The D1 binding will automatically be available
```

---

## Step 8: Verify D1 Works

After deployment:

1. **Visit your deployed URL:**
   ```
   https://kanban-nextjs-xxx.pages.dev/
   ```

2. **Check home page loads** ✅

3. **Check board page:**
   ```
   https://kanban-nextjs-xxx.pages.dev/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c
   ```

4. **Should see:**
   - Board title and description
   - Lists (To Do, In Progress, Done)
   - Sample cards if you seeded data
   - No database errors! ✅

---

## Troubleshooting

### "D1 binding not found" error

**Cause:** D1 binding not configured in Cloudflare Pages

**Fix:**
1. Check Cloudflare Pages → Settings → Functions → D1 database bindings
2. Ensure `DB` binding points to `kanban-db`
3. Redeploy

### "Database not available" during local dev

**Expected behavior:**
- `npm run dev` - Uses local SQLite (better-sqlite3)
- `wrangler pages dev` - Uses D1

Make sure you're using the right command for what you want to test.

### Migration fails with "table already exists"

**Cause:** Tables already created

**Fix:**
```bash
# Drop all tables (careful!)
wrangler d1 execute kanban-db --command="DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS boards; DROP TABLE IF EXISTS lists; DROP TABLE IF EXISTS cards; DROP TABLE IF EXISTS tags; DROP TABLE IF EXISTS card_tags; DROP TABLE IF EXISTS comments;"

# Re-run migration
wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_redundant_onslaught.sql
```

### Want to query D1 directly?

```bash
# Open D1 SQL console
wrangler d1 execute kanban-db --command="SELECT * FROM boards;"

# Or interactive shell
wrangler d1 execute kanban-db --command=".tables"
```

---

## How It Works

### Local Development (npm run dev)
```
Next.js → db.ts detects local environment → Uses better-sqlite3 → ./drizzle/db.sqlite
```

### Cloudflare Pages (Production)
```
User Request → Cloudflare Pages Function → env.DB binding → D1 Database
               ↓
            db.ts detects CF_PAGES → Uses drizzle/d1 → Remote D1
```

### The Magic

Your `db.ts` automatically switches:
- **Local:** Uses `better-sqlite3` (file-based)
- **Cloudflare:** Uses D1 (network-based)
- **Same Drizzle API:** No code changes needed!

---

## Database Management Commands

```bash
# List all D1 databases
wrangler d1 list

# Get database info
wrangler d1 info kanban-db

# Execute SQL query
wrangler d1 execute kanban-db --command="SELECT COUNT(*) FROM boards;"

# Execute SQL file
wrangler d1 execute kanban-db --file=./migration.sql

# Test locally with local D1
wrangler d1 execute kanban-db --local --command="SELECT * FROM boards;"

# Backup database (export data)
wrangler d1 export kanban-db --output=backup.sql

# Import backup
wrangler d1 execute kanban-db --file=backup.sql
```

---

## Costs

**D1 Free Tier (per day):**
- ✅ 100,000 reads
- ✅ 1,000 writes
- ✅ 5 GB storage
- ✅ Unlimited databases

**For this Kanban app:**
- Typical usage: ~100 reads/day, ~20 writes/day
- Well within free tier!

**Paid tier** (if needed):
- $0.50 per million reads
- $1.00 per million writes
- $0.75 per GB stored

---

## Next Steps

✅ D1 database created
✅ Schema applied
✅ Sample data seeded (optional)
✅ D1 bound to Cloudflare Pages
✅ Code already supports D1!

**Now you can:**
1. Deploy to Cloudflare Pages
2. Run full Lighthouse measurements (including Web Vitals)
3. Test all database features work on production
4. Compare performance with other frameworks

---

## Quick Reference

```bash
# Create database
wrangler d1 create kanban-db

# Apply schema
wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_redundant_onslaught.sql

# Query database
wrangler d1 execute kanban-db --command="SELECT * FROM boards;"

# Test locally
wrangler pages dev .next --d1=DB=kanban-db

# Deploy
npm run build
# Then deploy via Cloudflare Pages dashboard
```

---

**Questions?** Check:
- Cloudflare D1 docs: https://developers.cloudflare.com/d1/
- Drizzle D1 guide: https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1
