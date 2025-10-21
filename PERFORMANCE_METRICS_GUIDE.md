# Performance & Bundle Measurement Guide

**Audience**: Project maintainers and contributors running measurements.

**Purpose**: Operational guide for running measurement scripts, interpreting output, and updating results. For methodology justification and public documentation, see [METHODOLOGY.md](../METHODOLOGY.md) in the project root.

---

This guide explains how to measure bundle sizes and performance across all framework implementations to ensure fair, apples-to-apples comparisons.

## Overview

All performance measurements are automated using scripts in the `scripts/` directory. These scripts:

- Start each framework's production server on a dedicated port
- Measure bundle sizes using Chrome Lighthouse with network inspection
- Run multiple measurements (3 runs per page by default) for statistical validity
- Clear browser cache between runs to measure cold-load performance
- Run Lighthouse performance audits with mobile emulation and 4G throttling
- Calculate statistics (mean, median, standard deviation)
- Generate JSON data and markdown tables with statistical measures

## Prerequisites

**Required:**

- Node.js 20.x or higher
- Chrome/Chromium (for Lighthouse)
- Python 3.6+ (for SVG chart generation, no packages needed)

**Install dependencies:**

```bash
npm install -g tsx lighthouse
```

## Quick Start

To run all measurements with statistical rigor:

```bash
# From project root
tsx scripts/measure-final.ts --runs 3
```

This command:

1. Validates all framework builds exist
2. Measures each framework with multiple runs (default: 3)
3. Calculates statistics (median, std dev, min, max)
4. Generates JSON results and markdown tables
5. Creates legacy-compatible bundle-summary.json

**Estimated time**: ~10-15 minutes for 3 runs across all frameworks

## Individual Scripts

### 1. Single Framework Measurement

**Script:** `scripts/measure-single.ts`

Measures a single framework with multiple runs for statistical validity:

- Runs N measurements per page (default: 3)
- Clears browser cache between runs (cold-load measurement)
- Captures bundle sizes, performance scores, and Core Web Vitals
- Calculates statistics: mean, median, std dev, min, max
- Detects compression type (gzip/brotli)
- Validates Chrome/Lighthouse version

**Run:**

```bash
tsx scripts/measure-single.ts "Next.js" --runs 3
```

**Output:** JSON to stdout with statistical summaries

### 2. Full Production Measurement

**Script:** `scripts/measure-final.ts`

Runs measure-single.ts for all frameworks and generates comprehensive reports:

- Validates all builds before starting
- Measures all frameworks sequentially
- Generates markdown tables with statistics
- Creates JSON results with metadata
- Outputs legacy-compatible format for existing charts

**Run:**

```bash
tsx scripts/measure-final.ts --runs 3
```

**Output:**

- `metrics/final-measurements.json` - Full results with statistics
- `metrics/final-measurements.md` - Publication-ready markdown tables
- `metrics/bundle-summary.json` - Legacy format (median values)

**Framework Port Assignments:**

- Next.js: 3000
- Next.js + Compiler: 3001
- Nuxt: 3002
- Analog: 3003
- SolidStart: 3004
- SvelteKit: 3005
- Qwik: 3006
- Astro: 3007
- TanStack Start: 3008
- Marko: 3009

### 3. Legacy Batch Measurement (Optional)

**Script:** `scripts/measure-all-lighthouse.ts`

Legacy script available via `npm run measure:legacy`. This script runs all frameworks with 5 runs each but uses the older measurement approach without the enhanced statistics and raw size tracking.

```bash
npm run measure:legacy
```

**Note:** `measure-final.ts` is the recommended production script with full statistical rigor.

**Metrics Captured:**

All scripts capture the following metrics:

- **Bundle Size**: JS transferred (compressed), JS uncompressed
- **Performance Score**: Lighthouse performance score (0-100)
- **First Contentful Paint (FCP)**: Time to first content render
- **Largest Contentful Paint (LCP)**: Time to main content render
- **Total Blocking Time (TBT)**: Interactivity delay
- **Cumulative Layout Shift (CLS)**: Visual stability
- **Speed Index (SI)**: Visual completion speed

