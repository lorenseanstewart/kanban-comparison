# Overview

All frameworks implement identical functionality (a Kanban board app) with identical features, database, and UI framework (Tailwind CSS + DaisyUI). **All frameworks achieve excellent Lighthouse performance scores (100) with First Contentful Paint in the 35-71ms range, demonstrating instant initial page load.** With performance being essentially identical, this evaluation focuses primarily on **JavaScript bundle sizes**, which range from 28.8 kB to 176.3 kB compressed—a 6.1x difference that impacts mobile users through data usage, parse time, and battery drain.

## Statistical Approach

**Note**: The statistical methodology below primarily applies to **Lighthouse performance scores** (which all frameworks achieve near-perfectly at 100). Bundle sizes are stable measurements of built artifacts and show minimal variance (±1-2% from build timestamps). Since bundle size is the key differentiator in this evaluation, the statistical rigor is less critical than it would be for performance comparisons.

### Multiple Runs

- **10 measurement runs per page** (configurable with `--runs` flag)
- Cache cleared between runs using Lighthouse `--clear-storage` flag
- **Warmup requests** performed before measurements to stabilize server/database
- Results reported as: **median ± standard deviation**

### Why 10 Runs?

For Lighthouse performance scores, 10 runs provide:

- Sufficient statistical power for outlier detection
- Reliable IQR (Interquartile Range) calculation
- More stable median values
- Better confidence in reported variances

**For bundle sizes**: Multiple runs are less critical since bundle sizes are stable measurements of built files. The primary value is confirming consistency.

### Outlier Removal (IQR Method)

We use the **Interquartile Range (IQR) method** to identify and remove statistical outliers before calculating median and standard deviation:

1. Calculate Q1 (25th percentile) and Q3 (75th percentile)
2. Calculate IQR = Q3 - Q1
3. Remove values outside the range: [Q1 - 1.5×IQR, Q3 + 1.5×IQR]
4. Calculate statistics from remaining values

**Why this matters**: Lighthouse performance measurements can be affected by background processes, system interrupts, or cold-start delays. The IQR method is a standard statistical technique that identifies genuine outliers while preserving the true performance distribution. **Bundle sizes rarely have outliers** since they're measuring static build artifacts.

**Note**: Outlier removal only applies when we have ≥7 runs. With fewer runs, all values are used. Min/max values in reports show the full range before outlier removal.

### Server Warmup

Before measurements, we perform **warmup requests**:

- Each page is requested twice via curl
- 500ms delay between warmup requests
- 2-second stabilization delay after warmup
- Ensures server caches, database connections, and compilation are ready

This reduces variance from cold-start effects while still measuring cold-cache browser performance (Lighthouse clears browser cache between runs). **Note**: Server warmup stabilizes performance metrics; it doesn't affect bundle size measurements.

### Why Median?

For Lighthouse performance scores, the median is more robust to outliers than the mean. Combined with IQR outlier removal, our reported medians represent true "typical" performance without being skewed by anomalous runs. **For bundle sizes**, median vs mean makes minimal difference since variance is so low (±1-2%).

### Expected Variance

Based on our measurements with 10 runs and outlier removal:

- **Bundle sizes**: ±1-2% (primarily from build timestamps in artifacts)
- **Performance scores**: ±1-2 points (Lighthouse score variance)
- **Core Web Vitals** (FCP, LCP, etc.): ±3-5% (network and CPU scheduling variance, significantly reduced with warmup and outlier removal)

## Measurement Workflow

### Individual Test Runs

Each measurement run follows this workflow:

1. **Measure a single website** using `measure-single.ts`:
   - Accepts a production URL (e.g., `https://kanban-tanstack-solid.pages.dev`)
   - Framework name is automatically inferred from the URL
   - Runs multiple test iterations (default: 10 runs per page)
   - Saves results to `metrics/{framework-name}.json`

2. **Aggregate results** using `aggregate-measurements.ts`:
   - Reads all individual JSON reports from metrics folder
   - Generates consolidated `final-measurements.md` and `final-measurements.json`
   - Creates comparison tables across all measured frameworks

3. **Generate charts** using `generate-charts.ts`:
   - Reads `final-measurements.json`
   - Creates `bundle-size-comparison.svg` chart

