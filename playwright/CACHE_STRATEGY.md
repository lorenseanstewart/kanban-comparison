# Cache Measurement Strategy

## Overview

The Playwright measurement tool automatically measures **both cold-load and warm-load** scenarios to provide a complete performance picture.

## Why Both Scenarios Matter

### ❄️ Cold-Load (First Visit)

**Real-world scenario**: User visits site for the first time

- Browser cache is empty
- All resources must be downloaded from network
- JavaScript/CSS must be parsed and evaluated
- **Most critical for conversion** (landing page experience)

**Measured with**:

- Separate browser context per run
- Cache cleared via Chrome DevTools Protocol
- Multiple runs for statistical accuracy

### 🔥 Warm-Load (Repeat Visit)

**Real-world scenario**: User returns to site, cache intact

- Static assets cached from previous visit
- Only changed resources re-downloaded
- Significant performance improvement possible
- **Important for engagement** (user retention experience)

**Measured with**:

- Single browser context reused across runs
- Cache preserved between navigations
- Multiple navigations in same context
- Single context close-out

## Framework Implications

Different frameworks handle caching differently:

| Framework | Cold Impact | Warm Difference      | Why                                      |
| --------- | ----------- | -------------------- | ---------------------------------------- |
| Next.js   | Varies      | Minimal JS reduction | File-based caching, some code splitting  |
| React SPA | High JS     | Very low             | Bundles entire app in JS                 |
| Astro     | Lower JS    | Better reduction     | HTML first, partial hydration            |
| Svelte    | Medium JS   | Good reduction       | Compiler-optimized output                |
| Solid     | Lower JS    | Good reduction       | Minimal runtime, fine-grained reactivity |

## Output Format

Results include `cacheMode` field for each page measurement:

```json
{
  "results": [
    {
      "framework": "Next.js",
      "page": "home",
      "cacheMode": "cold",  // First measurement
      "jsTransferred": { "median": 45000, ... },
      "lcp": { "median": 2800, ... },
      ...
    },
    {
      "framework": "Next.js",
      "page": "home",
      "cacheMode": "warm",  // Second measurement
      "jsTransferred": { "median": 0, ... },     // Cached, 0 bytes
      "lcp": { "median": 1200, ... },            // Faster
      ...
    },
    {
      "framework": "Next.js",
      "page": "board",
      "cacheMode": "cold",
      ...
    },
    {
      "framework": "Next.js",
      "page": "board",
      "cacheMode": "warm",
      ...
    }
  ]
}
```

## Analysis Pattern

### How to Compare Cache Impact

```javascript
// Pseudo-code for analysis
const cold = results.find((r) => r.page === "home" && r.cacheMode === "cold");
const warm = results.find((r) => r.page === "home" && r.cacheMode === "warm");

// Size reduction from cache
const jsReduction =
  ((cold.jsTransferred.median - warm.jsTransferred.median) /
    cold.jsTransferred.median) *
  100;

// Time improvement from cache
const lcpImprovement =
  ((cold.lcp.median - warm.lcp.median) / cold.lcp.median) * 100;

console.log(`JS Cache: ${jsReduction.toFixed(1)}% reduction`);
console.log(`LCP: ${lcpImprovement.toFixed(1)}% improvement`);
```

### Example Results

**Framework A (React SPA)**:

```
Cold:  100 kB JS, 2500ms LCP
Warm:   0 kB JS,  800ms LCP
Improvement: 100% size reduction, 68% speed improvement
```

**Framework B (Astro)**:

```
Cold:   45 kB JS, 1500ms LCP
Warm:    5 kB JS,  600ms LCP
Improvement: 89% size reduction, 60% speed improvement
```

Framework B shows:

- Smaller cold bundles (45kB vs 100kB)
- Better caching strategy (only 5kB warm vs 0kB)
- Faster initial load (1500ms vs 2500ms)

## Technical Implementation

### Cold-Load Approach

```typescript
for (let run = 1; run <= numRuns; run++) {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Clear cache for each run
  await cdpSession.send("Network.clearBrowserCache");

  // Fresh measurement
  await page.goto(url);
  const metrics = await measure(page);

  await context.close(); // New context next iteration
}
```

