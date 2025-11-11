# Playwright-Based Performance Measurement

A Playwright alternative to the Lighthouse CLI for measuring web performance metrics. This approach provides more granular data about resource loading and script evaluation times.

Automatically measures both **cold-load** (no cache) and **warm-load** (cached) scenarios for a complete picture of performance.

## Installation

```bash
cd playwright
npm install
```

## Usage

```bash
tsx playwright/measure.ts --url <url> [--name <framework-name>] [--runs N] [--network TYPE]
```

### Examples

```bash
tsx playwright/measure.ts --url http://localhost:3000 --runs 5

tsx playwright/measure.ts --url https://kanban-nextjs.pages.dev --name "Next.js" --runs 10

tsx playwright/measure.ts --url http://localhost:3001 --network none --runs 3
```

## Options

- `--url URL` - URL to measure (required)
- `--name NAME` - Framework name (inferred from URL if not provided)
- `--runs N` - Number of measurement runs per **cache mode** (default: 10)
- `--network TYPE` - Connection type: `cellular4g` (default), `none` (no throttling)

## Cache Scenarios

This tool automatically measures **both** scenarios:

### ❄️ Cold-Load (No Cache)

- Browser cache cleared before each run
- Measures first-visit user experience
- Runs in separate browser contexts
- Most realistic for new users

### 🔥 Warm-Load (With Cache)

- Browser cache retained across runs
- Measures repeat-visit experience
- Runs in same browser context
- Shows impact of caching strategy

## Measured Metrics

### Bundle Sizes

- **JS Transferred** - Compressed JavaScript bundle size (0 bytes if cached)
- **JS Uncompressed** - Original JavaScript size before compression
- **CSS Transferred** - Compressed CSS bundle size (0 bytes if cached)
- **CSS Uncompressed** - Original CSS size before compression
- **JS to Total Ratio** - Percentage of JavaScript in total assets

### Web Vitals

- **FCP (First Contentful Paint)** - Time until first content appears
- **LCP (Largest Contentful Paint)** - Time until largest element renders
- **CLS (Cumulative Layout Shift)** - Visual stability score
- **TTFB (Time to First Byte)** - Server response time

### Script Evaluation

- **Total Script Eval Time** - Time spent parsing and evaluating all scripts (minimal when cached)
- **Script Count** - Number of script resources loaded
- **Average Script Eval Time** - Per-script evaluation time

### Resource Metrics

- **Resource Count** - Total number of resources loaded per page

## Output

Results are saved to `metrics/{framework-name}-playwright.json` and output as JSON to stdout.

Each cache mode includes:

- **4 results per page**: 2 pages × 2 cache modes (home cold, home warm, board cold, board warm)
- Statistical summary (mean, median, stddev, min, max) for each metric
- Cache mode indicator ('cold' or 'warm')
- Metadata about the measurement environment

### Example: Total Measurement Time

- `--runs 5` = 5 runs × 2 cache modes = 10 total page loads per page
- For 2 pages: ~20-40 minutes (depending on network conditions)
