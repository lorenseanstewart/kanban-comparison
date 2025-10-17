# Kanban Board - Nuxt Implementation

A full-featured Kanban board application built with Nuxt 3, featuring drag-and-drop, real-time updates, and SQLite persistence.

## Tech Stack

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: vuedraggable
- **Animations**: @formkit/auto-animate
- **Charts**: charts.css
- **Validation**: Valibot

## Quick Start

### First Time Setup

```bash
npm install
npm run setup  # Applies migrations and seeds the database
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

> **Note**: Migration files are included in the repo, so you don't need to generate them.

### Subsequent Runs

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run setup` - Initialize database (reset + migrate + seed)
- `npm run db:reset` - Delete database files
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:migrate` - Apply pending migrations
- `npm run db:push` - Push schema changes directly (dev only)
- `npm run seed` - Seed database with sample data

## Database Setup

The app uses SQLite with Drizzle ORM. The database file is located at `drizzle/db.sqlite`.

### Reset Database

```bash
npm run setup  # This automatically resets, migrates, and seeds
```

### Schema Changes

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`

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
