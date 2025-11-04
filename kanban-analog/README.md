# kanban-analog

This project was generated with [Analog](https://analogjs.org), the fullstack meta-framework for Angular.

Deployed on Cloudflare Pages with D1 database.

## Important Note

**Local D1 Development Limitation**: Analog (Nitro) + Cloudflare D1 local development is not currently well-supported. Wrangler does not properly expose D1 bindings to Nitro's built worker in development mode.

**Recommended Workflow**:
- Deploy directly to Cloudflare Pages for testing with D1
- Or use Cloudflare's preview deployments
- Local development would require a different database setup (e.g., better-sqlite3)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build for production:
```bash
npm run build
```

## Production Deployment

Deploy to Cloudflare Pages:
```bash
npm run pages:deploy
```

After deployment, you need to:

1. **Bind the D1 database** in Cloudflare Pages dashboard:
   - Go to Settings → Functions → D1 database bindings
   - Variable name: `DB`
   - D1 database: Select `kanban-db`

2. **Run migrations and seed** on production:
```bash
curl -X POST https://your-app.pages.dev/api/migrate
curl -X POST https://your-app.pages.dev/api/seed
```

## Database

This app uses Cloudflare D1 (SQLite on the edge) via Drizzle ORM.

**Schema generation:**
```bash
npm run db:generate
```

This generates Drizzle migrations from schema changes in `drizzle/schema.ts`.

## Build

Build the project for Cloudflare Pages:
```bash
npm run build
```

Build artifacts are located in `dist/analog/public/`.

## Community

- Visit and Star the [GitHub Repo](https://github.com/analogjs/analog)
- Join the [Discord](https://chat.analogjs.org)
- Follow us on [Twitter](https://twitter.com/analogjs)
- Become a [Sponsor](https://github.com/sponsors/brandonroberts)
