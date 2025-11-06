# Playwright Tool: Cold-Load + Warm-Load Measurement

## Summary of New Capability

The Playwright measurement tool now automatically measures **both cache scenarios**:

- **❄️ Cold-Load**: Browser cache cleared (first-visit experience)
- **🔥 Warm-Load**: Browser cache retained (repeat-visit experience)

This gives you a **complete performance picture** - no need to run measurements twice!

## What Changed

### Modified Core Logic

✅ **`AggregatedPageStats` interface** - Added `cacheMode: 'cold' | 'warm'`

✅ **`measurePage()` function** - Added `clearCache` parameter
```typescript
async function measurePage(
  page: Page,
  url: string,
  runNumber: number,
  totalRuns: number,
  networkCondition: NetworkCondition,
  clearCache: boolean = true  // NEW
): Promise<PageMeasurement>
```

✅ **`measureFramework()` function** - Dual measurement loop
```typescript
for (const cacheMode of [{ mode: 'cold', clearCache: true }, 
                         { mode: 'warm', clearCache: false }]) {
  // Measure with/without cache
}
```

### Results Output

Results now include 4 entries per framework (instead of 2):
```
1. Home page - Cold-Load ❄️
2. Home page - Warm-Load 🔥
3. Board page - Cold-Load ❄️
4. Board page - Warm-Load 🔥
```

## Key Features

### ❄️ Cold-Load Implementation
```typescript
for (let i = 1; i <= numRuns; i++) {
  const context = await browser.newContext(); // Fresh context
  const page = await context.newPage();
  
  const measurement = await measurePage(page, url, i, numRuns, 
                                        networkCondition, 
                                        true); // clearCache = true
  await context.close(); // Dispose after each run
}
```

**Characteristics**:
- New browser context per run
- Cache cleared via CDP
- Most realistic first-visit scenario
- Higher load times

### 🔥 Warm-Load Implementation
```typescript
const context = await browser.newContext(); // Single context
const page = await context.newPage();

await warmupPage(page, pageInfo.url); // Initial load

for (let i = 1; i <= numRuns; i++) {
  const measurement = await measurePage(page, pageInfo.url, i, numRuns, 
                                        networkCondition, 
                                        false); // clearCache = false
  // Cache persists, context reused
}
await context.close();
```

**Characteristics**:
- Single persistent context
- Cache preserved across runs
- Realistic repeat-visit scenario
- Faster load times

## Usage

Command remains the same - caching is automatic:

```bash
tsx measure.ts --url http://localhost:3000 --runs 5
```

This now automatically:
1. Runs 5 cold-load measurements
2. Runs 5 warm-load measurements
3. Provides statistics for both
4. Compares across network conditions

### Time Estimate

With `--runs N`:
```
Total page loads = N (cold) + N (warm) × 2 pages

--runs 3:  ~15 minutes
--runs 5:  ~25 minutes
--runs 10: ~50 minutes
```

## Output Format

Each result now includes:

```json
{
  "results": [
    {
      "framework": "Next.js",
      "page": "home",
      "cacheMode": "cold",
      "jsTransferred": { "median": 45000, "mean": 45230, ... },
      "jsUncompressed": { "median": 125000, ... },
      "cssTransferred": { "median": 12000, ... },
      "lcp": { "median": 2800, ... },
      "scriptEvalTime": { "median": 1200, ... },
      ...
    },
    {
      "framework": "Next.js",
      "page": "home",
      "cacheMode": "warm",
      "jsTransferred": { "median": 0, ... },      // Cached!
      "cssTransferred": { "median": 0, ... },     // Cached!
      "lcp": { "median": 1100, ... },             // Faster
      "scriptEvalTime": { "median": 50, ... },    // Less parsing
      ...
    }
  ]
}
```

## Analysis Examples

### Calculate Cache Impact

