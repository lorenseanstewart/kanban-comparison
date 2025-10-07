# Project Overview: Framework Comparison Repository

## What This Repo Is

A real-world comparison of modern JavaScript frameworks by implementing **the exact same Kanban board application** across **all major alternative approaches**.

### Current Status:
1. ✅ **Next.js 15** (standard configuration) - Complete
2. ✅ **Next.js 15 with React Compiler** (experimental) - Complete
3. ✅ **SolidStart 1.0** - Complete
4. 🚧 **SvelteKit** (with Svelte 5 Runes) - In Progress
5. 🚧 **Qwik City** - Planned

## Purpose

This is a **follow-up proof of concept** to the blog post ["React Won by Default – And It's Killing Frontend Innovation"](link-to-post). That post argued that React's dominance stifles innovation and that alternative frameworks (Svelte, Solid, Qwik) offer real technical advantages but are ignored due to network effects.

**This repo proves it with data.**

By building the same non-trivial application in multiple frameworks, we can compare:
- Bundle sizes (real overhead, not marketing claims)
- Developer experience (actual code complexity)
- Performance (real-world metrics on cellular connections)
- Learning curve (time to implement identical features)

**Not toy examples. Not benchmarks. Real application, identical features, honest comparison.**

## Why This Comparison Exists

**Business Context**: Built for teams serving **mobile professionals** (real estate agents, field workers, healthcare staff) who use web apps on cellular connections. No native app team = web performance is critical.

**The Thesis**: "React-by-default" has hidden costs. When you serve mobile users on cellular networks, framework overhead directly impacts user experience.

**Key Finding So Far**: SolidStart delivers **3x smaller bundles** than Next.js (40 kB vs 148 kB). On cellular connections, that's 1.5-2 seconds difference—meaningful when users are between showings, at job sites, or in the field.

**The Pattern We're Testing**: All compile-time and fine-grained reactive frameworks (Solid, Svelte, Qwik) should show similar advantages over Virtual DOM frameworks.

## Repository Structure

```
kanban-comparison/
├── kanban-nextjs/              # Next.js 15 (standard) ✅
├── kanban-nextjs-compiler/     # Next.js 15 + React Compiler ✅
├── kanban-solidstart/          # SolidStart 1.0 ✅
├── kanban-svelte/              # SvelteKit + Svelte 5 Runes 🚧
├── kanban-qwik/                # Qwik City (resumability) 🚧
├── README.md                   # Main comparison document
├── BLOG_POST_IDEAS.md         # Blog post outline and angles
├── REQUIREMENTS.md            # Original feature requirements
└── PROJECT_OVERVIEW.md        # This file
```

## Shared Architecture

All implementations share:

- **Same SQLite database** (`kanban-solidstart/drizzle/db.sqlite`)
- **Same schema** (Drizzle ORM definitions)
- **Same features** (100% feature parity)
- **Same UI** (DaisyUI pastel theme)
- **Same user experience** (identical interactions)

## Current Bundle Sizes (Production, Gzipped)

| Framework | Homepage | Board Page | Status |
|-----------|----------|------------|--------|
| **Next.js** | ~122 kB | ~148 kB | ✅ Complete |
| **Next.js + Compiler** | ~123 kB | ~153 kB | ✅ Complete |
| **SolidStart** | ~30 kB | ~40 kB | ✅ Complete |
| **SvelteKit** | TBD | TBD (~35-45 kB est.) | 🚧 In Progress |
| **Qwik City** | TBD | TBD (~25-35 kB est.) | 🚧 Planned |

**Key Takeaway So Far**: SolidStart is **3x smaller** due to fine-grained reactivity (no Virtual DOM overhead).

**Pattern Being Tested**: We expect SvelteKit (compiler-first) and Qwik (resumability) to show similar 2-4x advantages over React.

## Performance Metrics (Board Page, Local)

| Metric | Next.js | Next.js + Compiler | SolidStart | SvelteKit | Qwik |
|--------|---------|-------------------|------------|-----------|------|
| Lighthouse Performance | 98% | 98% | 100% | TBD | TBD |
| First Contentful Paint | 18ms | 17ms | 59ms | TBD | TBD |
| Largest Contentful Paint | 8ms | 9ms | 6ms | TBD | TBD |
| Interaction to Next Paint | 32ms | 24-40ms | 24-40ms | TBD | TBD |

**Key Takeaway**: All are fast in optimal conditions, but smaller bundles win on cellular networks where every KB matters.

## Tech Stack Comparison

