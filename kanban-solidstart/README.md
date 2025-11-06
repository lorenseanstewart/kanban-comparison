# Kanban Board - SolidStart Implementation

A full-featured Kanban board application built with SolidStart, featuring drag-and-drop, real-time updates, and Neon Postgres persistence.

## Tech Stack

- **Framework**: SolidStart with Vinxi
- **Database**: Neon Postgres (serverless PostgreSQL) with Drizzle ORM
- **Deployment**: Vercel (serverless functions)
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @thisbeyond/solid-dnd
- **Animations**: Auto-animate
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

**Production URL**: https://kanban-solidstart-lf9jejx7v-loren-stewarts-projects.vercel.app

### Deploy to Vercel

1. **Set up Neon Postgres** (if not already done):
   - Create a database at https://console.neon.tech
   - Copy the connection string

2. **Configure environment variables in Vercel**:
   - `POSTGRES_URL` or `DATABASE_URL` = your Neon connection string

3. **Build and deploy**:

```bash
npm run build
vercel --prod
```

The database migrations and seed data should already be set up from the first app deployment. All apps in this comparison share the same Neon Postgres database.

### Build Configuration

The app uses a Vite configuration optimized for SolidStart:

```typescript
export default defineConfig({
  server: {
    preset: "vercel",
  },
  vite: {
    ssr: {
      external: ["drizzle-orm"],
      noExternal: ["@thisbeyond/solid-dnd"],
    },
    build: {
      cssMinify: true,
    },
  },
});
```

This configuration:
- Uses Vercel preset for serverless deployment
- Externalizes drizzle-orm for SSR to avoid bundling issues
- Bundles @thisbeyond/solid-dnd to work with SSR
- **cssMinify: true** - Minifies CSS for smaller file size

**Note on CSS Optimization**: SolidStart/Vinxi currently has a known limitation ([Issue #1324](https://github.com/solidjs/solid-start/issues/1324)) where `cssCodeSplit: false` creates the bundled CSS file but doesn't reference it in the HTML output. We use the default CSS code splitting behavior which works correctly but results in multiple CSS requests per route.

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server locally

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
├── api/
│   ├── db.ts               # Database connection
│   ├── boards.ts           # Board data fetching
│   ├── board-actions.ts    # Board mutations
│   ├── card-actions.ts     # Card mutations
│   └── drag-drop-actions.ts # Drag-drop mutations
├── components/
│   ├── modals/             # Modal components
│   ├── charts/             # Chart components
│   └── icons/              # Icon components
├── routes/
│   ├── index.tsx           # Home page (boards list)
│   ├── board/
│   │   └── [id].tsx        # Board detail page
│   └── api/
│       └── comments/       # Comment API routes
└── lib/
    ├── drag-drop/          # Drag-drop logic
    ├── validation/         # Valibot schemas
    └── utils/              # Utility functions
drizzle/
├── schema.ts               # Database schema
└── migrations/             # Migration files
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
- ✅ SolidJS reactive primitives
- ✅ Server-side rendering
- ✅ Form actions for mutations
- ✅ Error handling with loading states
- ✅ Server ID reconciliation for optimistic updates

## Key Implementation Details

### Server Functions

SolidStart uses server functions for database operations:

```typescript
export async function getBoards(): Promise<BoardSummary[]> {
  "use server";
  const db = getDatabase();
  return db.select().from(boards);
}
```

### Actions

Mutations use SolidStart's `action()` for form handling:

```typescript
export const createBoardAction = action(async (formData: FormData) => {
  "use server";
  const db = getDatabase();
  const boardId = crypto.randomUUID();
  await db.insert(boards).values({ id: boardId, ...data });
  return redirect(`/board/${boardId}`);
});
```

### Optimistic UI

Client-side state management with Solid.js provides instant feedback:

```typescript
const [boards, setBoards] = createSignal<BoardSummary[]>([]);

async function addBoard(data: BoardData) {
  const tempId = crypto.randomUUID();
  setBoards([...boards(), { id: tempId, ...data }]);

  const result = await createBoardAction(data);
  setBoards(boards().map(b => b.id === tempId ? result : b));
}
```

## Learn More

- [SolidStart Documentation](https://start.solidjs.com/)
- [Solid.js Documentation](https://www.solidjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## License

MIT