**No batch testing**: Tests are run individually per website to allow:

- Incremental updates as deployments are ready
- Focused analysis of individual frameworks
- Flexibility to re-measure specific frameworks without affecting others

## What We Measure

### Primary Focus: Bundle Sizes & Web Vitals

We track three key categories:

### Bundle Size: Two Numbers That Matter

We report **both compressed and raw bundle sizes** for complete transparency:

#### Compressed Size (Network Transfer)

- **What it is**: Bytes actually downloaded over the network
- **Why it matters**: This is what affects your users' load times
- **How measured**: Chrome DevTools Protocol captures actual transfer size
- **Typical compression**: 60-75% reduction from raw size
- **Compression type**: Detected automatically (usually gzip for local servers, brotli for production CDNs)

#### Raw Size (Code Volume)

- **What it is**: Uncompressed bundle size (actual JavaScript code)
- **Why it matters**:
  - Shows framework overhead before compression
  - Affects browser parse/compile time
  - Indicates code volume and complexity
- **How measured**: `resourceSize` from Lighthouse network audit

#### Compression Ratio

We calculate and report: `(raw - compressed) / raw × 100%`

**Interpreting compression ratios:**

- **40-60%**: Less compressible code (often minified, terse patterns)
- **60-75%**: Typical compression (standard JavaScript)
- **75%+**: Highly compressible (verbose code, repetitive patterns)

**Important**: A framework with better compression (higher %) but larger compressed size still sends more bytes to users. **Compressed size is what matters most for performance.**

Example:

- Framework A: 10 kB compressed (20 kB raw, 50% compression)
- Framework B: 15 kB compressed (90 kB raw, 83% compression)
- **Winner**: Framework A (users download 5 kB less, despite worse compression ratio)

### Secondary: Performance Metrics

**Note**: All frameworks achieve similar performance scores (100) and FCP times (35-71ms), making these metrics less useful for differentiation. We report them for completeness.

- **Performance Score**: Lighthouse overall score (0-100) - All frameworks achieve 100
- **First Contentful Paint (FCP)**: Time to first content render - All frameworks: 35-71ms
- **Largest Contentful Paint (LCP)**: Time to main content render
- **Total Blocking Time (TBT)**: Main thread blocking time
- **Cumulative Layout Shift (CLS)**: Visual stability metric
- **Speed Index**: Visual completion speed

### Web Vitals Tracking

Core Web Vitals are measured and tracked for each deployment:

- **LCP (Largest Contentful Paint)**: Primary loading metric
- **FCP (First Contentful Paint)**: Initial render metric
- **CLS (Cumulative Layout Shift)**: Visual stability
- **TBT (Total Blocking Time)**: Interactivity metric

## Test Environment

### Device & Network

- **Device**: Pixel 5 emulation (mobile)
- **Network**: 4G throttling
  - Download: 10 Mbps
  - RTT: 40ms
  - Simulates realistic mobile conditions

### CPU Throttling

**Important**: We use **1x CPU** (no slowdown).

**Rationale:**

- Isolates bundle size impact from CPU performance
- Focuses on what developers control (bundle/network)
- Ensures fair comparison across frameworks with different runtime characteristics
- Reduces measurement variance

**Trade-off:**

- Results may be more optimistic than real-world mobile devices with slower CPUs
- Real mobile devices (especially mid/low-end) have slower CPUs and will show larger differences

**For readers**: If you want to see results with CPU throttling, you can modify the scripts to use `--throttling.cpuSlowdownMultiplier=4` (typical mobile CPU simulation).

### Browser

- Chrome/Chromium (headless mode)
- Lighthouse version captured for reproducibility
- Consistent version used across all measurements

## First-Load Measurements

**We measure first-load bundle sizes** (cache cleared between runs).

**Why:**

- Represents first-time visitor experience
- Worst-case scenario for bundle size impact
- More sensitive to bundle size differences
- Eliminates cache as a confounding variable

**Trade-off:**

- Real users often benefit from cached resources
- Subsequent page loads will be faster than measured
- This comparison favors frameworks with smaller initial bundles

## Limitations & Caveats

### What This Measures

