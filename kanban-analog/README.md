# kanban-analog

This project was generated with [Analog](https://analogjs.org), the fullstack meta-framework for Angular.

Deployed on Cloudflare Pages with D1 database.

## Local Development

The app uses a dual-database setup:
- **Development**: Better-SQLite3 with `local.db`
- **Production**: Cloudflare D1

### Setup

1. Install dependencies:

```bash
npm install
```

2. Set up local database (creates and seeds `local.db`):

```bash
npm run setup
```

3. Start dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Production Deployment

### First-time Setup

1. **Create and migrate D1 database** (one time only):

```bash
npm run db:migrate
```

2. **Seed production database** (optional):

```bash
npm run seed
```

3. **Deploy to Cloudflare Pages**:

```bash
npm run pages:deploy
```

The D1 database binding is configured in `wrangler.toml` and should automatically work once deployed.

**Production URL**: https://kanban-analog.pages.dev

### Subsequent Deployments

Just build and deploy:

```bash
npm run pages:deploy
```

## Database

This app uses Cloudflare D1 (SQLite on the edge) via Drizzle ORM.

### Available Scripts

- `npm run setup` - Set up local database (migrate + seed)
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate:local` - Apply migrations to local D1 database
- `npm run db:migrate` - Apply migrations to production D1 database
- `npm run seed:local` - Seed local database with sample data
- `npm run seed` - Seed production database with sample data

### Schema Changes

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply locally: `npm run db:migrate:local`
4. Apply to production: `npm run db:migrate`

## Build

Build the project for Cloudflare Pages:

```bash
npm run build
```

Build artifacts are located in `dist/analog/public/`.

## Logs

View production logs:

```bash
npx wrangler pages deployment tail --project-name=kanban-analog --format=pretty
```

## Community

- Visit and Star the [GitHub Repo](https://github.com/analogjs/analog)
- Join the [Discord](https://chat.analogjs.org)
- Follow us on [Twitter](https://twitter.com/analogjs)
- Become a [Sponsor](https://github.com/sponsors/brandonroberts)
