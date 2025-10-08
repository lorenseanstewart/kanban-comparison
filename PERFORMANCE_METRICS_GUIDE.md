# Performance & Bundle Measurement Guide (Canonical Recipe)

This guide standardizes how we measure bundle sizes and performance across all apps to ensure apples‑to‑apples comparisons.

## Environment

- macOS or Linux
- Node 20.x (use `nvm use 20`)
- pnpm 9.x or npm 10.x
- Chrome 128+ (for Lighthouse/INP)

## Versions & Flags

- Pin exact framework/tool versions in each app's lockfile
- Build with production flags only
- Ensure Tailwind purge is enabled and icons/assets are treeshaken

## What We Measure

- Client JS (gzipped) for: Home and Board pages
- Lighthouse Performance, FCP, LCP, INP on the Board page
- Build time and output size
- Dev server HMR latency (optional)
- Warm navigation: Board → Card details (optional)

## Throttling

- Network: "Slow 4G" (Lighthouse preset) and "Regular 4G" for a second run
- CPU: 4× slowdown (Lighthouse default)

## Commands (per app)

1) Install and build

```bash
pnpm install # or npm ci
pnpm build   # or npm run build
```

2) Start server

```bash
pnpm start &
```

3) Record bundle sizes (gzipped route assets)

Use `source-map-explorer` or `rollup-plugin-visualizer` output if available; otherwise compute gz totals for JS emitted for the route.

```bash
# Example Vite-based apps (SvelteKit/Nuxt/Qwik/SolidStart)
du -skh dist/assets/*.js

# Example Next.js (App Router)
du -skh .next/static/chunks/*.js
```

4) Lighthouse (Board page)

```bash
chrome-headless-shell \
  --disable-gpu --remote-debugging-port=9222 &

lighthouse http://localhost:3000/board/1 \
  --preset=perf \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1600 \
  --throttling.requestLatencyMs=150 \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=json --output-path=./metrics/next-board.json
```

Repeat for each app; adjust host/port.

## Automation

Run the helper script to build all apps, collect sizes, and run Lighthouse once per app.

```bash
node scripts/measure-all.mjs
```

This script should output a single `metrics/summary.json` with:

```json
{
  "framework": "sveltekit",
  "homepage_gz_kb": 24,
  "board_gz_kb": 40,
  "lighthouse": { "perf": 99, "fcp_ms": 7, "lcp_ms": 6, "inp_ms": 28 },
  "build_time_s": 7.3
}
```

## Bundle Composition

For composition breakdowns (framework/runtime vs libs vs app), enable:

- Vite apps: `rollup-plugin-visualizer`
- Next.js: `ANALYZE=true next build` and `next-bundle-analyzer`

Export static HTML reports to `metrics/bundles/` for all apps.

## Data Integrity

- Use the seeded SQLite DB and confirm identical item counts on Board page
- Clear caches between builds
- Record commit SHA and lockfile hash per run

## Output Locations

- `metrics/summary.json` (aggregate)
- `metrics/lh/*.json` (per-run Lighthouse)
- `metrics/bundles/*` (composition reports)

## Notes

- If Analog is not ready, exclude it from aggregate charts but keep its data separate when available.

## 5‑minute reproduce

For a fast end-to-end run on all ready apps:

```bash
git clone https://github.com/<you>/kanban-comparison
cd kanban-comparison
pnpm i --filter ./kanban-* --parallel
node scripts/measure-all.mjs
cat metrics/summary.json | jq
```

This will build each app, measure route bundles, run Lighthouse on the Board page with standardized throttling/CPU, and emit aggregate JSON plus bundle composition reports.
# Performance Metrics Collection Guide

This document contains step-by-step instructions for collecting bundle size and performance metrics for all kanban apps in this repository.

## Prerequisites

```bash
npm install -g @lhci/cli
```

## Apps and Ports

- **kanban-nextjs**: http://localhost:3000
- **kanban-nextjs-compiler**: http://localhost:3001
- **kanban-solidstart**: http://localhost:3002
- **kanban-nuxt**: http://localhost:3003
- **kanban-qwikcity**: http://localhost:3004
- **kanban-sveltekit**: http://localhost:3005

## Step 1: Collect Bundle Sizes

### Next.js (both apps)

```bash
# kanban-nextjs
cd kanban-nextjs
npm run build
# Note the "First Load JS" sizes from output

# kanban-nextjs-compiler
cd ../kanban-nextjs-compiler
npm run build
# Note the "First Load JS" sizes from output
```

