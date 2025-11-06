# Kanban Board - HTMX Implementation

A full-featured Kanban board application built with Astro and HTMX, featuring drag-and-drop, real-time updates, and Postgres persistence.

## Tech Stack

- **Framework**: Astro with SSR
- **Database**: Neon Postgres with Drizzle ORM
- **Deployment**: Vercel
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @formkit/drag-and-drop
- **Animations**: @formkit/auto-animate
- **Charts**: charts.css
- **Validation**: Valibot

## Local Development

### First Time Setup

```bash
npm install

# Set up environment variables
echo "POSTGRES_URL=your-neon-connection-string" > .env

# Set up database (run migrations and seed)
npm run db:push
npm run seed

# Start development server
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321)

> **Note**: You'll need a Neon Postgres database connection string. Get one at https://neon.tech

### Subsequent Runs

```bash
npm run dev
```

## Production Deployment

**Production URL**: TBD (will be available after first deployment)

### Deploy to Vercel

1. **Set up Neon Postgres** (if not already done):
   - Create a database at https://console.neon.tech
   - Copy the connection string

2. **Configure environment variables in Vercel**:
   - `POSTGRES_URL` or `DATABASE_URL` = your Neon connection string

3. **Deploy**:

```bash
vercel --prod
```

The database migrations and seed data should already be set up from the first app deployment. All apps in this comparison share the same Neon Postgres database.

### Database Setup Commands

**Push schema to database:**
```bash
npm run db:push
```

**Seed database:**
```bash
npm run seed
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build (custom Node server)

### Database
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:push` - Push schema changes to Postgres
- `npm run seed` - Seed database with sample data

## Database Setup

The app uses Neon Postgres for both development and production.

### Schema Changes

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Push to database: `npm run db:push`

## Project Structure

```
src/
├── pages/
│   ├── api/           # API endpoints
│   ├── board/         # Board pages
│   └── index.astro    # Home page
├── lib/
│   ├── api.ts         # API helper functions
│   └── db.ts          # Database connection
├── db/
│   └── seed.ts        # Database seed script
├── components/        # Astro/HTMX components
drizzle/
├── schema.ts          # Database schema
└── migrations/        # Migration files
    └── 0000_calm_captain_britain.sql
```

## Features

- ✅ Create and manage multiple boards
- ✅ Four fixed lists per board (Todo, In-Progress, QA, Done)
- ✅ Create, edit, and delete cards
- ✅ Drag-and-drop cards within and between lists
- ✅ Assign users to cards
- ✅ Add tags to cards with color coding
- ✅ Add comments to cards
- ✅ Mark cards as complete
- ✅ Responsive design with DaisyUI theme
- ✅ Board overview charts
- ✅ HTMX for dynamic updates
- ✅ Locality of behavior with inline event handlers
- ✅ Native HTML dialogs
- ✅ Error handling with loading states
- ✅ Postgres database with Drizzle ORM

## Learn More

- [Astro Documentation](https://docs.astro.build/)
- [HTMX Documentation](https://htmx.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Postgres](https://neon.tech/)

## License

MIT
