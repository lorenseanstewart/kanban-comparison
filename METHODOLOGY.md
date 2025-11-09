# Methodology: Mobile Performance Testing

All frameworks implement identical functionality (a Kanban board app) with identical features, database, and UI framework (Tailwind CSS + DaisyUI). This evaluation focuses on **real-world mobile performance** using Playwright with network throttling to simulate realistic 4G and ideal 4G conditions.

## Overview

Unlike typical benchmarks that test on fast desktop connections, this evaluation measures how frameworks perform on **realistic mobile networks** where bandwidth limitations create significant performance differences. We use Playwright with Chrome DevTools Protocol to simulate mobile devices with network throttling, measuring First Contentful Paint (FCP), Time to First Byte (TTFB), and actual bytes transferred.

**Key Finding**: On realistic 4G networks (400 Kbps download speed), bundle size becomes the dominant performance factor. Frameworks with small bundles (43-58kB) achieve FCP in 736-880ms, while large bundles (171-174kB) take 2860-3296ms—a **3-4x difference** in user-perceived performance.

## Statistical Approach

### Multiple Runs & Confidence Intervals

- **50 measurement runs per page** (configurable with `--runs` flag)
- **95% confidence intervals** calculated for all metrics (mean ± 1.96 × standard error)
- Cache cleared between runs (cold cache testing)
- **Warmup requests** performed before measurements to stabilize server/database
- Results reported as: **median ± CI range**

### Why 50 Runs?

The initial methodology used 10 runs, which proved insufficient for network-based measurements:

**Problems with 10 runs:**
- High variance in FCP measurements (±50-100ms)
- Anomalous results (some frameworks appearing faster on 3G than 4G, violating physics)
- Wide confidence intervals made comparisons unreliable
- Outliers had outsized impact with small sample size

**Benefits of 50 runs:**
- Narrow confidence intervals (±1-31ms for FCP)
- Statistically significant differences clearly identifiable
- Anomalies eliminated (all frameworks now properly show 4G faster than 3G)
- Reliable measurement of network-dependent metrics
- Standard error reduced by ~2.2x (√50/√10)

**Trade-off:** Longer measurement time (~30 seconds/run × 4 scenarios × 11 frameworks × 2 networks = ~12 hours for full suite)

### Outlier Removal (IQR Method)

We use the **Interquartile Range (IQR) method** to identify and remove statistical outliers before calculating statistics:

1. Calculate Q1 (25th percentile) and Q3 (75th percentile)
2. Calculate IQR = Q3 - Q1
3. Remove values outside the range: [Q1 - 1.5×IQR, Q3 + 1.5×IQR]
4. Calculate median, mean, and standard deviation from remaining values
5. Calculate 95% confidence interval: mean ± 1.96 × (stddev / √n)

**Why this matters**: Network measurements can be affected by CDN variability, routing changes, or temporary congestion. The IQR method removes genuine outliers while preserving the true performance distribution.

**Note**: Outlier removal only applies when we have ≥7 runs. With fewer runs, all values are used.

### Server Warmup

Before measurements, we perform **warmup requests**:

- Each page is requested twice via fetch
- Ensures server caches, database connections, and compilation are ready
- Reduces variance from cold-start effects
- Measurements still use cold-cache browser performance

### Why Median + Confidence Intervals?

We report both median and 95% confidence intervals:

- **Median**: Robust to outliers, represents typical performance
- **95% CI**: Statistical reliability indicator
  - Narrow CI (±1-10ms): High confidence in measurement
  - Wide CI (±20-50ms): More variance, less reliable comparison
  - Non-overlapping CIs indicate statistically significant difference

Example:
- Framework A: 736ms ±9ms [729-747ms]
- Framework B: 880ms ±18ms [872-907ms]
- Non-overlapping intervals → statistically significant difference

## Network Throttling

### Realistic 4G (Good3G Preset)

Simulates real-world mobile 4G conditions:

- **Download**: 400 Kbps (50 KB/s)
- **Upload**: 150 Kbps
- **Latency**: 100ms RTT

**Why this matters**: This represents typical 4G speeds in areas with weak signal, congestion, or while moving. Many users experience these conditions regularly.

**Impact**: At 400 Kbps, downloading 100kB of JavaScript takes 2 seconds. Bundle size directly determines FCP.

### Ideal 4G (Regular4G Preset)

Simulates optimal 4G conditions:

- **Download**: 4 Mbps (500 KB/s)
- **Upload**: 3 Mbps
- **Latency**: 20ms RTT

