# Framework Bundle Size Comparison

A comprehensive comparison of 10 modern web frameworks, measuring real-world bundle sizes using identical Kanban board implementations. **All frameworks achieve excellent Lighthouse performance scores (100) with similar First Contentful Paint times (35-71ms), making bundle size the key differentiator** for mobile users.

## Overview

This project implements the same Kanban board application in 10 different frameworks to provide fair, reproducible bundle size comparisons. All implementations share identical functionality, database schema, and UI framework (Tailwind CSS + DaisyUI). With performance being essentially identical across frameworks, this evaluation focuses on JavaScript bundle sizes, which range from 28.8 kB to 176.3 kB compressed—a 6.1x difference that impacts mobile users through data usage, parse time, and battery drain.

## Frameworks Compared

1. **Next.js 16** (React 19 with built-in compiler)
2. **TanStack Start** (React 19, leaner meta-framework)
3. **TanStack Start + Solid** (SolidJS 1.9)
4. **Nuxt 4** (Vue 3)
5. **Analog** (Angular 20)
6. **Marko** (@marko/run)
7. **SolidStart** (SolidJS 1.9)
8. **SvelteKit** (Svelte 5)
9. **Qwik City** (Resumability-based)
10. **Astro + HTMX** (MPA approach)

## Tech Stack Comparison

| Category             | Next.js                          | TanStack Start                   | TanStack Start + Solid       | Nuxt                         | Analog                       | Marko                        | SolidStart                   | SvelteKit                           | Qwik                         | Astro + HTMX                 |
| -------------------- | -------------------------------- | -------------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ----------------------------------- | ---------------------------- | ---------------------------- |
| **Framework**        | Next.js 16 (App Router)          | TanStack Start 1.133.8 (w/React) | TanStack Start 1.133.8       | Nuxt 4                       | Analog (Angular)             | @marko/run 0.8               | SolidStart 1.1.0             | SvelteKit + Svelte 5                | Qwik City                    | Astro 5 + HTMX               |
| **UI Library**       | React 19 + Compiler              | React 19 + Compiler              | SolidJS 1.9                  | Vue 3                        | Angular 20                   | Marko 6                      | SolidJS 1.9                  | Svelte 5                            | Qwik                         | HTMX (server-driven)         |
| **Reactivity Model** | Virtual DOM + Compiler           | Virtual DOM + Compiler           | Signals (fine-grained)       | Reactive refs                | Signals (zoneless)           | Signals (fine-grained)       | Signals (fine-grained)       | Runes (fine-grained)                | Signals + Resumability       | Server-driven (HTMX)         |
| **Data Fetching**    | Server Components                | TanStack Router loaders          | TanStack Router loaders      | `useAsyncData` / `useFetch`  | `injectLoad` + DI            | Route data handlers          | `createAsync` with cache     | Remote functions (`query`)          | `routeLoader$`               | Route handlers               |
| **Mutations**        | Server Actions                   | Server functions (RPC)           | Server functions (RPC)       | API routes (`server/api/*`)  | `ApiService` + RxJS          | POST handlers                | Server functions             | Remote functions (`form`/`command`) | Server actions               | API routes + HTMX            |
| **Database**         | Drizzle ORM + better-sqlite3     | Drizzle ORM + better-sqlite3     | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3        | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 |
| **Styling**          | DaisyUI                          | DaisyUI                          | DaisyUI                      | DaisyUI                      | DaisyUI                      | DaisyUI                      | DaisyUI                      | DaisyUI                             | DaisyUI                      | DaisyUI                      |
| **Drag & Drop**      | @dnd-kit/core, @dnd-kit/sortable | @dnd-kit/core, @dnd-kit/sortable | @thisbeyond/solid-dnd        | @formkit/drag-and-drop       | @angular/cdk                 | @formkit/drag-and-drop       | @thisbeyond/solid-dnd        | Native HTML5                        | Native HTML5                 | @formkit/drag-and-drop       |
| **Build Tool**       | Turbopack                        | Vite                             | Vite                         | Vite                         | Vite + Angular               | Vite                         | Vinxi                        | Vite                                | Vite + Qwik optimizer        | Vite                         |

## Key Results

**Bundle Size Rankings (Board Page - Smallest to Largest):**