**Properties**:

- Each run is independent
- No cache carry-over
- Fresh TCP connections
- Consistent cold conditions

### Warm-Load Approach

```typescript
// Single context for all runs
const context = await browser.newContext();
const page = await context.newPage();

// Initial load to populate cache
await page.goto(url);

// Subsequent runs reuse cache
for (let run = 1; run <= numRuns; run++) {
  await page.goto(url); // Navigates in same context
  const metrics = await measure(page);
  // Cache persists between navigations
}

await context.close();
```

**Properties**:

- Single persistent context
- Cache accumulates
- Reused TCP connections
- Realistic repeat-visit scenario

## Measurement Timing

Total measurement time includes both cache scenarios:

```
For N runs per cache mode, M pages, network condition:

Time = (N × coldLoadTime + N × warmLoadTime) × M

Example with --runs 5, 2 pages, 4G network:
Time = (5 × 8s + 5 × 3s) × 2 = ~110 seconds (~2 minutes)

With --runs 10:
Time = (10 × 8s + 10 × 3s) × 2 = ~220 seconds (~3.5 minutes)
```

Warm-load is typically 30-70% of cold-load time:

- Network-limited frameworks: 15-30% of cold time
- CPU-limited frameworks: 40-70% of cold time

## Interpreting Results

### Healthy Cold/Warm Ratio

Good cache strategy shows:

- **JS Transfer**: ~0% in warm (cached)
- **LCP Time**: 30-70% of cold time
- **Script Eval**: Minimal in warm

### Problem Indicators

- **No cache benefit**: JS transfer not reduced
  - Check cache headers (Cache-Control)
  - Check asset naming (hash-based or static)

- **Large warm bundle**: CSS/HTML still transferred
  - Possible dynamic content
  - No static caching strategy
  - Frequent file changes

- **Slow warm LCP**: Despite cached resources
  - JavaScript execution overhead (even if cached)
  - Possible initial parse penalty
  - DOM rendering cost

## Use Cases

### During Development

```bash
npm run measure -- --url http://localhost:3000 --runs 3
```

Quick check: Is caching working? Is cold reasonable?

### Optimization Focus

```bash
npm run measure -- --url http://localhost:3000 --runs 5
```

Analyze cache impact with 4G network throttling

### Production Monitoring

```bash
npm run measure -- --url https://your-site.pages.dev --runs 10
```

Track both scenarios with 4G network throttling

## Caching Headers Impact

The tool measures what browsers actually do with cache headers:

| Header                        | Cold          | Warm                |
| ----------------------------- | ------------- | ------------------- |
| No cache headers              | Full download | Full download again |
| `Cache-Control: max-age=0`    | Full download | Full download again |
| `Cache-Control: max-age=3600` | Full download | 0 bytes (cached)    |
| ETags only                    | Full download | 304 Not Modified    |
| Both ETag + max-age           | Full download | 0 bytes (cached)    |

## Framework-Specific Observations

### Static Site Generators (Astro, 11ty)

- Often better cache performance
- HTML may not cache (or should re-validate)
- JS/CSS caches effectively
- Larger cold, smaller warm difference

### React-based (Next.js, Remix)

- File hashing for cache busting
- Code splitting affects cache
- Some shared chunks, others per-page
- Variable cold/warm differences

### Svelte/Vue/Solid

- Depends on build output
- Framework code vs app code split
- Generally good cache utilization
- Smaller bundles help both scenarios

## Recommendations

1. **Always measure both** - Cold and warm tell different stories
2. **Compare within cache mode** - Cold vs cold for framework comparison
3. **Check the ratio** - Warm/cold ratio shows cache strategy quality
4. **Network throttling** - Uses Chrome's built-in `cellular4g` for consistent 4G simulation
5. **Multiple frameworks** - Cache strategies vary significantly

## Advanced Analysis

Combine cold/warm data to derive:

- **Cache Efficiency**: (cold - warm) / cold
- **Base Cost**: warm time (framework + render overhead)
- **Network Cost**: cold time - warm time
- **Breakdown**: % improvement from caching, from faster evaluation, etc.

This gives complete framework performance picture!
