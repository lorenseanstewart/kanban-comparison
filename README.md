# Kanban Board Comparison: Proving "React-by-Default" Has Real Costs

This repository is a **follow-up proof of concept** to the blog post ["React Won by Default – And It's Killing Frontend Innovation"](link-to-post).

That post argued React's dominance stifles innovation. This repo **proves it with data**.

By building the same real-world Kanban app across **7 framework implementations**, we measure the actual costs of "React-by-default":

1. ✅ **Next.js 15** (standard) - Virtual DOM baseline
2. ✅ **Next.js 15 + React Compiler** - Can optimization close the gap?
3. ✅ **Nuxt 4** - Vue 3 reactive refs + SSR-first DX
4. ⚠️ **Analog** - Angular meta-framework with signals (planned)
5. ✅ **SolidStart** - Fine-grained reactivity (signals)
6. ✅ **SvelteKit** - Compiler-first approach (Svelte 5 runes)
7. ✅ **Qwik City** - Resumability (no hydration)

All apps share the same SQLite database, features, and UI. **Identical functionality, measurable differences.**

---

## Tech Stack Comparison

| Category | Next.js | Nuxt | Analog | SolidStart | SvelteKit | Qwik |
|----------|---------|------|--------|------------|-----------|------|
| **Framework** | Next.js 15 (App Router) | Nuxt 4 | Analog (Angular) | SolidStart 1.0 | SvelteKit + Svelte 5 | Qwik City |
| **UI Library** | React 19 | Vue 3 | Angular 19 | SolidJS 1.9 | Svelte 5 | Qwik |
| **Reactivity Model** | Virtual DOM | Reactive refs | Signals + Zone.js | Signals (fine-grained) | Runes (compile-time) | Signals + Resumability |
| **Data Fetching** | Server Components | `useAsyncData` / `useFetch` | `injectLoad` + DI | `createAsync` with cache | `load` functions | `routeLoader$` |
| **Mutations** | Server Actions | API routes (`server/api/*`) | `ApiService` + RxJS | Server functions | Form actions | Server actions |
| **Database** | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 |
| **Styling** | Tailwind CSS v3 + DaisyUI | Tailwind CSS + DaisyUI | Tailwind CSS + DaisyUI | Tailwind CSS + DaisyUI | Tailwind CSS + DaisyUI | Tailwind CSS + DaisyUI |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable | vuedraggable | Angular CDK | @thisbeyond/solid-dnd | Native HTML5 | Native HTML5 |
| **Build Tool** | Turbopack | Vite | Vite + Angular | Vinxi | Vite | Vite + Qwik optimizer |

---

## Bundle Size Comparison

**Production builds (gzipped):**

| Framework | Homepage | Board Page | Status |
|-----------|----------|------------|--------|
| **Next.js** | ~122 kB | ~148 kB | ✅ Complete |
| **Next.js + Compiler** | ~123 kB | ~153 kB | ✅ Complete
| **Nuxt** | ~132kb | ~139kb | ✅ Complete |
| **Analog** | ~117kb | ~159kb | ✅ Complete |
| **SolidStart** | ~30 kB | ~40 kB | ✅ Complete |
| **SvelteKit** | ~24 kB | ~40 kB | ✅ Complete |
| **Qwik City** | ~45kb | ~61kb | ✅ Complete |


**Key Takeaway**: Both SolidStart and SvelteKit are **3-4x smaller** than Next.js. Compile-time optimization (Svelte) and fine-grained reactivity (Solid) both eliminate Virtual DOM overhead.

**Pattern Confirmed**: Rethinking core assumptions (Virtual DOM, hydration) yields **3-4x bundle size improvements**, not incremental gains.

**Why This Matters**: For teams serving mobile professionals (real estate agents, field workers, healthcare staff) on cellular connections, 108 kB = 1.5-2 seconds on 4G. That's the difference between confident and apologetic when a buyer is watching.

### Measurement Methodology (summary)

- Client JS bundle sizes reported are gzipped totals for the route under test
- Measurements run with pinned versions and consistent build flags across apps
- Performance captured with consistent throttling/CPU settings
- Full reproducible recipe and bundle composition steps: see `PERFORMANCE_METRICS_GUIDE.md`

> Fairness constraints (apples-to-apples): pinned framework/tool versions, identical data volume on the Board page, normalized CSS/icon handling (treeshake/purge), consistent throttling and CPU slowdown.

Quick reproduce (5 minutes):

```bash
# build and measure all apps → writes metrics/summary.json and bundle reports
node scripts/measure-all.mjs
```

---

## Performance Metrics of Board Page (run locally)

