# Kanban Board - Next.js Implementation (with React Compiler)

A full-featured Kanban board application built with Next.js, featuring drag-and-drop, real-time updates, and SQLite persistence.

Experimental variant with **React 19's compiler** enabled for automatic optimization.

## Tech Stack

- **Framework**: Next.js 16 (beta) with React 19 + React Compiler
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @dnd-kit
- **Charts**: charts.css

## What's Different About This Variant?

- Enables `experimental.reactCompiler: true` in `next.config.ts`
- Auto-memoizes renders, computations, and callbacks without manual `useMemo`/`useCallback`
- Same code as standard Next.js app - compiler optimizes automatically
- ~3% smaller bundle size

**Note**: React Compiler is still experimental - not recommended for production.

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

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run ESLint
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

- [Next.js Documentation](https://nextjs.org/docs)
- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [React Compiler + Next.js](https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## License

MIT