1. **Marko**: 88.8 kB raw (28.8 kB compressed) - 6.36x smaller than Next.js
2. **Astro + HTMX**: 127.3 kB raw (34.3 kB compressed) - 5.14x smaller than Next.js
3. **SolidStart**: 128.6 kB raw (41.5 kB compressed) - 4.25x smaller than Next.js
4. **SvelteKit**: 125.2 kB raw (54.1 kB compressed) - 3.26x smaller than Next.js
5. **Qwik**: 114.8 kB raw (58.4 kB compressed) - 3.02x smaller than Next.js
6. **TanStack Start + Solid**: 182.6 kB raw (60.4 kB compressed) - 2.92x smaller than Next.js
7. **Nuxt**: 224.9 kB raw (72.3 kB compressed) - 2.44x smaller than Next.js
8. **Analog (Angular)**: 376.3 kB raw (103.9 kB compressed) - 1.70x smaller than Next.js
9. **TanStack Start (React)**: 373.6 kB raw (118.2 kB compressed) - 1.49x smaller than Next.js
10. **Next.js 16**: 564.9 kB raw (176.3 kB compressed) - Baseline

All measurements performed on mobile devices (Pixel 5 emulation) with 4G throttling using Chrome Lighthouse. See [METHODOLOGY.md](./METHODOLOGY.md) for complete details.

## Prerequisites

- **Node.js**: v20-24
- **Python 3**: For chart generation
- **Chrome/Chromium**: Required by Lighthouse

## Installation

Install root dependencies:

```bash
npm install
```

Then install dependencies for each framework implementation:

```bash
cd kanban-analog && npm install
cd ../kanban-htmx && npm install
cd ../kanban-marko && npm install
cd ../kanban-nextjs && npm install
cd ../kanban-nuxt && npm install
cd ../kanban-qwikcity && npm install
cd ../kanban-solidstart && npm install
cd ../kanban-sveltekit && npm install
cd ../kanban-tanstack && npm install
cd ../kanban-tanstack-solid && npm install
```

## Building All Apps

Build production builds for all frameworks:

```bash
npm run build:all
```

This runs `npm run build` in each `kanban-*` directory sequentially.

## Running Performance Measurements

### Full Measurement Suite

Run complete measurements with statistical analysis (10 runs per page):

```bash
npm run measure:all
```

This will:

1. Run performance measurements for all frameworks
2. Generate comparison charts
3. Output results to `metrics/` folder

### Individual Commands

**Measure only (without charts):**

```bash
npm run measure:final
```

**Generate charts from existing measurements:**

```bash
npm run generate:charts
```

**Single framework measurement:**

```bash
npm run measure:single
```

### What Gets Measured

Each framework is measured on two pages:

- **Home page**: Simple landing page
- **Board page**: Interactive Kanban board with drag-and-drop

Metrics collected:

- JavaScript bundle size (raw and compressed)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Lighthouse Performance Score

## Measurement Methodology

This project uses rigorous statistical methods to ensure reproducible, reliable results:

- **10 measurement runs** per page
- **IQR outlier removal** for statistical robustness
- **Cache clearing** between runs
- **Server warmup** requests before measurement
- **Mobile device emulation** (Pixel 5, 4G throttling)

For complete methodology details, measurement conditions, and reproducibility instructions, see:

### [📖 METHODOLOGY.md](./METHODOLOGY.md)

## Project Structure

```
kanban-comparison/
├── kanban-analog/          # Angular 20 via Analog
├── kanban-htmx/            # Astro + HTMX
├── kanban-marko/           # Marko 6
├── kanban-nextjs/          # Next.js 16 (React 19)
├── kanban-nuxt/            # Nuxt 4 (Vue 3)
├── kanban-qwikcity/        # Qwik City
├── kanban-solidstart/      # SolidStart
├── kanban-sveltekit/       # SvelteKit (Svelte 5)
├── kanban-tanstack/        # TanStack Start (React)
├── kanban-tanstack-solid/  # TanStack Start (Solid)
├── scripts/                # Measurement and analysis scripts
├── metrics/                # Generated measurement results
├── _loren/                 # Blog posts and documentation
├── METHODOLOGY.md          # Detailed measurement methodology
└── package.json            # Root package with measurement scripts
```

## Output Files

After running measurements, results are saved to `metrics/`:

- `final-measurements.json` - Raw measurement data
- `final-measurements.md` - Human-readable results
- `bundle-size-comparison.svg` - Bundle size chart
- `bundle-size-board.svg` - Board page bundles
- `bundle-size-home.svg` - Home page bundles

## Development

To run individual frameworks in development mode:

```bash
cd kanban-[framework-name]
npm run dev
```

Each implementation includes:

- Identical database schema and seed data
- Same UI components and styling
- Equivalent features and functionality
- Production-optimized build configuration

## Notes

- All frameworks use their recommended production build configurations
- Bundle sizes reflect framework overhead + application code
- Measurements represent baseline implementations with minimal dependencies
- Real production apps typically ship 5-10x more JavaScript from third-party libraries

## License

MIT

## Author

Loren Stewart

---

For questions about measurement methodology or to report issues, please open an issue or submit a PR on GitHub.
