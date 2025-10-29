# Framework Performance Comparison

A comprehensive performance comparison of 10 modern web frameworks, measuring real-world bundle sizes and runtime performance using identical Kanban board implementations.

## Overview

This project implements the same Kanban board application in 10 different frameworks to provide fair, reproducible performance comparisons. All implementations share identical functionality, database schema, and UI framework (Tailwind CSS + DaisyUI).

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
11. **Datastar** (MPA and SSE approach)

## Key Results

**Bundle Size Champions:**

- **Marko**: 88.8 kB raw (28.8 kB compressed) - 6.36x smaller than Next.js
- **Qwik**: 114.8 kB raw (58.4 kB compressed) - 4.92x smaller than Next.js
- **SvelteKit**: 125.2 kB raw (54.1 kB compressed) - 4.51x smaller than Next.js
- **SolidStart**: 128.6 kB raw (41.5 kB compressed) - 4.39x smaller than Next.js

**Performance Champions (First Contentful Paint):**

- **SolidStart**: 35ms FCP (fastest)
- **Nuxt**: 38ms FCP (tied for 2nd)
- **SvelteKit**: 38ms FCP (tied for 2nd)
- **Marko**: 39ms FCP

**Baseline:**

- **Next.js 16**: 564.9 kB raw (176.3 kB compressed), 467ms FCP

All measurements performed on mobile devices (Pixel 5 emulation) with 4G throttling using Chrome Lighthouse. See [METHODOLOGY.md](./METHODOLOGY.md) for complete details.

## Prerequisites

- **Node.js**: v20 or higher
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
cd ../kanban-datastar && npm install
cd ../kanban-marko && npm install
cd ../kanban-nextjs && npm install
cd ../kanban-nuxt && npm install
cd ../kanban-qwikcity && npm install
cd ../kanban-solidstart && npm install
cd ../kanban-sveltekit && npm install
cd ../kanban-tanstack && npm install
cd ../kanban-tanstack-solid && npm install
```
## Setting up all apps

Ensures the databases are seeded before running all tests

```bash
npm run setup:all
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
