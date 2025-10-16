# Kanban Board - HTMX Implementation

A full-featured Kanban board application built with Astro and HTMX, featuring drag-and-drop, real-time updates, and SQLite persistence.

## Tech Stack

- **Framework**: Astro with SSR (Node adapter)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @formkit/drag-and-drop
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

Visit [http://localhost:4321](http://localhost:4321)

> **Note**: Migration files are included in the repo, so you don't need to generate them.

### Subsequent Runs

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build (custom Node server)
- `npm run preview:astro` - Preview with Astro's built-in server
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

- **Boards Management**: Create and view boards
- **Drag & Drop**: Move cards between lists using FormKit drag-and-drop
- **Card Management**: Create, edit, and organize cards
- **Comments**: Add comments to cards
- **Tags**: Assign colored tags to cards
- **User Assignment**: Assign cards to team members
- **Analytics**: CSS-only charts for board statistics
- **HTML Dialog**: Native dialog elements with DaisyUI styling
- **Locality of Behavior**: Inline event handlers for clarity

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production
- `npm run seed` - Seed database