| Metric | Next.js | Next.js + Compiler | Nuxt | Analog | SolidStart | SvelteKit | Qwik |
|--------|---------|-------------------|------|--------|------------|-----------|------|
| Lighthouse Performance | 98% | 98% | TBD | TBD | 100% | 99% | TBD |
| First Contentful Paint | 18ms | 17ms | TBD | TBD | 59ms | 7ms | TBD |
| Largest Contentful Paint | 8ms | 9ms | TBD | TBD | 6ms | 6ms | TBD |
| Interaction to Next Paint | 24-40ms | 24-40ms | TBD | TBD | 24-40ms | 24-40ms | TBD |

**Key Takeaway**: All are fast in optimal conditions, but smaller bundles win on cellular networks where every KB matters.

---

## Architecture Differences

### Next.js 15
- **Server Components**: Pages are Server Components by default, fetching data at the server level
- **Client Components**: Interactive UI (modals, drag-drop) uses `"use client"` directive
- **Server Actions**: Form submissions and mutations use async server functions
- **Optimistic Updates**: Managed via React hooks (`useState`, `useEffect`)
- **Cache Invalidation**: `revalidatePath()` clears Next.js cache after mutations

### SolidStart
- **Fine-grained Reactivity**: Signals and effects provide granular updates without re-rendering
- **Server Functions**: `"use server"` directive for server-side logic
- **Cache Integration**: `cache()` and `revalidate()` for data freshness
- **Optimistic Updates**: Managed via SolidJS stores and signals
- **Native Drag-and-Drop**: Uses `@thisbeyond/solid-dnd` library

### SvelteKit
- **Runes**: Svelte 5's compile-time reactivity (`$state`, `$derived`, `$effect`)
- **Load Functions**: Server-side data loading per route with automatic caching
- **Form Actions**: Progressive enhancement for form submissions with `enhance`
- **Compiler-First**: Minimal runtime overhead—most framework code compiled away
- **Optimistic Updates**: Managed via `$state` runes with automatic reactivity
- **Drag-and-Drop**: Uses `svelte-dnd-action` library with built-in FLIP animations

### Nuxt 4
- **Vue 3 Reactivity**: Reactive refs (`ref()`, `reactive()`) with automatic dependency tracking
- **Composables**: `useAsyncData` and `useFetch` for SSR-aware data fetching with caching
- **Server Routes**: API routes in `server/api/*` with `defineEventHandler`
- **Auto-imports**: Components, composables, and utilities auto-imported
- **Drag-and-Drop**: Uses `vuedraggable` component wrapper

### Analog (Planned)
- **Angular Signals**: Modern signals API reducing RxJS boilerplate
- **Dependency Injection**: Angular's powerful DI system for services
- **Server Routes**: Vite-powered server routes with Angular integration
- **Drag-and-Drop**: Angular CDK for feature-rich drag-and-drop
- **TypeScript-First**: Strong typing throughout with Angular's compiler

### Qwik City
- **Resumability**: No hydration—resume execution instantly from HTML
- **Progressive Loading**: Load only what's needed for current interaction
- **Fine-grained Lazy Loading**: Component-level code splitting with `$()`
- **Signals**: Fine-grained reactivity without Virtual DOM
- **Serialization**: Everything must be serializable for resumability

---

## Feature Parity Checklist

All implementations include:

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

---

## Quick Start

### Next.js App (Standard)
```bash
cd kanban-nextjs
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

**Build for production:**
```bash
npm run build
npm start
```

### Next.js App (with React Compiler)
```bash
cd kanban-nextjs-compiler
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

### SolidStart App
```bash
cd kanban-solidstart
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

**Build for production:**
```bash
npm run build
npm run start
```

### SvelteKit App
```bash
cd kanban-sveltekit
npm install
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

**Build for production:**
```bash
npm run build
npm run preview
```

