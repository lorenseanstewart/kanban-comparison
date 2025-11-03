# Next.js + Cloudflare D1 - Setup Complete! ✅

Your Next.js Kanban app is now configured to work with **Cloudflare D1** database, enabling full functionality on Cloudflare Pages for proper Lighthouse measurements.

---

## What Was Done

### ✅ Database Layer (Hybrid Local + D1)

**File:** `src/lib/db.ts`

- **Local development:** Uses `better-sqlite3` (file-based SQLite)
- **Cloudflare Pages:** Automatically uses D1 (serverless SQLite)
- **Build time:** Skips database (prevents build errors)
- **Same Drizzle API:** No code changes needed!

**How it works:**
```typescript
// Automatically detects environment
const db = getDatabase(env.DB); // D1 on Cloudflare
const db = getDatabase();       // better-sqlite3 locally
```

### ✅ Cloudflare Configuration

**File:** `wrangler.toml`

- D1 database binding configured
- Ready for Cloudflare Pages deployment
- You just need to add your database ID (see guide)

### ✅ Database Schema

**File:** `drizzle/migrations/0000_redundant_onslaught.sql`

- Already D1-compatible!
- Creates all tables: users, boards, lists, cards, tags, comments
- Ready to apply to D1

### ✅ Seeding Options

**Option 1: Local seed script**
```bash
npm run seed  # Uses src/db/seed.ts
```

**Option 2: API route (after deployment)**
```bash
POST /api/seed  # Seeds D1 database remotely
```

**File:** `src/app/api/seed/route.ts`
- Secure (requires secret in production)
- Can be called after deployment
- Uses your existing seed data

### ✅ Documentation

1. **`D1_QUICKSTART.md`** - 10-minute quick start guide
2. **`D1_SETUP_GUIDE.md`** - Comprehensive step-by-step guide
3. **`README_D1.md`** - This file (overview)

---

## Quick Start (TL;DR)

```bash
# 1. Create D1 database
wrangler d1 create kanban-db

# 2. Copy database_id to wrangler.toml

# 3. Apply schema
wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_redundant_onslaught.sql

# 4. Bind D1 in Cloudflare Pages (Settings → Functions → D1 bindings)

# 5. Deploy
npm run build
# Deploy via Cloudflare Pages dashboard

# 6. Test
open https://your-app.pages.dev/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c

# 7. Run Lighthouse measurements!
NEXTJS_URL=https://your-app.pages.dev npm run measure:single "Next.js"
```

---

## What Works Now

### ✅ Local Development
```bash
npm run dev
```
- Uses local SQLite (`./drizzle/db.sqlite`)
- Existing seed script works
- Fast development experience

### ✅ Cloudflare Pages (After D1 Setup)
```bash
npm run build
# Deploy to Cloudflare Pages
```
- Uses D1 database
- Full app functionality
- Database routes work
- Can run complete Lighthouse tests

### ✅ Both Environments
- Same codebase
- Same Drizzle schema
- Same API
- Automatically switches based on environment

---

## Files Modified

1. ✅ `src/lib/db.ts` - Hybrid database connection
2. ✅ `wrangler.toml` - D1 configuration (NEW)
3. ✅ `src/app/api/seed/route.ts` - API seed route (NEW)
4. ✅ `D1_QUICKSTART.md` - Quick start guide (NEW)
5. ✅ `D1_SETUP_GUIDE.md` - Detailed guide (NEW)
6. ✅ `README_D1.md` - This file (NEW)

**All other files unchanged** - your app code doesn't need to change!

---

## Next Steps

### Immediate (To Deploy)

1. **Read `D1_QUICKSTART.md`** - Follow the 10-minute guide
2. **Create D1 database** - `wrangler d1 create kanban-db`
3. **Apply schema** - Run migration to D1
4. **Bind in Cloudflare Pages** - Connect D1 to your deployment
5. **Deploy** - Build and deploy as normal
6. **Seed** - Populate database with sample data

### For Measurements

After deployment with D1:

```bash
# Add CDN URL to .env
NEXTJS_URL=https://kanban-nextjs-xxx.pages.dev

# Run full Lighthouse measurements
npm run measure:single "Next.js"

# Get Web Vitals with working database!
# - LCP includes real data loading
# - TBT includes database queries
# - Full user experience measured
```

---

## How Seeding Works

### Local Development
```bash
npm run seed
```
Uses: `src/db/seed.ts` → Local SQLite file

### After Cloudflare Deployment

**Option 1: Wrangler (Recommended)**
```bash
# Can't use npm run seed (no local DB)
# Instead, use wrangler to execute SQL directly

# Generate seed SQL from TypeScript first
# (or create manual SQL seed file)
```

**Option 2: API Route**
```bash
# Set SEED_SECRET in Cloudflare environment variables
# Then call API endpoint
curl -X POST https://your-app.pages.dev/api/seed \
  -H "Authorization: Bearer your-secret-here"
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Local Development (npm run dev)                         │
├─────────────────────────────────────────────────────────┤
│ Next.js → db.ts → Detects local env                     │
│                 ↓                                        │
│         better-sqlite3 → ./drizzle/db.sqlite            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Cloudflare Pages (Production)                           │
├─────────────────────────────────────────────────────────┤
│ Request → Next.js → db.ts → Detects CF_PAGES            │
│                           ↓                              │
│                  getDatabase(env.DB)                     │
│                           ↓                              │
│                   Drizzle + D1                           │
│                           ↓                              │
│               Cloudflare D1 Database                     │
│               (Global SQLite)                            │
└─────────────────────────────────────────────────────────┘
```

---

## Benefits

✅ **Works Locally** - Fast dev with local SQLite
✅ **Works on Cloudflare** - Full functionality in production
✅ **Same Code** - No environment-specific changes
✅ **Full Lighthouse** - Measure real app with database
✅ **Web Vitals** - Accurate scores including data loading
✅ **Edge Database** - D1 runs on Cloudflare's global network
✅ **Free Tier** - 100K reads/day, well within limits

---

## Costs

**Cloudflare D1 Free Tier:**
- 100,000 reads per day
- 1,000 writes per day
- 5 GB storage

**Your Kanban app usage:**
- ~20-50 reads per page load
- ~5-10 writes per user action
- ~1 MB database size

**Estimated cost: $0/month** ✅

---

## Troubleshooting

### Build fails with "better-sqlite3" error
✅ **Fixed!** The new `db.ts` skips database during build

### "D1 binding not found" in production
Check:
1. D1 database created (`wrangler d1 list`)
2. Bound in Cloudflare Pages (Settings → Functions)
3. Redeployed after binding

### Local dev uses D1 instead of SQLite
Check: `process.env.CF_PAGES` should be undefined locally

### Seed doesn't work after deployment
Use the API route: `POST /api/seed` with authorization header

---

## Documentation Quick Links

- **10-minute setup:** `D1_QUICKSTART.md`
- **Detailed guide:** `D1_SETUP_GUIDE.md`
- **Cloudflare D1 docs:** https://developers.cloudflare.com/d1/
- **Drizzle D1 docs:** https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1

---

## Support

Questions? Check:
1. `D1_SETUP_GUIDE.md` - Troubleshooting section
2. Cloudflare D1 docs
3. Your deployment logs in Cloudflare dashboard

---

**Ready to deploy?** → Start with `D1_QUICKSTART.md`

**Want details first?** → Read `D1_SETUP_GUIDE.md`

**Just want to measure?** → Deploy first, then run Lighthouse! 🚀
