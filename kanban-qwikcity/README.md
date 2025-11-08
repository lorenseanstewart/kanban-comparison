# Kanban Board - Qwik City Implementation ⚡️

A full-featured Kanban board application built with Qwik City, featuring drag-and-drop, real-time updates, and PostgreSQL database persistence.

## Tech Stack

- **Framework**: Qwik City with Vite
- **Database**: Neon Postgres with Drizzle ORM
- **Hosting**: Vercel Edge Runtime
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: Native HTML5 Drag and Drop API
- **Charts**: charts.css
- **Validation**: Valibot

## Quick Start

### First Time Setup

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env file or create one with your Neon Postgres connection string:
# DATABASE_URL=postgresql://...
# POSTGRES_URL=postgresql://...

# Apply database schema
npm run db:push

# Seed with sample data
curl -X POST http://localhost:3006/api/seed

# Start the dev server
npm run dev
```

The dev server will start on [http://localhost:3006](http://localhost:3006)

### Subsequent Runs

```bash
npm run dev
```

Visit [http://localhost:3006](http://localhost:3006)

## Available Scripts

### Development
- `npm run dev` - Start Vite dev server with SSR
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Vercel
- `npm run fmt` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

### Database
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:push` - Push schema directly to database (for development)
- `npm run seed` - Seed database with sample data via API endpoint

## Database Setup

The app uses **Neon Postgres** with Drizzle ORM.

### Local Development

1. Create a Neon Postgres database at [neon.tech](https://neon.tech)
2. Copy your connection string
3. Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
```

4. Push the schema: `npm run db:push`
5. Seed the database: `curl -X POST http://localhost:3006/api/seed`

### Schema Changes

1. Modify schema in `drizzle/schema.ts`
2. Push changes: `npm run db:push` (for development)
3. Or generate migration: `npm run db:generate` (for production)

## Deployment to Vercel

### Prerequisites

1. Vercel account
2. Neon Postgres database

### Deploy

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
npm run deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables

Add these environment variables in your Vercel project settings:

- `DATABASE_URL` - Your Neon Postgres connection string
- `POSTGRES_URL` - Your Neon Postgres connection string

### Post-Deployment

After deploying, seed the production database:

```bash
curl -X POST https://your-app.vercel.app/api/seed
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
- ✅ Real-time optimistic UI updates
- ✅ Responsive design with DaisyUI theme
- ✅ Board overview charts

## Learn More

- [Qwik Documentation](https://qwik.dev/)
- [Qwik City Routing](https://qwik.dev/qwikcity/routing/overview/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Postgres Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)

## License

MIT
