# Kanban Board Comparison: Proving "React-by-Default" Has Real Costs

This repository is a **follow-up proof of concept** to the blog post ["React Won by Default – And It's Killing Frontend Innovation"](https://www.lorenstew.art/blog/react-won-by-default). The blog post that discusses this repo and acts as a Part Two to the "Reacy Won by Default" can be found [here](https://www.lorenstew.art/blog/react-won-by-default).

The first post argued React's dominance stifles innovation. This second post along with this repo **proves it with data**.

By building the same real-world Kanban app across **8 framework implementations**, we measure the actual costs of "React-by-default":

1. ✅ **Next.js 15** (standard) - Virtual DOM baseline
2. ✅ **Next.js 15 + React Compiler** - Can optimization close the gap?
3. ✅ **Nuxt 4** - Vue 3 reactive refs + SSR-first DX
4. ✅ **Analog** - Angular meta-framework with signals
5. ✅ **SolidStart** - Fine-grained reactivity (signals)
6. ✅ **SvelteKit** - Compiler-first approach (Svelte 5 runes)
7. ✅ **Qwik City** - Resumability (no hydration)
8. ✅ **Marko** - Streaming SSR + fine-grained reactivity

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
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable | vuedraggable | @angular/cdk | @thisbeyond/solid-dnd | svelte-dnd-action | Native HTML5 |
| **Build Tool** | Turbopack | Vite | Vite + Angular | Vinxi | Vite | Vite + Qwik optimizer |

---

## Bundle Size Comparison

**Production builds (JS transferred - gzipped):**

| Framework | Homepage | Board Page | Status |
|-----------|----------|------------|--------|
| **Marko** | 7 kB | 29 kB | ✅ Complete |
| **SolidStart** | 30 kB | 41 kB | ✅ Complete |
| **SvelteKit** | 42 kB | 59 kB | ✅ Complete |
| **Qwik City** | 44 kB | 59 kB | ✅ Complete |
| **Next.js + Compiler** | 120 kB | 153 kB | ✅ Complete |
| **Next.js** | 124 kB | 153 kB | ✅ Complete |
| **Nuxt** | 131 kB | 132 kB | ✅ Complete |
| **Analog** | 138 kB | 150 kB | ✅ Complete |

**Key Takeaways**:
- **Marko** is the clear winner at just 7 kB for the home page — **~18x smaller than Next.js**
- **SolidStart** comes in second at 30 kB — **~4x smaller than Next.js**
- **SvelteKit** and **Qwik** follow closely at ~42-44 kB — still **~3x smaller than Next.js**
- React Compiler optimization saves ~4 kB but doesn't fundamentally change the bundle size picture
- Compile-time optimization (Svelte, Marko), resumability (Qwik), and fine-grained reactivity (Solid) all eliminate Virtual DOM overhead

**Pattern Confirmed**: Rethinking core assumptions (Virtual DOM, hydration) yields **3-18x bundle size improvements**, not incremental gains.

**Why This Matters**: For teams serving mobile professionals (real estate agents, field workers, healthcare staff) on cellular connections, 108 kB = 1.5-2 seconds on 4G. That's the difference between confident and apologetic when a buyer is watching.

---

## Lighthouse Performance Scores

**Mobile performance scores (averaged over 5 runs):**

### Homepage

| Framework | Score | FCP (ms) | LCP (ms) | TBT (ms) | CLS | SI (ms) | Bundle Size |
|-----------|-------|----------|----------|----------|-----|---------|-------------|
| **Marko** | 100 | 69 | 69 | 0 | 0 | 86 | 7 kB |
| **Qwik** | 100 | 80 | 80 | 0 | 0 | 80 | 44 kB |
| **SvelteKit** | 100 | 140 | 140 | 0 | 0 | 169 | 42 kB |
| **SolidStart** | 100 | 282 | 282 | 0 | 0 | 315 | 30 kB |
| **Analog** | 100 | 44 | 44 | 0 | 0 | 44 | 138 kB |
| **Next.js** | 100 | 568 | 568 | 0 | 0 | 596 | 124 kB |
| **Nuxt** | 98 | 1,777 | 1,777 | 0 | 0 | 1,778 | 131 kB |
| **Next.js + Compiler** | 98 | 1,366 | 1,366 | 0 | 0 | 1,384 | 120 kB |

### Board Page

| Framework | Score | FCP (ms) | LCP (ms) | TBT (ms) | CLS | SI (ms) | Bundle Size |
|-----------|-------|----------|----------|----------|-----|---------|-------------|
| **Marko** | 100 | 53 | 53 | 0 | 0 | 65 | 29 kB |
| **SolidStart** | 100 | 60 | 60 | 0 | 0 | 101 | 41 kB |
| **SvelteKit** | 100 | 66 | 66 | 0 | 0 | 97 | 59 kB |
| **Analog** | 100 | 325 | 325 | 0 | 0 | 333 | 150 kB |
| **Qwik** | 100 | 521 | 521 | 0 | 0 | 529 | 59 kB |
| **Nuxt** | 98 | 1,579 | 1,579 | 0 | 0 | 1,586 | 132 kB |
| **Next.js** | 97 | 2,157 | 2,157 | 0 | 0 | 2,163 | 153 kB |
| **Next.js + Compiler** | 97 | 2,163 | 2,163 | 0 | 0 | 2,169 | 153 kB |

**Key Metrics**:
- **FCP** (First Contentful Paint): When the first content appears
- **LCP** (Largest Contentful Paint): When the main content is visible
- **TBT** (Total Blocking Time): How long the main thread is blocked
- **CLS** (Cumulative Layout Shift): Visual stability (0 = perfect)
- **SI** (Speed Index): How quickly content is visually displayed

**Performance Insights**:
- **Marko** achieves the fastest board page load (53ms FCP) with the smallest bundle (29 kB)
- **SolidStart** and **SvelteKit** deliver exceptional sub-70ms board page loads
- **Qwik** provides sub-100ms homepage loads with resumability
- **Analog** shows surprisingly fast metrics despite larger bundles (Angular optimization at work)
- React-based frameworks show **40x slower** FCP on complex pages (board page: ~2,100ms vs ~53ms)
- All non-React frameworks achieve perfect 100 scores on the board page

---

### Measurement Methodology

**What we measure:**
- Client JS bundle sizes (gzipped) transferred over the network
- Measured using Chrome Lighthouse with mobile emulation
- Throttling disabled to focus purely on bundle size, not network speed
- Two pages tested: Homepage (board list) and Board Page (full kanban board)

**How to reproduce:**

1. **Build all apps:**
```bash
npm run build:all
```

2. **Measure a single framework:**
```bash
# Replace with exact framework name (see options below)
tsx scripts/measure-single.ts "SvelteKit"
```

Available framework names (case-sensitive):
- `"Next.js"`
- `"Next.js + Compiler"`
- `"Nuxt"`
- `"Analog"`
- `"SolidStart"`
- `"SvelteKit"`
- `"Qwik"`
- `"Marko"`

The script outputs JSON with bundle measurements:
```json
[
  {
    "framework": "SvelteKit",
    "page": "home",
    "jsTransferred": 42534,
    "jsUncompressed": 85216,
    "totalRequests": 16,
    "timestamp": "2025-10-09T23:35:25.083Z"
  },
  {
    "framework": "SvelteKit",
    "page": "board",
    "jsTransferred": 60055,
    "jsUncompressed": 138354,
    "totalRequests": 16,
    "timestamp": "2025-10-09T23:35:45.087Z"
  }
]
```

**Fairness constraints (apples-to-apples):**
- Pinned framework/tool versions
- Identical data volume on the Board page
- Normalized CSS/icon handling (treeshake/purge)
- Same features and functionality across all apps

---

## Performance Metrics of Board Page (Mobile - Lighthouse)

| Metric | Marko | SolidStart | SvelteKit | Qwik | Analog | Nuxt | Next.js | Next.js + Compiler |
|--------|-------|------------|-----------|------|--------|------|---------|-------------------|
| Lighthouse Performance Score | **100** | **100** | **100** | **100** | **100** | 98 | 97 | 97 |
| First Contentful Paint (FCP) | **53ms** | **60ms** | **66ms** | 521ms | 325ms | 1,579ms | 2,157ms | 2,163ms |
| Largest Contentful Paint (LCP) | **53ms** | **60ms** | **66ms** | 521ms | 325ms | 1,579ms | 2,157ms | 2,163ms |
| Total Blocking Time (TBT) | **0ms** | **0ms** | **0ms** | **0ms** | **0ms** | **0ms** | **0ms** | **0ms** |
| Cumulative Layout Shift (CLS) | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |
| Speed Index (SI) | **65ms** | **101ms** | **97ms** | 529ms | 333ms | 1,586ms | 2,163ms | 2,169ms |

**Key Takeaways**:
- **Marko** achieves the fastest paint times (53ms FCP) - **40x faster than Next.js**
- **SolidStart and SvelteKit** follow closely (60-66ms) - **35x faster than Next.js**
- All frameworks achieve perfect stability (0 CLS, 0 TBT)
- React frameworks take **2+ seconds** for FCP vs **sub-100ms** for compile-first and fine-grained reactive frameworks
- Smaller bundles directly correlate with faster paint times

---

## Architecture Differences

### Next.js 15
- **Server Components**: Pages are Server Components by default, fetching data at the server level
- **Client Components**: Interactive UI (modals, drag-drop) uses `"use client"` directive
- **Server Actions**: Form submissions and mutations use async server functions
- **Optimistic Updates**: Managed via React hooks (`useState`, `useEffect`)
- **Cache Invalidation**: `revalidatePath()` clears Next.js cache after mutations
- **Drag-and-Drop**: Uses `@dnd-kit/core` and `@dnd-kit/sortable` libraries

### SolidStart
- **Fine-grained Reactivity**: Signals and effects provide granular updates without re-rendering
- **Server Functions**: `"use server"` directive for server-side logic
- **Cache Integration**: `cache()` and `revalidate()` for data freshness
- **Optimistic Updates**: Managed via SolidJS stores and signals
- **Drag-and-Drop**: Uses `@thisbeyond/solid-dnd` library

### SvelteKit
- **Runes**: Svelte 5's compile-time reactivity (`$state`, `$derived`, `$effect`)
- **Load Functions**: Server-side data loading per route with automatic caching
- **Form Actions**: Progressive enhancement for form submissions with `enhance`
- **Compiler-First**: Minimal runtime overhead; most framework code compiled away
- **Optimistic Updates**: Managed via `$state` runes with automatic reactivity
- **Drag-and-Drop**: Uses `svelte-dnd-action` library with FLIP animations

### Nuxt 4
- **Vue 3 Reactivity**: Reactive refs (`ref()`, `reactive()`) with automatic dependency tracking
- **Composables**: `useAsyncData` and `useFetch` for SSR-aware data fetching with caching
- **Server Routes**: API routes in `server/api/*` with `defineEventHandler`
- **Auto-imports**: Components, composables, and utilities auto-imported
- **Optimistic Updates**: Managed via reactive refs and watchers
- **Drag-and-Drop**: Uses `vuedraggable` component wrapper

### Analog
- **Angular Signals**: Modern signals API reducing RxJS boilerplate
- **Dependency Injection**: Angular's powerful DI system for services
- **Server Routes**: Vite-powered server routes with Angular integration
- **Optimistic Updates**: Managed via Angular signals and RxJS
- **Drag-and-Drop**: Angular CDK for feature-rich drag-and-drop
- **TypeScript-First**: Strong typing throughout with Angular's compiler

### Qwik City
- **Resumability**: No hydration—resume execution instantly from HTML
- **Progressive Loading**: Load only what's needed for current interaction
- **Fine-grained Lazy Loading**: Component-level code splitting with `$()`
- **Signals**: Fine-grained reactivity without Virtual DOM
- **Serialization**: Everything must be serializable for resumability
- **Drag-and-Drop**: Native HTML5 drag & drop with serializable handlers

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
- **Next.js**: `@dnd-kit/core` and `@dnd-kit/sortable` (most popular React ecosystem)
- **Nuxt**: `vuedraggable` component wrapper
- **SolidStart**: `@thisbeyond/solid-dnd` (similar API to dnd-kit)
- **SvelteKit**: `svelte-dnd-action` with FLIP animations
- **Qwik**: Native HTML5 with serializable handlers (no library needed)
- **Analog**: `@angular/cdk` (most feature-rich)

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