**For detailed bundle analysis:**
```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts (both apps):
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  // ... existing config
});

# Run analysis
ANALYZE=true npm run build
```

### Nuxt

```bash
cd kanban-nuxt
npx nuxi analyze
# This opens an interactive treemap in browser
# Record total client bundle size and largest chunks
```

### SolidStart

```bash
cd kanban-solidstart
npm run build
# Check .output/public/_build/ directory
ls -lh .output/public/_build/
# Record total size of JS files
```

### Qwik

```bash
cd kanban-qwikcity
npm run build
# Build output shows bundle stats
# Record total size and note Qwik's granular chunking
```

### SvelteKit

```bash
cd kanban-sveltekit
npm run build
# Check .svelte-kit/output/client/_app/immutable/
ls -lh .svelte-kit/output/client/_app/immutable/chunks/
# Record total bundle size
```

## Step 2: Lighthouse Performance Metrics

Create `.lighthouserc.js` in project root:

```javascript
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 10,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Note**: `numberOfRuns: 10` means Lighthouse will run each URL 10 times and automatically calculate the median values for all metrics. This provides more statistically significant results.

### Run Lighthouse for Each App

**Next.js:**
```bash
cd kanban-nextjs
npm run build
npm run start &
SERVER_PID=$!
sleep 5
lhci collect --url=http://localhost:3000 --url=http://localhost:3000/board/board-1
lhci assert
kill $SERVER_PID
cd ..
```

**Next.js Compiler:**
```bash
cd kanban-nextjs-compiler
npm run build
PORT=3001 npm run start &
SERVER_PID=$!
sleep 5
lhci collect --url=http://localhost:3001 --url=http://localhost:3001/board/board-1
lhci assert
kill $SERVER_PID
cd ..
```

**SolidStart:**
```bash
cd kanban-solidstart
npm run build
PORT=3002 npm run start &
SERVER_PID=$!
sleep 5
lhci collect --url=http://localhost:3002 --url=http://localhost:3002/board/board-1
lhci assert
kill $SERVER_PID
cd ..
```

**Nuxt:**
```bash
cd kanban-nuxt
npm run build
PORT=3003 node .output/server/index.mjs &
SERVER_PID=$!
sleep 5
lhci collect --url=http://localhost:3003 --url=http://localhost:3003/board/board-1
lhci assert
kill $SERVER_PID
cd ..
```

**Qwik:**
```bash
cd kanban-qwikcity
npm run build
npm run serve &
SERVER_PID=$!
sleep 5
lhci collect --url=http://localhost:3004 --url=http://localhost:3004/board/board-1
lhci assert
kill $SERVER_PID
cd ..
```

**SvelteKit:**
```bash
cd kanban-sveltekit
npm run build
PORT=3005 node build &
SERVER_PID=$!
sleep 5
lhci collect --url=http://localhost:3005 --url=http://localhost:3005/board/board-1
lhci assert
kill $SERVER_PID
cd ..
```

## Step 3: Extract Metrics from Lighthouse Reports

Lighthouse reports are saved in `.lighthouseci/` directory. Extract these metrics:

**Performance Metrics:**
- Performance Score (0-100)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Speed Index
- Time to Interactive (TTI)

**Bundle Metrics:**
- Total JavaScript size
- Total CSS size
- Initial page load size

### Automated Metrics Extraction Script

Lighthouse CI automatically calculates median values across the 10 runs. Use this script to extract averaged metrics for each app:

Create `extract-metrics.sh` in project root:

```bash
#!/bin/bash