### Qwik City App (Coming Soon)
```bash
cd kanban-qwik
npm install
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

### Database Setup

All apps share the same database. To reset:

```bash
cd kanban-solidstart  # or kanban-nextjs
rm -f drizzle/db.sqlite
npx drizzle-kit push
npm run seed
```

---

## Complexity Comparison

**SolidStart is conceptually simpler than Next.js**, despite being less familiar to React developers.

### Next.js Complexity

**Structural and Conceptual Overhead:**
- **Server/Client Split**: Must constantly think about component boundaries and where code can run
- **More Files**: Common pattern of `page.tsx` (Server Component) + `PageClient.tsx` (Client Component) creates file overhead
- **React's Rules of Hooks**:
  - Can't call hooks conditionally or in loops
  - Must maintain hook call order
  - Easy to violate, causes runtime errors
- **Dependency Arrays**:
  - `useEffect`, `useMemo`, `useCallback` require manual dependency tracking
  - Easy to get wrong, causes stale closures and infinite loops
  - Need ESLint plugin to catch mistakes
- **Re-render Optimization**:
  - Must use `useMemo`, `useCallback`, `React.memo` to prevent unnecessary re-renders
  - Performance requires understanding Virtual DOM reconciliation
  - Note: React 19's experimental compiler can auto-optimize, but it's opt-in and not enabled in this app
- **Drag-and-Drop Setup**: `@dnd-kit` requires manual sensor configuration, collision detection, and context providers

**Code Statistics:**
- ~17 total components
- 11 Client Components (`"use client"`)
- 6 Server Components (pages, layouts)
- More boilerplate for state and effects

### SolidStart Complexity

**Simpler Mental Model:**
- **Fine-grained Reactivity**:
  - Signals are just getter/setter pairs: `count()` reads, `setCount(5)` writes
  - More explicit than `useState` (clear distinction between read/write)
  - No dependency arrays—reactivity is automatic
- **No Rules of Hooks**:
  - Call signals anywhere: loops, conditionals, callbacks, event handlers
  - No ordering constraints
  - Less to remember, fewer gotchas
- **Automatic Dependency Tracking**:
  - Use a signal in JSX or an effect, it automatically subscribes
  - **Less** cognitive load—don't think about dependencies
  - Compiler handles the complexity
- **No Re-render Optimization Needed**:
  - Fine-grained updates mean only affected DOM nodes update
  - No `useMemo`, `useCallback`, or `React.memo` needed
  - Performance is the default
- **Cache/Revalidate**:
  - `createAsync` with `cache()` and `revalidate()` is explicit and clear
  - Simpler than Next.js's invisible cache + `revalidatePath()`

**Code Statistics:**
- ~17 total components (same count as Next.js)
- All components can use reactivity without directives
- Significantly less boilerplate (no dependency arrays, no optimization hooks)

### Verdict

**For React developers**: SolidStart has a **learning curve** (new syntax, different mental model), but is **conceptually simpler** once learned. No rules of hooks, no dependency arrays, no re-render optimization.

**For new developers**: SolidStart is objectively simpler. Fewer rules, less boilerplate, more predictable behavior.

**In practice**: SolidStart requires ~20-30% less code for the same functionality due to automatic reactivity and no optimization boilerplate. The hardest part is unlearning React's constraints.

### SvelteKit Complexity

**Even Simpler Than SolidStart:**
- **Svelte 5 Runes**:
  - `let count = $state(0)` - reactive state is just a variable
  - `let doubled = $derived(count * 2)` - computed values are explicit
  - No getters/setters like Solid—reads and writes look like normal variables
- **No Rules, No Manual Tracking**:
  - Use state anywhere: loops, conditionals, event handlers
  - Automatic dependency tracking in `$effect` and `$derived`
  - No dependency arrays, no rules of hooks
- **Template Syntax**:
  - Write HTML with `{expressions}` directly in `.svelte` files
  - `#if`, `#each`, `#await` for control flow (clear and declarative)
  - Scoped styles by default (no CSS-in-JS needed)
- **Progressive Enhancement**:
  - Forms work without JavaScript by default
  - `use:enhance` progressively enhances with client-side optimistic updates
  - Best of both worlds: works everywhere, fast when JS available
- **Zero Optimization Needed**:
  - Compiler analyzes code at build time
  - Only subscribes to what's actually used
  - No manual memoization, no performance tuning

**Code Statistics:**
- ~17 total components (same as Next.js and SolidStart)
- All components can use reactivity without directives
- Least boilerplate of all three frameworks
- Most "normal" looking code (closest to vanilla HTML/CSS/JS)

**Verdict**: SvelteKit is the **most approachable** for developers coming from any background. It feels like writing enhanced HTML/CSS/JS, not learning a new programming paradigm. Once you understand runes (`$state`, `$derived`, `$effect`), everything else is just HTML and JavaScript.

---

## Developer Experience Notes

### Next.js Pros
- Mature ecosystem with extensive documentation
- Rich tooling (React DevTools, extensive VS Code support)
- Large community and third-party library support

### Next.js Cons
- Larger bundle sizes (~3x bigger than SolidStart)
- Server/Client component split can be confusing
- More boilerplate for state management
- Heavier runtime overhead

### SolidStart Pros
- Significantly smaller bundles
- Fine-grained reactivity (faster updates, less re-rendering)
- Simpler mental model (no Virtual DOM diffing)
- Faster build times with Vinxi
- Less boilerplate for reactive state

### SolidStart Cons
- Smaller ecosystem and community
- Less mature tooling compared to React