| Category | Next.js | SolidStart | SvelteKit | Qwik |
|----------|---------|------------|-----------|------|
| **UI Library** | React 19 | SolidJS 1.9 | Svelte 5 | Qwik |
| **Reactivity Model** | Virtual DOM | Signals (fine-grained) | Runes (compile-time) | Signals + Resumability |
| **Routing** | App Router | File-based | File-based | File-based |
| **Data Fetching** | Server Components | `createAsync` + cache | `load` functions | `routeLoader$` |
| **Mutations** | Server Actions | Server functions | Form actions | Server actions |
| **Database** | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 |
| **Styling** | Tailwind v3 + DaisyUI | Tailwind + DaisyUI | Tailwind + DaisyUI | Tailwind + DaisyUI |
| **Drag & Drop** | @dnd-kit | @thisbeyond/solid-dnd | TBD | TBD |
| **Build Tool** | Turbopack | Vinxi | Vite | Vite + Qwik optimizer |

## Feature List (All Implementations)

- ✅ Board creation and listing
- ✅ Four fixed lists per board (Todo, In-Progress, QA, Done)
- ✅ Card creation, editing, and deletion
- ✅ Drag-and-drop card reordering within lists
- ✅ Drag-and-drop card movement between lists
- ✅ Assignee assignment (static user list)
- ✅ Tag management (add/remove tags from cards)
- ✅ Comments on cards with authorship
- ✅ Completion status toggle
- ✅ Optimistic UI updates
- ✅ Shared SQLite database with identical schema
- ✅ DaisyUI pastel theme styling

## Complexity Assessment

**What this app IS**:
- Real database queries (not hardcoded data)
- Complex interactions (drag-and-drop with position tracking)
- Multiple routes and modals
- Relational data with joins
- Optimistic updates
- ~17 components per framework

**What this app ISN'T**:
- Full production app (no auth, real-time, pagination)
- Toy example (not a todo list)
- Enterprise-scale (thousands of records, complex business logic)

**Positioning**: Represents **typical internal tool or MVP** complexity—the kind of app small/medium teams build constantly.

## Key Learnings

### Bundle Size
- **SolidStart's 3x advantage is real and consistent**
- React Compiler only saved 3%, still 3x larger
- Virtual DOM overhead is measurable and significant
- Differences compound at larger scale

### Complexity
- **Next.js**: More structural overhead (Server/Client split, rules of hooks, dependency arrays)
- **SolidStart**: Steeper learning curve but conceptually simpler (no hook rules, automatic reactivity)

### Developer Experience
- **Next.js**: Mature ecosystem, familiar patterns, larger community
- **SolidStart**: 20-30% less code, faster builds, performance by default

### When to Choose What
- **Next.js**: Large teams, React expertise, desktop-first, need mature ecosystem
- **SolidStart**: Mobile-first, cellular users, small teams, performance-critical

## Adding New Framework Implementations

When adding SvelteKit, Qwik City, or other frameworks, follow these guidelines:

### 1. Feature Parity Requirements
- Implement ALL features from `REQUIREMENTS.md`
- Use the shared SQLite database (no separate DBs)
- Match the DaisyUI pastel theme styling
- Ensure drag-and-drop works identically
- Test optimistic updates work correctly

### 2. File Structure
Create a new directory at root: `kanban-[framework]/`

Example:
```
kanban-svelte/
├── src/
│   ├── routes/              # Pages (home, board detail)
│   ├── lib/                 # API, actions, utilities
│   └── components/          # UI components
├── drizzle/                 # Symlink to kanban-solidstart/drizzle/
├── package.json
├── README.md               # Framework-specific setup/notes
└── [framework config files]
```

### 3. Database Setup
**DO NOT create a new database**. All implementations must share the same SQLite file.

Option 1 (Symlink - Recommended):
```bash
cd kanban-[framework]
ln -s ../kanban-solidstart/drizzle ./drizzle
```

Option 2 (Relative path in code):
```typescript
// Point to the shared database
const dbPath = path.join(__dirname, '../../kanban-solidstart/drizzle/db.sqlite');
```

### 4. Documentation to Update

After implementing a new framework:

#### A. Update Root `README.md`
Add the new framework to:
- Tech Stack Comparison table
- Bundle Size Comparison section
- Performance Metrics table
- Quick Start section

#### B. Create Framework README
In `kanban-[framework]/README.md`, document:
- Setup instructions (`npm install`, `npm run dev`)
- Framework-specific notes (quirks, gotchas, interesting patterns)
- Build commands
- Any deviations from other implementations (with justification)

