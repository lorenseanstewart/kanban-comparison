# Kanban Vanilla (Astro + HTMX + TypeScript)

A vanilla JavaScript Kanban board application built with Astro, HTMX, and TypeScript, featuring drag-and-drop functionality with FormKit libraries.

## Tech Stack

- **Framework**: Astro (SSR)
- **Styling**: Tailwind CSS + DaisyUI (pastel theme)
- **Charts**: Charts.css (CSS-only charts)
- **Database**: SQLite + Drizzle ORM
- **Drag & Drop**: @formkit/drag-and-drop
- **Animations**: @formkit/auto-animate
- **Validation**: Valibot
- **Language**: TypeScript

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npx drizzle-kit push
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```

Visit http://localhost:4321

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