## Framework Configuration

Each framework is configured in the measurement scripts with:

```typescript
{
  name: 'Framework Name',
  dir: 'kanban-directory',
  port: 3000,
  startCmd: 'npm run start', // or 'npm run preview'
  homeUrl: '/',
  boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c'
}
```

## Measurement Settings

**Quick Reference:**

- **Runs per page**: 5 (default, configurable with `--runs`)
- **Cache**: Cleared between runs (cold-load)
- **Results**: Median ± standard deviation
- **Device**: Mobile (Pixel 5 emulation)
- **Network**: 4G throttling (10 Mbps, 40ms RTT)
- **CPU**: 1x (no throttling)
- **Browser**: Chrome headless

**Why these settings?** See [METHODOLOGY.md](../METHODOLOGY.md) for detailed justification of these choices and trade-offs.

**Expected Variance:**

- Bundle sizes: ±2-3% (build timestamps)
- Performance scores: ±2-3 points
- Core Web Vitals: ±5-10%

## Fairness Constraints

To ensure apples-to-apples comparisons:

1. **Identical features**: All apps have the same functionality
2. **Same database**: All apps use the same SQLite database with identical data
3. **Same UI framework**: All apps use Tailwind CSS + DaisyUI
4. **Production builds**: All measurements use production builds with optimizations enabled
5. **Same test URLs**: All apps test the same routes with the same data
6. **Consistent environment**: Measurements run on the same machine with no other apps running

## Troubleshooting

### Port already in use

The scripts automatically kill processes on required ports. If this fails:

```bash
lsof -ti :3000 | xargs kill -9
```

### Build not found

Ensure all frameworks are built before running measurements:

```bash
cd kanban-nextjs && npm run build && cd ..
cd kanban-nuxt && npm run build && cd ..
# ... repeat for all frameworks
```

Or use the build-all script:

```bash
npm run build:all
```

### Lighthouse fails

Ensure Chrome/Chromium is installed:

```bash
# Test lighthouse manually
npx lighthouse http://localhost:3000 --view
```

### Missing Python

The SVG chart generation requires Python 3.6+:

```bash
python3 --version
```

## Data Integrity

**Before running measurements:**