#### C. Update `BLOG_POST_IDEAS.md`
Add bundle sizes and any interesting findings to the blog post outline.

### 5. Building and Measuring

Before submitting:

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Record bundle sizes** (look for gzipped sizes in build output):
   - Homepage First Load JS
   - Board page First Load JS
   - Shared chunks

3. **Run Lighthouse** on board page:
   - Performance score
   - First Contentful Paint
   - Largest Contentful Paint
   - Interaction to Next Paint

4. **Test on throttled connection**:
   - Chrome DevTools → Network → Slow 3G
   - Record actual load times

### 6. Code Quality Standards

- **TypeScript**: Use strict mode
- **Formatting**: Match existing code style
- **Comments**: Only where necessary (code should be self-documenting)
- **No console logs**: Remove debug statements
- **Error handling**: Handle edge cases gracefully
- **Accessibility**: Maintain keyboard navigation, ARIA labels

### 7. Testing Checklist

Before marking implementation complete:

- [ ] All features from REQUIREMENTS.md work
- [ ] Drag-and-drop works smoothly (no glitches)
- [ ] Optimistic updates work (UI updates before server response)
- [ ] Database queries are efficient (no N+1 problems)
- [ ] Mobile responsive (test on actual device if possible)
- [ ] Lighthouse score > 95%
- [ ] Bundle sizes documented
- [ ] README created with setup instructions

## SvelteKit Implementation Notes (Upcoming)

**Framework characteristics to leverage**:
- Svelte's compiled approach (should rival SolidStart bundle size)
- Runes for reactivity (similar to signals)
- Built-in transitions (could enhance modal UX)
- Form actions (similar to Next.js Server Actions)

**Expected bundle size**: 30-50 kB (similar to SolidStart)

**Key considerations**:
- How does Svelte 5's runes compare to Solid's signals?
- Is SvelteKit's form handling as ergonomic as Next.js Server Actions?
- How does the developer experience compare?

## Qwik City Implementation Notes (Upcoming)

**Framework characteristics to leverage**:
- Resumability (should have fastest initial load)
- Lazy execution (components only load when needed)
- Signals (similar to Solid)
- Built-in optimization (minimal JavaScript by default)

**Expected bundle size**: 20-40 kB (potentially smallest)

**Key considerations**:
- How does resumability affect real-world interactivity?
- Is drag-and-drop performance affected by lazy loading?
- How complex is the mental model compared to other frameworks?
- Does the "download less JavaScript" philosophy hold in practice?

## Blog Post Strategy

A companion blog post is planned using `BLOG_POST_IDEAS.md` as the outline.

**Target audience**: Intermediate to senior developers, tech leads

**Key narrative**: "When mobile web is your only option, bundle size matters"

**Angle**: Teams serving mobile professionals (real estate agents, field workers) need fast web apps on cellular connections. This comparison shows the real-world trade-offs.

## Running the Apps

### Next.js (Standard)
```bash
cd kanban-nextjs
npm install
npm run dev
# Visit http://localhost:3000
```

### Next.js (with React Compiler)
```bash
cd kanban-nextjs-compiler
npm install
npm run dev
# Visit http://localhost:3000
```

### SolidStart
```bash
cd kanban-solidstart
npm install
npm run dev
# Visit http://localhost:3000
```

### Database Reset (if needed)
```bash
cd kanban-solidstart
rm -f drizzle/db.sqlite
npx drizzle-kit push
npm run seed
```

## Contributing

When adding a new framework implementation:

1. Fork the repo
2. Create a new directory: `kanban-[framework]/`
3. Follow the guidelines in "Adding New Framework Implementations"
4. Update all documentation (README, BLOG_POST_IDEAS, etc.)
5. Submit a PR with bundle size comparisons and notes

## Questions to Answer with Each Implementation

1. **Bundle Size**: How does it compare? Why?
2. **Developer Experience**: How much boilerplate? How intuitive?
3. **Performance**: Lighthouse scores, real-world load times?
4. **Complexity**: What's the mental model? Learning curve?
5. **Ecosystem**: How mature? Library availability?
6. **Unique Features**: What does this framework do better than others?
7. **Gotchas**: What surprised you? What was harder than expected?

## License

MIT

---

**Last Updated**: 2025-09-30
**Maintainer**: Loren Stewart
**Status**: Active development (Next.js + SolidStart complete, SvelteKit + Qwik City planned)
