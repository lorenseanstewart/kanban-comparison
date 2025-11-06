# Playwright Measurement Tool

A new performance measurement tool has been added alongside the existing Lighthouse CLI script.

## Quick Start

```bash
cd playwright
npm install
npm run measure -- --url http://localhost:3000 --runs 5
```

Or use the TypeScript script directly:

```bash
tsx playwright/measure.ts --url http://localhost:3000 --name "My Framework" --runs 10
```

## Key Differences from Lighthouse

### What Playwright Gives You That Lighthouse Doesn't

1. **❄️🔥 Cold + Warm Cache Measurements** ⭐ NEW
   - Automatically measures **both** first-visit (cold) and repeat-visit (warm) scenarios
   - See how caching affects performance
   - Per-page results: 4 measurements (2 pages × 2 cache modes)

   ```
   ❄️ Cold-Load: Cache cleared, separate contexts per run
   🔥 Warm-Load: Cache retained, same context across runs
   ```

2. **Per-Resource Metrics** - See exactly which JS/CSS files consume how much bandwidth

   ```json
   {
     "jsFiles": [
       {
         "name": "bundle.js",
         "transferSize": 45000,
         "decodedBodySize": 120000,
         "duration": 250
       },
       {
         "name": "vendor.js",
         "transferSize": 32000,
         "decodedBodySize": 95000,
         "duration": 180
       }
     ]
   }
   ```

3. **Separate JS vs CSS Tracking**
   - Lighthouse bundles everything together
   - Playwright separately tracks CSS transfer and uncompressed sizes
   - Allows analyzing framework's JavaScript vs styling overhead

4. **Script Evaluation Time**
   - Total time spent parsing/evaluating all scripts
   - Per-framework comparison of execution costs

5. **Faster Measurements**
   - No Lighthouse audit processing overhead
   - Lower overhead for rapid iteration

### What Lighthouse Still Does Better

- Standardized performance scoring
- Accessibility compliance checking
- SEO recommendations
- Best practices validation
- Industry-standard Web Vitals alignment

## File Structure

```
playwright/
├── measure.ts              # Main measurement script
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── run-measurement.sh      # Convenience shell script
├── README.md               # Detailed usage guide
└── COMPARISON.md           # Lighthouse vs Playwright comparison
```

## Measured Metrics

### Web Vitals (Same as Lighthouse)

- FCP - First Contentful Paint
- LCP - Largest Contentful Paint
- CLS - Cumulative Layout Shift
- TTFB - Time to First Byte

### Bundle Metrics (More Granular than Lighthouse)

- JS Transferred / Uncompressed
- CSS Transferred / Uncompressed
- JS to Total Ratio (%)
- Per-file breakdowns

### Performance Metrics

- Script Evaluation Time
- Resource Count
- Statistical summaries (mean, median, stddev, min, max)

## CLI Examples

### Basic measurement

```bash
tsx playwright/measure.ts --url http://localhost:3000
```

### Multiple runs

```bash
tsx playwright/measure.ts --url http://localhost:3000 --runs 10
tsx playwright/measure.ts --url http://localhost:3000 --runs 5 --network none
```

### Production sites

```bash
tsx playwright/measure.ts --url https://kanban-nextjs.pages.dev --name "Next.js" --runs 5

tsx playwright/measure.ts --url https://kanban-solidstart.pages.dev --name "SolidStart" --runs 5
```

## Output Format

Results are saved to `metrics/{framework-name}-playwright.json` and include:

```json
{
  "metadata": {
    "frameworkName": "Next.js",
    "url": "http://localhost:3000",
    "timestamp": "2024-11-06T...",
    "runsPerPage": 5,
    "networkCondition": "4G",
    "tool": "playwright"
  },
  "results": [
    {
      "framework": "Next.js",
      "page": "home",
      "jsTransferred": {
        "mean": 45230,
        "median": 45000,
        "stddev": 150,
        "min": 44900,
        "max": 45600,
        "runs": 5
      },
      ...
    }
  ]
}
```

## Recommended Usage

### For Development/Optimization

Use Playwright for quick iteration and identifying hot spots:

```bash
npm run measure -- --url http://localhost:3000 --runs 3
```

### For Production Releases

Use both tools for complete analysis:

```bash
tsx scripts/measure-single.ts --url https://your-site.pages.dev --runs 10
tsx playwright/measure.ts --url https://your-site.pages.dev --runs 10
```

## Network Conditions

- **cellular4g** - Chrome's built-in 4G network profile (default)
- **none** - No network throttling

## Statistical Analysis

Both tools use the same outlier removal method:

- Interquartile Range (IQR) method
- Removes extreme outliers that skew results
- Keeps at least 50% of data points
- Calculates mean, median, stddev, min, max

## Next Steps

1. Install dependencies: `cd playwright && npm install`
2. Try a measurement: `npm run measure -- --url http://localhost:3000`
3. Compare results with Lighthouse: check `metrics/` folder
4. Read COMPARISON.md for detailed metric explanations