1. Ensure all apps are built (`npm run build` in each directory)
2. Clear any existing server processes
3. Use the seeded database (don't modify data between tests)

**After measurements:**

1. Verify bundle-summary.json contains all frameworks
2. Check that lighthouse-summary.json has data for all pages
3. Confirm SVG charts are generated successfully

## Output Files

All measurement data is saved to the `metrics/` directory:

```
metrics/
├── final-measurements.json       # Full results with statistics
│                                 # Includes: median, mean, stddev, min, max
│                                 # Metadata: Chrome version, compression type
├── final-measurements.md         # Publication-ready markdown tables
│                                 # Formatted with ± notation
├── bundle-summary.json           # Legacy format (median values only)
│                                 # For compatibility with existing charts
└── [optional SVG charts]         # Can be generated from JSON data
```

**JSON Schema:**

```json
{
  "metadata": {
    "timestamp": "ISO 8601 timestamp",
    "runsPerPage": 3,
    "measurementType": "cold-load",
    "chromeVersion": "Lighthouse version",
    "compressionType": "gzip/brotli/none"
  },
  "results": [
    {
      "framework": "Framework name",
      "page": "home|board",
      "jsTransferred": {
        "mean": 123456,
        "median": 123400,
        "stddev": 234.5,
        "min": 123000,
        "max": 124000,
        "runs": 3
      },
      "performanceScore": { /* same structure */ },
      "fcp": { /* same structure */ },
      // ... other metrics
    }
  ]
}
```

## Using the Results

### For the blog post

1. **Tables**: Copy from `metrics/final-measurements.md`
   - Tables include median ± std dev for all metrics
   - Shows statistical rigor and measurement reliability

2. **Methodology**: Reference the detailed methodology in this guide
   - See also: `METHODOLOGY.md` (blog post appendix)

3. **Key points to mention:**
   - "Results show median from 3 measurement runs"
   - "Bundle sizes: X kB ±Y kB (compressed transfer size)"
   - "Cache cleared between runs (cold-load measurement)"
   - "1x CPU throttling to isolate bundle size impact"

### For presentations

- SVG charts scale perfectly for slides
- Export to PNG if needed: Open in browser and screenshot

### For social media

- Screenshot the charts for visual impact
- Use quick-reference.md for tweet-sized insights

## Customization

### Add a new framework

1. Build the framework app
2. Add to the `FRAMEWORKS` array in:
   - `scripts/performance/measure-bundles.ts`
   - `scripts/performance/lighthouse-all.ts`
3. Assign a unique port
4. Run measurements: `npm run measure:all`

### Modify chart colors

Edit `scripts/performance/generate-bundle-chart.py`:

- Home page bars: `color_home = '#3b82f6'`
- Board page bars: `color_board = '#16a34a'`
- Bar chart gradients: `colors` array

### Change measurement settings

Edit `scripts/performance/measure-bundles.ts` or `lighthouse-all.ts`:

- Throttling: Modify Lighthouse flags
- Devices: Change `DEVICES` array
- Pages: Add to `homeUrl` and `boardUrl`

## Reproducing Results

To reproduce the exact results from the blog post:

```bash
# 1. Clone the repository
git clone https://github.com/lorenstewart/kanban-comparison
cd kanban-comparison

# 2. Install dependencies for all apps
# (run npm install in each kanban-* directory)

# 3. Build all apps
npm run build:all

# 4. Run all measurements
npm run measure:all

# 5. View results
cat metrics/bundle-summary.json
open metrics/bundle-size-comparison.svg
```

**Time estimate:**

- Bundle measurements: ~15-20 minutes
- Lighthouse audits: ~30-45 minutes (optional)
- Total: ~45-60 minutes for complete run

## Environment

**Tested on:**

- macOS 15.6 (Sequoia)
- Node.js 20.x
- Chrome 141.0.7390.78
- Python 3.11

**Should work on:**

- macOS, Linux, WSL2
- Node.js 18.x or higher
- Any recent Chrome/Chromium
- Python 3.6 or higher

## Troubleshooting

**Port conflicts:**
```bash
# If a framework won't start, kill the port manually
lsof -i :3000  # Find process on port 3000
kill -9 <PID>  # Kill the process
```

**Build not found:**
```bash
# Make sure you've built the framework first
cd kanban-nextjs
npm run build
```

**Lighthouse errors:**
- Ensure Chrome/Chromium is installed
- Update Lighthouse: `npm install -g lighthouse@latest`
- Check that no other servers are running on the same ports

**Measurement variance too high:**
- Close other applications to reduce CPU interference
- Ensure stable network connection (measurements use localhost but still affected by system load)
- Increase number of runs: `--runs 7` or `--runs 10`

## Notes

- Scripts run sequentially (one framework at a time) to avoid port conflicts
- Each framework is started, measured 5 times, and stopped before moving to the next
- Cache is cleared between runs to ensure cold-load measurements
- Bundle sizes may vary ±2-3% between runs due to timestamps in build artifacts
- Performance scores typically vary ±2-3 points between runs
- All results report median ± standard deviation from multiple runs
- Chrome/Lighthouse version is captured for reproducibility

---

## Related Documentation

- **[METHODOLOGY.md](../METHODOLOGY.md)**: Why we made these measurement choices, limitations, and how to defend them
- **[Blog Post](https://www.lorenstew.art/blog/)**: Public presentation of results
- **[Repository](https://github.com/lorenseanstewart/kanban-comparison)**: Full source code

## Questions?

For issues or questions about the measurement methodology:

- Open an issue on GitHub
- Check the script source code for implementation details
- See the main README.md for framework-specific setup
