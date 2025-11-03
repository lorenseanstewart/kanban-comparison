# Cloudflare D1 Quick Start - TL;DR

**Goal:** Get Next.js working with Cloudflare D1 so you can deploy and run Lighthouse measurements.

**Time:** 10-15 minutes
**Prerequisites:** Wrangler CLI (`npm install -g wrangler && wrangler login`)

---

## Step 1: Create D1 Database (2 min)

```bash
cd kanban-nextjs
wrangler d1 create kanban-db
```

**Copy the `database_id` from the output!**

---

## Step 2: Update wrangler.toml (1 min)

Edit `wrangler.toml` and replace `YOUR_D1_DATABASE_ID`:

```toml
database_id = "paste-your-id-here"
```

---

## Step 3: Apply Schema (1 min)

```bash
wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_redundant_onslaught.sql
```

Should see: `🚣 Executed 7 commands`

---

## Step 4: Bind D1 in Cloudflare Pages (2 min)

1. Go to Cloudflare Pages project → Settings → Functions
2. Scroll to "D1 database bindings"
3. Add binding:
   - Variable name: `DB`
   - D1 database: `kanban-db`
4. Save

---

## Step 5: Deploy (5 min)

```bash
npm run build
# Then deploy via Cloudflare Pages dashboard
# Or: wrangler pages deploy .vercel/output/static --project-name=kanban-nextjs
```

---

## Step 6: Seed Database (2 min)

After deployment, seed the database:

**Option A: Via wrangler (recommended)**
```bash
cd kanban-nextjs
npm run seed  # This uses the existing seed script
```

**Option B: Via API (after deployment)**
```bash
curl -X POST https://your-app.pages.dev/api/seed \
  -H "Authorization: Bearer your-secret"
```

(Set `SEED_SECRET` in Cloudflare Pages environment variables first)

---

## Step 7: Test (1 min)

Visit your deployed app:
- Home: `https://your-app.pages.dev/`
- Board: `https://your-app.pages.dev/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c`

Should see full working Kanban board! ✅

---

## Step 8: Run Lighthouse Measurements

Now you can measure the fully-functional app:

```bash
# Add to .env
NEXTJS_URL=https://your-app.pages.dev

# Run measurements
npm run measure:single "Next.js"
```

You'll get proper Web Vitals scores including database interactions! 🎉

---

## Common Issues

### "D1 binding not found"
- Check Cloudflare Pages → Settings → Functions → D1 bindings
- Ensure `DB` is bound to `kanban-db`
- Redeploy

### "Table doesn't exist"
- Run migration: `wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_redundant_onslaught.sql`

### Board page shows "no data"
- Seed database (Step 6)

---

##  Quick Commands

```bash
# Create D1
wrangler d1 create kanban-db

# Apply schema
wrangler d1 execute kanban-db --file=./drizzle/migrations/0000_redundant_onslaught.sql

# Seed (locally - won't work after deploy, use API route)
npm run seed

# Query D1
wrangler d1 execute kanban-db --command="SELECT * FROM boards;"

# Build and deploy
npm run build
# Deploy via dashboard or wrangler
```

---

**Full guide:** See `D1_SETUP_GUIDE.md` for detailed explanations

**Ready to deploy?** Follow steps 1-8 above and you'll have a working D1 database in 15 minutes!