**Why test both**: Shows how frameworks scale from constrained to optimal networks. Some frameworks (small bundles) perform well on both, while others (large bundles) show 5-6x improvement on faster networks.

## Test Environment

### Device Emulation

- **Device**: Pixel 5 (mobile)
- **Viewport**: 393×851px
- **User Agent**: Mobile Chrome
- **Simulates**: Mid-range Android device from 2020

### Browser & Tooling

- **Playwright**: Chromium-based browser automation
- **Chrome DevTools Protocol**: Network throttling and resource measurement
- **Headless**: false (some network features require headed mode)

### CPU Throttling

**We use 1x CPU** (no slowdown).

**Rationale:**
- Isolates network/bundle size impact from CPU performance
- Focuses on what developers control (bundle/network)
- Ensures fair comparison across frameworks with different runtime characteristics
- Reduces measurement variance

**Trade-off**: Results may be more optimistic than low-end mobile devices. Real devices will show larger differences.

## What We Measure

### Primary Metrics

#### First Contentful Paint (FCP)

- **What it is**: Time from navigation start to first content render
- **Why it matters**: Primary user-perceived performance metric
- **How measured**: Chrome DevTools Protocol Performance API
- **Range in results**: 736ms - 3296ms on realistic 4G

**Key insight**: On realistic 4G, FCP correlates strongly with bundle size (r² > 0.85).

#### Time to First Byte (TTFB)

- **What it is**: Time from navigation start to receiving first byte from server
- **Why it matters**: Indicates server/edge performance
- **How measured**: Performance API `responseStart - fetchStart`
- **Range in results**: 74ms - 421ms

**Critical finding**: TTFB becomes irrelevant on slow networks. Next.js-CF has best TTFB (74ms) but worst FCP (3296ms) on realistic 4G due to massive bundle.

#### Bundle Sizes

We measure actual bytes transferred over the network:

- **JavaScript transferred** (gzipped/brotli compressed)
- **CSS transferred** (gzipped/brotli compressed)
- **Total transferred** (all resources)
- **How measured**: Chrome DevTools Protocol `Network.requestWillBeSent` and `Network.loadingFinished` events

**Range**: 2kB (HTMX) to 192kB (Next.js) for JavaScript

### Measurement Scenarios

For each framework × network combination, we test:

1. **Home page - cold cache**: First visit to landing page
2. **Home page - warm cache**: Second visit (browser cache enabled)
3. **Board page - cold cache**: First visit to main Kanban board
4. **Board page - warm cache**: Second visit to board

**Primary focus**: Board page cold cache (worst-case scenario, most sensitive to bundle size)

## Statistical Significance

With 50 runs and 95% confidence intervals, we can definitively identify meaningful differences:

### When differences are statistically significant:

- **Confidence intervals don't overlap**: Difference is real
- **Example**: Marko (736ms ±9ms) vs Next.js (2860ms ±6ms)
  - CIs: [729-747ms] vs [2865-2876ms]
  - No overlap → difference is highly significant

### Interpreting confidence intervals:

- **±1-10ms**: Very stable measurements (small bundles, consistent networks)
- **±10-20ms**: Moderate variance (medium bundles)
- **±20-50ms**: Higher variance (large bundles, network jitter)

### Real-world significance:

Performance differences that matter to users:

- **< 100ms**: Noticeable to some users
- **100-300ms**: Clearly perceptible delay
- **300-1000ms**: Significant impact on perceived performance
- **> 1000ms (1s)**: Major impact, users may abandon

## Measurement Workflow

### Individual Test Runs

Each measurement run follows this workflow:

```bash
# Measure a framework on realistic 4G (cellular3g)
tsx playwright/measure.ts \
  --url https://kanban-marko.pages.dev \
  --name kanban-marko \
  --network cellular3g \
  --runs 50

# Output: metrics/kanban-marko-playwright_3g.json
```

This produces a JSON file with:
- FCP, TTFB, bundle sizes for each scenario (home/board × cold/warm)
- Statistical summaries: median, mean, stddev, min, max, 95% CI
- Metadata: timestamp, network conditions, Playwright version

### Aggregate & Analyze

```bash
# Extract key metrics from all JSON files
tsx scripts/extract-metrics.ts

# Output: Table sorted by 3G FCP showing:
# Framework | 3G FCP | 3G CI | 4G FCP | 4G CI | TTFB | JS | CSS | Total
```

### Test Configuration