```javascript
function analyzeCache(framework, page) {
  const results = loadResults(`metrics/${framework}-playwright.json`);
  const cold = results.find(r => r.page === page && r.cacheMode === 'cold');
  const warm = results.find(r => r.page === page && r.cacheMode === 'warm');
  
  return {
    jsReduction: (cold.jsTransferred.median / 
                 (cold.jsTransferred.median + cold.cssTransferred.median) * 100),
    lcpImprovement: ((cold.lcp.median - warm.lcp.median) / 
                     cold.lcp.median * 100),
    timeToWarmup: cold.lcp.median - warm.lcp.median
  };
}
```

### Compare Frameworks

```javascript
// Which framework handles caching best?
const frameworks = ['nextjs', 'nuxt', 'sveltekit', 'astro'];

frameworks.forEach(fw => {
  const result = analyzeCache(fw, 'home');
  console.log(`${fw}: ${result.lcpImprovement.toFixed(1)}% LCP improvement`);
});
```

## Documentation Added

1. **CACHE_STRATEGY.md** - Deep dive into cache measurement strategy
   - Why both scenarios matter
   - Framework-specific implications
   - How to interpret results
   - Advanced analysis patterns

2. **Updated README.md**
   - Explains cold/warm scenarios
   - Shows cache mode in output
   - Timing estimates

3. **Updated COMPARISON.md**
   - Shows Playwright has dual cache measurement
   - Lighthouse only has cold-load

4. **Updated EXAMPLES.md**
   - Explains cache modes upfront
   - Time estimates included
   - Analysis examples

5. **Updated PLAYWRIGHT_SETUP.md**
   - Highlights cache measurement as key feature
   - Shows output format

## File Changes

### measure.ts (~440 lines)
- ✅ Type updates for cache mode
- ✅ Function signature updates
- ✅ Dual measurement loop
- ✅ Different context handling per cache mode

### Documentation
- ✅ 5 files updated with cache information
- ✅ CACHE_STRATEGY.md (260+ lines)
- ✅ ARCHITECTURE.md (340+ lines)
- ✅ API_REFERENCE.md (330+ lines)
- ✅ README.md, COMPARISON.md, EXAMPLES.md updated

## Quick Reference

### When to Use This Tool

✅ **Measure first-visit performance** (cold-load)
✅ **Measure repeat-visit performance** (warm-load)
✅ **Compare cache strategies** between frameworks
✅ **See caching impact** on LCP, bundle transfer
✅ **Analyze JS/CSS** overhead separately
✅ **Test multiple network conditions**

### Getting Started

```bash
cd playwright
npm install
npm run measure -- --url http://localhost:3000 --runs 3
```

Results in: `metrics/localhost-playwright.json`

### Key Insights You'll Get

- **Cold-Load Metrics**: What new users experience
- **Warm-Load Metrics**: What returning users experience
- **Cache Delta**: How much caching improves things
- **Framework Comparison**: Which handles caching best
- **Network Impact**: How caching scales to slow networks

## Next Steps

1. Install: `cd playwright && npm install`
2. Test: `npm run measure -- --url http://localhost:3000 --runs 3`
3. Analyze: Check `metrics/localhost-playwright.json`
4. Compare: Run on all your frameworks
5. Optimize: Use cache deltas to identify optimization opportunities

## Technical Details

See CACHE_STRATEGY.md for:
- Deep technical implementation
- How cold/warm measurement differs
- Framework-specific cache implications
- Analysis patterns
- Performance implications

See ARCHITECTURE.md for:
- System architecture diagrams
- Data flow visualization
- Function hierarchy
- Network throttling implementation
- Browser lifecycle management

## Summary

You now have:

✅ **Dual-mode measurements** - Cold and warm automatically
✅ **Complete cache analysis** - See caching impact
✅ **Framework comparison** - Which caches best
✅ **Per-resource breakdown** - JS/CSS separated
✅ **Statistical rigor** - Multiple runs, outlier removal
✅ **Production ready** - Same methodology as Lighthouse

**Total measurement per framework: 2 pages × 2 cache modes × N runs = 4N page loads**

Perfect for comprehensive framework performance analysis! 🎯