### SvelteKit Pros
- **Tiny bundles**: Comparable to SolidStart (~40 kB for board page)
- **Compile-time optimization**: Most framework code compiled away
- **Svelte 5 Runes**: Modern reactivity with minimal boilerplate
- **Progressive enhancement**: Forms work without JavaScript
- **Familiar syntax**: Feels like writing HTML/CSS/JS
- **Excellent DX**: Clear error messages, fast HMR

### SvelteKit Cons
- **Smaller ecosystem** than React (but growing with Svelte 5)
- **Less familiar** to React developers (different patterns)
- **Fewer third-party libraries** compared to React ecosystem

### Qwik (Expected)
- **Pros**: Instant startup (resumability), extreme lazy loading, smallest initial bundle
- **Cons**: Most different mental model, smallest ecosystem, newest framework

---

## Why This Comparison Matters

This isn't just about bundle sizes. It's about:

1. **Proving a thesis**: "React-by-default" has measurable costs
2. **Empowering choice**: When you see the data, you can make informed decisions
3. **Mobile-first reality**: For teams without native apps, web performance IS the product
4. **Innovation space**: Alternatives deserve evaluation on technical merit, not just network effects

**The pattern we're testing**: When you rethink fundamental assumptions (Virtual DOM, hydration, reactivity), you get fundamentally better results. Not 10% better. 3-4x better.

---

## Code Comparison Highlights

This repository provides detailed code comparisons across all 7 frameworks. Key patterns to explore:

### 1. **Reactivity & State Management**
Compare how each framework handles reactive state:
- **React**: `useState` + `useEffect` with manual dependency arrays
- **Vue/Nuxt**: `ref()` + `watch()` with `.value` access
- **Angular/Analog**: `signal()` + `effect()` with getters/setters
- **Solid**: `createSignal` + `createEffect` with automatic tracking
- **Svelte**: `$state` + `$effect` (looks like normal variables)
- **Qwik**: `useSignal` + `useTask$` (serializable for resumability)

**Files**: `CardEditModal` component across all frameworks

### 2. **Server-Side Data Fetching**
Compare data loading patterns:
- **Next.js**: Async Server Components with `Promise.all`
- **Nuxt**: `useAsyncData` with SSR-aware caching
- **SvelteKit**: `load` functions with `depends()` for invalidation
- **Solid**: `createAsync` with cache deduplication
- **Qwik**: `routeLoader$` with automatic serialization
- **Analog**: `injectLoad` + Angular DI

**Files**: Board page route across all frameworks

### 3. **Form Handling & Mutations**
Compare form submission and server mutations:
- **Next.js**: Server Actions with `revalidatePath()`
- **Nuxt**: `$fetch` to API routes in `server/api/*`
- **SvelteKit**: Form Actions with progressive enhancement
- **Solid**: Server functions with `action()`
- **Qwik**: `routeAction$` with resumable forms
- **Analog**: `ApiService` + RxJS Observables

**Files**: Card create/update actions across all frameworks

### 4. **Control Flow**
Compare template syntax vs JSX:
- **React/Solid/Qwik**: JavaScript expressions (ternary, `.map()`)
- **Vue/Nuxt**: Directive attributes (`v-if`, `v-for`)
- **Svelte**: Template blocks (`#if`, `#each`)
- **Angular**: New control flow syntax (`@if`, `@for`)

**Files**: Board listing page across all frameworks

### 5. **Drag & Drop**
Compare library integration approaches:
- **React**: `@dnd-kit` (most popular ecosystem)
- **Vue/Nuxt**: `vuedraggable` component wrapper
- **Solid**: `@thisbeyond/solid-dnd` (similar API to dnd-kit)
- **Svelte**: Native HTML5 drag & drop (lightest)
- **Qwik**: Native with serializable handlers
- **Angular**: Angular CDK (most feature-rich, heaviest)

**Files**: Board page drag-drop implementation

See [BLOG_POST_NOTES.md](BLOG_POST_NOTES.md) for detailed file paths and code comparison analysis.

### 6. **Routing & Nested Layouts**
Compare routing primitives and nested layouts, which shape daily DX:
- **Next.js**: App Router with nested `layout.tsx` and segment conventions
- **Nuxt**: File-system routing with `pages/` and nested layouts
- **SvelteKit**: `+layout.svelte` / `+page.svelte` hierarchy
- **SolidStart**: File-based routes with nested layouts
- **Qwik City**: File-based routing with `layout.tsx`
- **Analog (Angular)**: Standalone route definitions with nested layouts

**Files**: Home route + board route layout files for each framework

---

## Related

- Blog Post: ["React Won by Default – And It's Killing Frontend Innovation"](link-to-post)
- See [BLOG_POST_NOTES.md](BLOG_POST_NOTES.md) for detailed code comparison analysis and blog post outline
- See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for implementation guidelines

---

## License

MIT
