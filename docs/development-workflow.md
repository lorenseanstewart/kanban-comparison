# Development Workflow

This document covers setup, development commands, and deployment.

## Prerequisites

- Node.js 20+ (specified in `package.json`)
- npm (comes with Node.js)

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd trello-solid
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Database

```bash
# Create database file and apply schema
npx drizzle-kit push

# Seed with sample data
npm run seed
```

**Database location:** `./drizzle/db.sqlite`

### 4. Start Development Server

```bash
npm run dev
```

**Access at:** http://localhost:3000

---

## Development Commands

### Running the App

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

### Database Operations

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit push

# Seed database with sample data
npm run seed

# Reset database (clean slate)
rm -f drizzle/db.sqlite
npx drizzle-kit push
npm run seed
```

### Formatting

```bash
# Format code with Prettier
npx prettier --write .
```

---

## Project Structure

```
trello-solid/
├── src/
│   ├── routes/           # Page components
│   ├── components/       # Reusable UI components
│   ├── api/              # Server-side logic
│   ├── lib/              # Utilities and helpers
│   └── db/               # Database seed script
├── drizzle/
│   ├── schema.ts         # Database schema
│   └── db.sqlite         # SQLite database file (gitignored)
├── docs/                 # Documentation
├── app.config.ts         # SolidStart configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

---

## Git Workflow

### Ignored Files

```
dist/              # Build output
.output/           # SolidStart output
.vinxi/            # Vinxi cache
node_modules/      # Dependencies
drizzle/db.sqlite  # Database file
*.sqlite*          # Database files
.env               # Environment variables
```

### Branching Strategy

```bash
# Feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "Add feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

---

## Database Migrations

### Adding New Table

1. **Edit schema:**
```tsx
// drizzle/schema.ts
export const newTable = sqliteTable('new_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});
```

2. **Generate migration:**
```bash
npx drizzle-kit generate
```

3. **Apply migration:**
```bash
npx drizzle-kit push
```

### Modifying Existing Table

**SQLite limitations:** No ALTER TABLE support for most operations.

**Workaround:**
1. Create new table with desired schema
2. Copy data from old table
3. Drop old table
4. Rename new table

**Easier:** Reset database during development:
```bash
rm -f drizzle/db.sqlite
npx drizzle-kit push
npm run seed
```

---

## Environment Variables

### Local Development

Create `.env` file (gitignored):
```
DATABASE_URL=./drizzle/db.sqlite
NODE_ENV=development
```

### Production

Set environment variables in hosting platform:
```
DATABASE_URL=/data/db.sqlite
NODE_ENV=production
```

---

## Building for Production

### 1. Build

```bash
npm run build
```

**Output:** `.output/` directory with:
- Server bundle
- Client assets
- Public files

### 2. Test Locally

```bash
npm run start
```

### 3. Deploy

Deploy `.output/` directory to:
- Node.js server
- Serverless platform (Vercel, Netlify)
- Docker container

---

## Deployment Options

### Node.js Server

```bash
# On server
git pull
npm install
npm run build
npm run start
```

**Persistent database:**
- Mount volume for `drizzle/db.sqlite`
- Or configure external database (Turso, LiteFS)

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

**Build and run:**
```bash
docker build -t trello-solid .
docker run -p 3000:3000 -v $(pwd)/data:/app/drizzle trello-solid
```

### Serverless (Vercel/Netlify)

```bash
# Connect GitHub repo to platform
# Configure build settings:
Build command: npm run build
Output directory: .output/public
```

**Note:** SQLite may not persist on serverless platforms. Consider:
- Turso (hosted SQLite)
- PostgreSQL (Neon, Supabase)
- D1 (Cloudflare's SQLite)

---

## Troubleshooting

### Database Locked

**Error:** `database is locked`

**Solution:**
```bash
# Close all connections
# Restart dev server
# Or increase busy timeout (already set to 5000ms)
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Build Errors

**Error:** `Module not found` or type errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server (in VSCode)
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## Performance Monitoring

### Development

```bash
# Analyze bundle size
npm run build
# Check .output/ directory size
```

### Production

**Recommended tools:**
- Google Lighthouse
- WebPageTest
- Sentry (error tracking)
- PostHog (analytics)

---

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests (if implemented)
5. Submit pull request

**Code style:** Use Prettier for formatting (runs on commit hook if configured).

---

## Resources

- [SolidStart Docs](https://start.solidjs.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [DaisyUI Components](https://daisyui.com/)
