# Kanban Board - Nuxt Implementation

A full-featured Kanban board application built with Nuxt 3, featuring drag-and-drop, real-time updates, and Neon Postgres persistence.

## Tech Stack

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **Database**: Neon Postgres (serverless PostgreSQL) with Drizzle ORM
- **Deployment**: Vercel (serverless functions)
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @formkit/drag-and-drop
- **Animations**: @formkit/auto-animate
- **Charts**: charts.css
- **Validation**: Valibot

## Local Development

### First Time Setup

```bash
# Install dependencies
npm install

# Set up environment variables
echo "POSTGRES_URL=your-neon-connection-string" > .env

# Set up database (run migrations and seed)
npm run db:push
npm run seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

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

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build

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
server/
├── api/               # API endpoints
├── db/                # Database seeds
└── utils/             # Server utilities
drizzle/
├── schema.ts          # Database schema
└── migrations/        # Migration files
components/            # Vue components
pages/                 # File-based routing
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
- ✅ Vue 3 Composition API with `<script setup>`
- ✅ Auto-imports for composables and components
- ✅ Typed API routes with Nuxt server handlers
- ✅ Error handling with loading states
- ✅ Server ID reconciliation for optimistic updates

## Learn More

- [Nuxt 3 Documentation](https://nuxt.com/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## License

MIT
