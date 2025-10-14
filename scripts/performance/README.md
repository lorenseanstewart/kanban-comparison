# Performance Measurement Scripts

These scripts measure and compare bundle sizes and performance metrics across all 7 framework implementations.

## Prerequisites

```bash
# Install dependencies
npm install -g tsx lighthouse

# Ensure all frameworks are built
cd kanban-nextjs && npm run build && cd ..
cd kanban-nuxt && npm run build && cd ..
cd kanban-analog && npm run build && cd ..
cd kanban-solidstart && npm run build && cd ..
cd kanban-sveltekit && npm run build && cd ..
cd kanban-qwikcity && npm run build && cd ..
```

## Usage

### 1. Measure Bundle Sizes

Analyzes production build outputs and calculates gzipped sizes:

```bash
tsx scripts/performance/measure-bundles.ts
```

**Outputs:**
- `metrics/bundle-analysis.json` - Detailed file-by-file breakdown
- `metrics/bundle-summary.json` - Summary data for charts

### 2. Run Lighthouse Audits

Measures performance, accessibility, and other metrics:

```bash
tsx scripts/performance/lighthouse-all.ts
```

**Note:** This will start each app on a different port and run Lighthouse against it. Estimated time: 10-15 minutes.

**Outputs:**
- `metrics/lighthouse-results.json` - Full Lighthouse reports
- `metrics/lighthouse-summary.json` - Summary metrics

### 3. Generate Charts and Tables

Creates markdown tables and chart-ready JSON:

```bash
tsx scripts/performance/generate-charts.ts
```

**Outputs:**
- `metrics/bundle-comparison.md` - Bundle size tables with 3G download times
- `metrics/lighthouse-comparison.md` - Performance score tables
- `metrics/combined-comparison.md` - Everything combined
- `metrics/quick-reference.md` - TL;DR summary
- `metrics/chart-data.json` - Data formatted for chart libraries

## Run All Measurements

```bash
# Run everything in sequence
tsx scripts/performance/measure-bundles.ts && \
tsx scripts/performance/lighthouse-all.ts && \
tsx scripts/performance/generate-charts.ts
```

## What Gets Measured

### Bundle Analysis
- Total bundle size (raw & gzipped)
- JavaScript size (raw & gzipped)
- CSS size (raw & gzipped)
- File-by-file breakdown
- Framework comparison ratios

### Lighthouse Metrics
- Performance score (0-100)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

### Network Simulations
- Desktop (no throttling)
- Mobile (4G throttling)
- Optional: 3G simulation (very slow, for manual testing)

## Framework Ports

If you need to change the ports, edit `lighthouse-all.ts`:

```typescript
const FRAMEWORKS = [
  { name: 'Next.js', dir: 'kanban-nextjs', port: 3000, startCmd: 'npm run start' },
  { name: 'Nuxt', dir: 'kanban-nuxt', port: 3002, startCmd: 'npm run preview' },
  // ... etc
];
```

## Troubleshooting

### "Port already in use"
The script tries to kill processes on the required ports automatically. If this fails:

```bash
# Manually kill a port
lsof -ti :3000 | xargs kill -9
```

### "Build not found"
Ensure you've built all frameworks first:

```bash
# Build all at once
for dir in kanban-*/; do (cd "$dir" && npm run build); done
```

### Lighthouse fails
Make sure Chrome/Chromium is installed and accessible:

```bash
# Test lighthouse manually
npx lighthouse http://localhost:3000 --view
```

## Using the Data

### For the Blog Post

The generated markdown files are ready to drop into `NEW_POST.md`:

1. Copy bundle comparison table from `metrics/bundle-comparison.md`
2. Copy lighthouse scores from `metrics/lighthouse-comparison.md`
3. Use `metrics/quick-reference.md` for the TL;DR section

### For Charts/Visualizations

Use `metrics/chart-data.json` with libraries like:
- Chart.js
- Recharts
- Victory
- Observable Plot
- D3.js

### For Social Media

The quick reference has pre-formatted bullet points perfect for tweets/posts.

## Customization

### Add More Metrics

Edit `lighthouse-all.ts` to capture additional audits:

```typescript
// Add to parseLighthouseResult()
metrics: {
  // ... existing metrics
  serverResponseTime: audits['server-response-time'].numericValue,
  renderBlockingResources: audits['render-blocking-resources'].numericValue,
}
```

### Change Throttling

Modify the `THROTTLING` array in `lighthouse-all.ts`:

```typescript
const THROTTLING = ['none', '3g', '4g'] as const;
```

### Custom Charts

Edit `generate-charts.ts` to create your own visualizations or export formats.