# Extract median metrics from Lighthouse CI JSON reports
extract_app_metrics() {
  local app=$1
  local port=$2

  echo "Extracting metrics for $app..."

  cd "$app/.lighthouseci" 2>/dev/null || {
    echo "No Lighthouse reports found for $app"
    return
  }

  # Get the manifest file which contains median values
  if [ -f "manifest.json" ]; then
    # Extract median run file
    MEDIAN_FILE=$(cat manifest.json | jq -r '.[0].median.url' | sed 's/.*\///')

    if [ -f "$MEDIAN_FILE" ]; then
      echo "=== $app Metrics (Median of 10 runs) ==="
      echo "Performance Score: $(cat "$MEDIAN_FILE" | jq '.categories.performance.score * 100')"
      echo "FCP (ms): $(cat "$MEDIAN_FILE" | jq '.audits["first-contentful-paint"].numericValue')"
      echo "LCP (ms): $(cat "$MEDIAN_FILE" | jq '.audits["largest-contentful-paint"].numericValue')"
      echo "TBT (ms): $(cat "$MEDIAN_FILE" | jq '.audits["total-blocking-time"].numericValue')"
      echo "CLS: $(cat "$MEDIAN_FILE" | jq '.audits["cumulative-layout-shift"].numericValue')"
      echo "Speed Index: $(cat "$MEDIAN_FILE" | jq '.audits["speed-index"].numericValue')"
      echo "TTI (ms): $(cat "$MEDIAN_FILE" | jq '.audits["interactive"].numericValue')"
      echo "Total JS (bytes): $(cat "$MEDIAN_FILE" | jq '.audits["total-byte-weight"].details.items[] | select(.resourceType == "script") | .transferSize' | awk '{s+=$1} END {print s}')"
      echo "Total CSS (bytes): $(cat "$MEDIAN_FILE" | jq '.audits["total-byte-weight"].details.items[] | select(.resourceType == "stylesheet") | .transferSize' | awk '{s+=$1} END {print s}')"
      echo ""
    fi
  fi

  cd ../..
}

# Extract for all apps
extract_app_metrics "kanban-nextjs" "3000"
extract_app_metrics "kanban-nextjs-compiler" "3001"
extract_app_metrics "kanban-solidstart" "3002"
extract_app_metrics "kanban-nuxt" "3003"
extract_app_metrics "kanban-qwikcity" "3004"
extract_app_metrics "kanban-sveltekit" "3005"
```

Run: `chmod +x extract-metrics.sh && ./extract-metrics.sh`

**Note**: The script uses Lighthouse CI's built-in median calculation from the 10 runs. This is more reliable than manually averaging, as Lighthouse CI uses the median to reduce the impact of outliers.

## Step 4: Compile Results

Create a comparison table with these columns:

| Metric | Next.js | Next.js Compiler | SolidStart | Nuxt | Qwik | SvelteKit |
|--------|---------|------------------|------------|------|------|-----------|
| **Bundle Sizes** |
| Initial JS (KB) | | | | | | |
| Total JS (KB) | | | | | | |
| CSS (KB) | | | | | | |
| **Performance (Home)** |
| Performance Score | | | | | | |
| FCP (ms) | | | | | | |
| LCP (ms) | | | | | | |
| TBT (ms) | | | | | | |
| CLS | | | | | | |
| Speed Index | | | | | | |
| TTI (ms) | | | | | | |
| **Performance (Board Detail)** |
| Performance Score | | | | | | |
| FCP (ms) | | | | | | |
| LCP (ms) | | | | | | |
| TBT (ms) | | | | | | |
| CLS | | | | | | |
| Speed Index | | | | | | |
| TTI (ms) | | | | | | |

## Notes

- Run all tests on the same machine with no other apps running
- Clear browser cache between tests
- Use production builds only
- Lighthouse CI runs each URL 10 times and automatically calculates median values
- The median is used instead of mean to reduce the impact of outliers
- Consider running tests in both desktop and mobile modes
- TTFB (Time to First Byte) may vary based on local server startup
- Each complete test run (all 6 apps, 10 iterations each) will take approximately 30-45 minutes

## Quick Automated Script

For a faster automated collection, create `collect-metrics.sh`:

```bash
#!/bin/bash

APPS=("kanban-nextjs:3000" "kanban-nextjs-compiler:3001" "kanban-solidstart:3002" "kanban-nuxt:3003" "kanban-qwikcity:3004" "kanban-sveltekit:3005")

for app_port in "${APPS[@]}"; do
  IFS=':' read -r app port <<< "$app_port"
  echo "Testing $app on port $port..."

  cd "$app"
  npm run build

  if [ "$app" = "kanban-nuxt" ]; then
    PORT=$port node .output/server/index.mjs &
  else
    PORT=$port npm run start &
  fi

  SERVER_PID=$!
  sleep 10

  lhci collect --url="http://localhost:$port" --url="http://localhost:$port/board/board-1"

  kill $SERVER_PID
  cd ..

  echo "$app complete"
done
```

Then run: `chmod +x collect-metrics.sh && ./collect-metrics.sh`