✅ Initial page load bundle size (primary focus)
✅ First-load measurements (cache cleared)
✅ Framework baseline cost (JavaScript shipped to users)
✅ Lighthouse performance scores (all frameworks score 100)

### What This Doesn't Capture

❌ Code splitting effectiveness for large apps
❌ Runtime performance after initial load (all frameworks feel instant)
❌ Progressive enhancement strategies
❌ Warm-cache / repeat visit performance
❌ Different geographic CDN edge locations (tested from single location)

### Production Deployment Testing

These measurements run against production deployments on Cloudflare Pages:

**URL Structure:** `https://{folder-name}.pages.dev`

- Example: `https://kanban-tanstack-solid.pages.dev`

**Advantages:**

- Real-world CDN performance
- Actual compression (Brotli from Cloudflare)
- Geographic distribution effects included
- Tests actual production bundle delivery

**Considerations:**

- CDN latency included in measurements
- Network variance managed through multiple runs and outlier removal
- All frameworks deployed to same CDN provider for fair comparison

### Build Variance

Framework build outputs include timestamps and hashes that change between builds. This contributes to ~2-3% variance in bundle sizes. For comparisons, we use median values from multiple measurements to account for this.

## Fairness Criteria

To ensure apples-to-apples comparisons:

1. ✅ **Identical functionality**: All apps implement the same features
2. ✅ **Same database**: All use the same SQLite database with identical seed data
3. ✅ **Same UI framework**: All use Tailwind CSS + DaisyUI
4. ✅ **Production builds**: All measured with optimizations enabled
5. ✅ **Same routes**: All test the same URLs with identical data
6. ✅ **Same environment**: Same machine, no other apps running
7. ✅ **Same test conditions**: Same Lighthouse settings across all frameworks

## Interpreting Results

### Bundle Size Differences (Primary Focus)

When comparing bundle sizes, consider:

- **< 20 kB difference**: Noticeable on 3G networks (~0.15s download time difference)
- **20-50 kB difference**: Meaningful impact on mobile (0.15-0.4s download + parse time)
- **50-100 kB difference**: Significant impact (0.4-0.8s), especially on spotty networks
- **> 100 kB difference**: Major impact (1+ seconds), compounds with additional dependencies

### Performance Score Differences (Less Useful)

**Note**: All frameworks in this evaluation achieve perfect or near-perfect scores (100), making performance scores less useful for comparison. Bundle size is the meaningful differentiator.

### Statistical Significance

With 10 runs and IQR outlier removal, differences are meaningful when:

- Bundle size difference > 2× combined standard deviations
- Performance score difference > 5 points

Example: Framework A = 100 kB ±3 kB, Framework B = 120 kB ±4 kB

- Difference: 20 kB
- Combined σ: 5 kB
- 20 kB > 2×5 kB, so difference is likely real

## Reproducibility

To reproduce these measurements:

```bash
# 1. Clone repository
git clone https://github.com/lorenstewart/kanban-comparison
cd kanban-comparison

# 2. Build and deploy a framework to Cloudflare Pages
# (see individual framework READMEs for build instructions)
# Each deployment gets a URL like: https://kanban-{framework}.pages.dev

# 3. Measure a single deployment
tsx scripts/measure-single.ts --url https://kanban-tanstack-solid.pages.dev --runs 10

# 4. Repeat step 3 for each framework you want to measure
tsx scripts/measure-single.ts --url https://kanban-nextjs.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-nuxt.pages.dev --runs 10
# ... etc

# 5. Aggregate all measurements into final report
tsx scripts/aggregate-measurements.ts

# 6. Generate comparison chart
tsx scripts/generate-charts.ts

# 7. View results
cat metrics/final-measurements.md
# Individual JSON reports: metrics/{framework-name}.json
# Comparison chart: metrics/bundle-size-comparison.svg
```

**Requirements:**

- Node.js 20+
- Chrome/Chromium
- Cloudflare Pages deployments (URL format: `https://{folder-name}.pages.dev`)
- Same network conditions (or accept different absolute values)

**Expected variance:**

- Bundle sizes should be within ±5% of published values
- Performance scores should be within ±5 points of published values
- Relative rankings should be consistent

### Output Format

The measurement workflow produces these outputs:

