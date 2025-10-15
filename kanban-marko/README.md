# Kanban Board - Marko Implementation

A full-featured Kanban board application built with Marko, featuring drag-and-drop, real-time updates, and SQLite persistence.

## Tech Stack

- **Framework**: Marko 6 with [@marko/run](https://github.com/marko-js/run)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @formkit/drag-and-drop
- **Animations**: @formkit/auto-animate
- **Charts**: charts.css

## Quick Start

### First Time Setup

```bash
npm install
npm run setup  # Runs migrations and seeds the database
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Subsequent Runs

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run start` - Run production server
- `npm run setup` - Initialize database (migrate + seed)
- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:migrate` - Apply pending migrations
- `npm run db:push` - Push schema changes directly (dev only)
- `npm run seed` - Seed database with sample data

## Database Setup

The app uses SQLite with Drizzle ORM. The database file is located at `drizzle/db.sqlite`.

### Reset Database

```bash
rm -f drizzle/db.sqlite drizzle/db.sqlite-shm drizzle/db.sqlite-wal
npm run setup
```

### Schema Changes

1. Modify schema in `drizzle/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`

## Project Structure

```
src/
├── routes/              # File-based routing
│   ├── +layout.marko   # Root layout
│   ├── index/          # Homepage (board list)
│   └── board/          # Board detail pages
├── components/         # Reusable components
├── lib/               # Utilities and helpers
│   ├── db.ts          # Database connection
│   └── server/        # Server-side utilities
└── db/                # Database seeds
drizzle/
├── schema.ts          # Database schema
└── migrations/        # Migration files
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

- [Marko Documentation](https://markojs.com/)
- [@marko/run Documentation](https://github.com/marko-js/run)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## License

MIT
