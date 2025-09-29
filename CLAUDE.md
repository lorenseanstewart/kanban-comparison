# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm run start
```

### Database Operations
```bash
# Generate Drizzle schema migrations
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit push

# Seed database with initial data
npm run seed
```

### Database Reset (Clean Slate)
```bash
rm -f drizzle/db.sqlite
npx drizzle-kit push
npm run seed
```

## Architecture Overview

This is a Trello-inspired Kanban board application built with SolidStart. The app features:

- **Framework**: SolidStart with file-based routing
- **Database**: SQLite with Drizzle ORM (database file at `./drizzle/db.sqlite`)
- **Styling**: Tailwind CSS with DaisyUI theme (pastel theme)
- **State Management**: SolidJS signals and stores for reactive state

### Project Structure

- `/src/routes/` - Page components with file-based routing
  - `index.tsx` - Boards dashboard (home page)
  - `board/[id].tsx` - Individual board view with lists and cards
- `/src/api/` - Server-side API logic
  - `db.ts` - Database connection setup
  - `boards.ts` - Board-related API endpoints
- `/drizzle/` - Database files
  - `schema.ts` - Drizzle ORM schema definitions
  - `db.sqlite` - SQLite database file
  - `migrations/` - Generated migration files

### Database Schema

The application uses a relational structure with these main entities:

1. **Users** - Static users (Loren, Alex, Dolly, Bobby, Sofia) for assignment/authorship
2. **Boards** - Top-level containers with title and description
3. **Lists** - Fixed columns per board (Todo, In-Progress, QA, Done)
4. **Cards** - Draggable tasks with assignee, tags, position, and completion status
5. **Tags** - Global labels with color coding
6. **CardTags** - Many-to-many junction between cards and tags
7. **Comments** - Text notes on cards with authorship

All entities use text UUIDs as primary keys. Foreign key cascades ensure referential integrity.

### Key Technical Details

- Lists are constrained to four fixed types: Todo, In-Progress, QA, Done
- Cards and lists use integer `position` fields for ordering
- Timestamps are stored as integers in Unix timestamp format
- Database indexes on foreign keys and position fields for performance
- No authentication system - users are static entities

### Development Notes

- The app uses optimistic updates for UI responsiveness
- Real-time collaboration features are planned via WebSocket
- Bundle size target is 35-70KB gzipped for production
- Server actions handle mutations with form submissions
- Drag-and-drop uses HTML5 native APIs (no external libraries)