1. **Individual JSON reports** (`metrics/{framework-name}.json`):
   - Detailed metrics for each framework
   - Includes metadata: URL, timestamp, test configuration
   - Statistical summaries: median, mean, stddev, min, max

2. **Aggregated measurements** (`metrics/final-measurements.json`):
   - Combined data from all frameworks
   - Used as source for chart generation

3. **Markdown report** (`metrics/final-measurements.md`):
   - Human-readable comparison tables
   - Bundle sizes, web vitals, framework details

4. **Comparison chart** (`metrics/bundle-size-comparison.svg`):
   - Visual comparison of compressed vs raw bundle sizes
   - Sorted by compressed size (smallest first)

## Questions & Criticisms

### "No CPU throttling makes results unrealistic"

**Response**: We're measuring bundle size impact, not CPU performance. Using 1x CPU:

- Isolates the metric we care about (bundle size)
- Reduces measurement variance
- Ensures fair comparison across frameworks with different runtime costs

You can modify the scripts to add CPU throttling if you want to measure that aspect.

### "First-load only doesn't reflect real usage"

**Response**: We're measuring worst-case (first visit) bundle sizes:

- Most sensitive to bundle size differences
- Relevant for SEO, first impressions, and bounce rates
- Warm-cache performance favors frameworks with aggressive caching, which isn't the focus here
- Bundle size differences matter on every deployment (cache busting)

### "Testing on production CDN introduces variance"

**Response**: True, but:

- Reflects real-world conditions users experience
- Multiple runs with outlier removal manages variance
- All frameworks use same CDN provider (Cloudflare Pages) for fairness
- Production testing captures actual compression (Brotli) and edge network performance

### "Sample size of 10 seems arbitrary"

**Response**: We chose 10 runs based on statistical best practices:

- Minimum 7 runs required for reliable IQR outlier detection
- 10 runs provides 40% margin above minimum for robust statistics
- Variance is low with warmup and outlier removal (±1-2% for bundle sizes)
- Can increase with `--runs N` flag if desired
- Trade-off: more runs = longer measurement time (~2 min/run × 2 pages × 9 frameworks = ~6 hours for full suite)

### "What about tree-shaking/code-splitting?"

**Response**: All frameworks use their default/recommended build configurations:

- Tree-shaking: enabled where framework supports it
- Code splitting: some frameworks split by route, others don't
- We measure what frameworks actually deliver, not theoretical minimums

This reflects the out-of-box developer experience.

## Related Documentation

**For Running Measurements**: See [\_loren/PERFORMANCE_METRICS_GUIDE.md](_loren/PERFORMANCE_METRICS_GUIDE.md) for:

- Step-by-step script execution instructions
- Which scripts to use when
- Troubleshooting common issues
- Expected output formats

**For Results**: See the [blog post](https://www.lorenstew.art/blog/) and [repository README](README.md) for the actual measurement results and analysis.

---

## Changelog

### Current Version (2024)

- **URL-based measurements**: Direct URL input instead of framework name lookup
- **Cloudflare Pages deployments**: Production testing at `https://{folder-name}.pages.dev`
- **Modular workflow**:
  - `measure-single.ts`: Measure one deployment, save JSON report
  - `aggregate-measurements.ts`: Combine reports into final documents
  - `generate-charts.ts`: Create visualization from aggregated data
- **No batch testing**: Individual measurements allow incremental updates
- **Primary metrics**: Bundle sizes (compressed + raw) and web vitals
- **Statistical rigor**: 10 runs per page, IQR outlier removal, median ± std dev
- **Server warmup**: Stabilize server/database before measurements
- **Cache clearing**: First-load measurements (cold-cache)
- **Automatic framework detection**: Infer name from URL structure
- **Comprehensive tracking**: Chrome/Lighthouse version, compression type, network conditions

### Removed in This Version

- Batch testing scripts (measure-all-lighthouse.ts, measure-final.ts)
- Framework hardcoded configurations (now URL-based)
- Localhost testing (production CDN only)

### Future Improvements

- Add warm-cache measurements
- Test with CPU throttling variants (4x, 6x)
- Measure interaction/runtime performance (though all frameworks feel instant)
- Test on actual mobile devices (not just emulation)
- Multi-page route testing beyond home and board pages