URLs are defined in `playwright/urls.json`:

```json
{
  "kanban-marko": "https://kanban-marko.pages.dev",
  "kanban-nextjs": "https://kanban-nextjs-ochre.vercel.app",
  "kanban-solidstart": "https://kanban-solidstart.vercel.app"
}
```

## Fairness Criteria

To ensure apples-to-apples comparisons:

1. ✅ **Identical functionality**: All apps implement the same features
2. ✅ **Same database**: All use the same database with identical seed data
3. ✅ **Same UI framework**: All use Tailwind CSS + DaisyUI
4. ✅ **Production builds**: All measured with optimizations enabled
5. ✅ **Same routes**: All test the same URLs with identical data
6. ✅ **Same network conditions**: Identical throttling settings
7. ✅ **Same test environment**: Same Playwright configuration
8. ✅ **Same statistical rigor**: 50 runs, 95% CI for all frameworks

## Interpreting Results

### Bundle Size Impact on Realistic 4G

At 400 Kbps download speed:

| Bundle Size | Download Time | Example FCP | Example Frameworks |
|-------------|---------------|-------------|--------------------|
| ~43kB       | ~860ms        | 736ms       | Marko              |
| ~58kB       | ~1160ms       | 880ms       | TanStack-Solid     |
| ~80kB       | ~1600ms       | 1796ms      | QwikCity           |
| ~131kB      | ~2620ms       | 1640ms      | TanStack           |
| ~174kB      | ~3480ms       | 2860ms      | Next.js            |

**Key insight**: Download time sets a theoretical minimum for FCP. Frameworks with streaming SSR (like Marko) can paint before full download completes.

### Realistic 4G vs Ideal 4G Performance

Frameworks show different scaling characteristics:

- **Small bundles (< 60kB)**: 1.4-1.9x faster on ideal 4G
  - Already fast on realistic 4G, less room for improvement
- **Medium bundles (80-131kB)**: 2.0-3.2x faster on ideal 4G
- **Large bundles (> 170kB)**: 5.6-5.9x faster on ideal 4G
  - Massive benefit from bandwidth, but still slower than small bundles on realistic 4G

**Critical finding**: Next.js on ideal 4G (488ms) is still slower than Marko on realistic 4G (736ms). Small bundles win on all networks.

### Statistical Confidence

All reported metrics include 95% confidence intervals. Key examples:

- Marko: 736ms ±9ms → very stable
- SolidStart: 940ms ±1ms → extremely stable
- SvelteKit: 2670ms ±31ms → more variance (larger bundle)

Narrow CIs confirm measurements are reliable and differences are real, not statistical noise.

## Limitations & Caveats

### What This Measures

✅ Real mobile network performance (realistic 4G simulation)
✅ First Contentful Paint (primary user-perceived metric)
✅ Time to First Byte (server/edge performance)
✅ Actual bytes transferred (not theoretical bundle sizes)
✅ Both cold and warm cache performance
✅ Statistical significance (95% confidence intervals)

### What This Doesn't Capture

❌ Time to Interactive (when page becomes fully responsive)
❌ Actual low-end device CPU constraints
❌ Progressive enhancement / partial hydration strategies
❌ Different geographic CDN edge locations (tested from single location)
❌ 2G or 5G network conditions
❌ Real user monitoring (RUM) variability

### Production Deployment Testing

Tests run against production deployments:

**Vercel deployments**: `https://{project-name}.vercel.app`
**Cloudflare deployments**: `https://{project-name}.pages.dev`

**Advantages:**
- Real-world CDN performance
- Actual compression (Brotli from CDN)
- Tests actual production bundle delivery
- Serverless function cold-start included in TTFB

**Considerations:**
- CDN latency included in measurements
- Network variance managed through 50 runs and outlier removal
- All frameworks deployed to production platforms for fair comparison

## Reproducibility

To reproduce these measurements:

```bash
# 1. Clone repository
git clone https://github.com/lorenstewart/kanban-comparison
cd kanban-comparison

# 2. Install dependencies
npm install

# 3. Measure a framework on realistic 4G (50 runs)
tsx playwright/measure.ts \
  --url https://kanban-marko.pages.dev \
  --name kanban-marko \
  --network cellular3g \
  --runs 50

# 4. Measure same framework on ideal 4G
tsx playwright/measure.ts \
  --url https://kanban-marko.pages.dev \
  --name kanban-marko \
  --network cellular4g \
  --runs 50

# 5. Repeat for all frameworks (see playwright/urls.json)

# 6. Extract and analyze results
tsx scripts/extract-metrics.ts
```

**Requirements:**
- Node.js 20+
- Playwright (automatically installs Chromium)
- Production deployment URLs
- ~30 minutes per framework (50 runs × 4 scenarios × 30s/run)

**Expected variance:**

With 50 runs, you should see:
- FCP within ±5% of published median values
- Confidence intervals similar width to published results
- Same relative rankings

## Comparison to Previous Methodology

### Previous: Lighthouse (10 runs)

- **Focus**: Bundle size comparisons on desktop/WiFi
- **Network**: Fast WiFi or 4G (10 Mbps download)
- **Runs**: 10 per page
- **Issues**: All frameworks scored 100, FCP differences minimal (35-71ms), bundle size was only differentiator

### Current: Playwright + Network Throttling (50 runs)

- **Focus**: Real mobile performance on constrained networks
- **Network**: Realistic 4G (400 Kbps) and Ideal 4G (4 Mbps)
- **Runs**: 50 per page
- **Benefits**: Clear FCP differences (736-3296ms), statistical confidence, reveals real-world mobile impact

### Why We Changed

The original methodology couldn't differentiate frameworks on performance—all scored 100 with fast FCP. By adding realistic network constraints, we revealed the true mobile performance impact of bundle size choices.

## Questions & Criticisms

### "50 runs seems excessive"

**Response**: Our initial 10-run tests showed high variance and anomalous results (frameworks appearing faster on slower networks). Increasing to 50 runs:
- Eliminated anomalies completely
- Reduced confidence intervals by ~2.2x
- Provided statistical certainty for comparisons
- Standard practice for network-based performance testing

### "400 Kbps is too slow, nobody has 4G that slow"

**Response**: 400 Kbps (Good3G preset) represents:
- Weak signal areas (rural, basements, moving vehicles)
- Network congestion during peak hours
- Throttled mobile plans
- Many users globally experience these conditions regularly

Testing at this speed reveals performance cliffs that wouldn't appear on fast networks. It's a "stress test" that shows which frameworks remain usable on constrained networks.

### "Why not test on real devices?"

**Response**: Playwright with network throttling provides:
- Reproducible conditions (real networks vary constantly)
- Precise control over network parameters
- Faster iteration (no device setup/teardown)
- Ability to isolate network from CPU effects

Real device testing would add device CPU variability, making network effects harder to isolate.

### "Cloudflare vs Vercel deployment platforms might skew results"

**Response**: Framework deployment platform is chosen based on framework recommendations:
- Cloudflare Pages: Marko, TanStack-Solid, Next.js-CF (CF-optimized)
- Vercel: Next.js, SolidStart, Nuxt, etc. (Vercel-optimized)

Each framework is tested on its recommended platform, representing the expected production experience. TTFB differences (74-421ms) reflect platform capabilities, but FCP differences (736-3296ms) are dominated by bundle size, not platform.

### "Cold cache only doesn't reflect returning users"

**Response**: We test both cold and warm cache. Cold cache is emphasized because:
- Worst-case scenario (most sensitive to bundle size)
- Relevant for first impressions, SEO, bounce rates
- Cache busting on every deployment means returning users often face "cold" cache
- Bundle size matters on every cache-busted update

Warm cache results show all frameworks perform better, but relative rankings remain similar.

## Related Documentation

**For Performance Analysis**: See [playwright_mobile_perf_3g_updated.md](playwright_mobile_perf_3g_updated.md) for:
- Detailed performance comparison results
- Framework-by-framework analysis
- Bundle size to FCP correlation
- Optimization recommendations

**For Measurement Scripts**: See source code:
- `playwright/measure.ts`: Core measurement script
- `scripts/extract-metrics.ts`: Data extraction and analysis
- `playwright/urls.json`: Framework URL configuration

---

## Summary

This methodology prioritizes **statistical rigor** and **real-world conditions**:

- **50 runs** provide narrow confidence intervals and eliminate anomalies
- **Network throttling** reveals bundle size impact that fast networks mask
- **95% confidence intervals** ensure differences are statistically significant
- **Production deployments** test actual user experience
- **Both realistic and ideal 4G** show how frameworks scale across network conditions

The result: Clear, confident comparisons showing that on realistic mobile networks, bundle size dominates performance. Small bundles (43-58kB) deliver FCP in 736-940ms. Large bundles (171-174kB) take 2860-3296ms—a **3-4x difference** that directly impacts user experience.
