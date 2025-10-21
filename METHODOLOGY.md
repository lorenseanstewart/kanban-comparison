# Performance Measurement Methodology

**Audience**: Blog readers, external researchers, and anyone wanting to understand or critique our measurement approach.

**Purpose**: This document explains and defends our methodology choices, addresses potential criticisms, and provides high-level reproducibility instructions. For operational details on running the measurement scripts, see [_loren/PERFORMANCE_METRICS_GUIDE.md](_loren/PERFORMANCE_METRICS_GUIDE.md).

## Overview

All frameworks implement identical functionality (a Kanban board app) with identical features, database, and UI framework (Tailwind CSS + DaisyUI). Measurements focus on JavaScript bundle sizes and performance metrics using Chrome Lighthouse.

## Statistical Approach

### Multiple Runs

- **5 measurement runs per page** (configurable)
- Cache cleared between runs using Lighthouse `--clear-storage` flag
- Results reported as: **median ± standard deviation**

### Why Median?

The median is more robust to outliers than the mean. In performance measurement, occasional system interrupts or background processes can create outliers. The median better represents "typical" performance.

### Expected Variance

Based on our measurements:
- **Bundle sizes**: ±2-3% (primarily from build timestamps in artifacts)
- **Performance scores**: ±2-3 points (Lighthouse score variance)
- **Core Web Vitals** (FCP, LCP, etc.): ±5-10% (network and CPU scheduling variance)

## What We Measure

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

### Performance Metrics

- **Performance Score**: Lighthouse overall score (0-100)
- **First Contentful Paint (FCP)**: Time to first content render
- **Largest Contentful Paint (LCP)**: Time to main content render
- **Total Blocking Time (TBT)**: Main thread blocking time
- **Cumulative Layout Shift (CLS)**: Visual stability metric
- **Speed Index**: Visual completion speed

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

## Cold vs Warm Load

**We measure cold-load performance** (cache cleared between runs).

**Why:**
- Represents first-time visitor experience
- Worst-case scenario for performance
- More sensitive to bundle size differences
- Eliminates cache as a confounding variable

**Trade-off:**
- Real users often benefit from cached resources
- Subsequent page loads will be faster than measured
- This comparison favors frameworks with better initial load performance

## Limitations & Caveats

### What This Measures

✅ Initial page load bundle size
✅ Cold-cache performance
✅ Bundle size impact on loading performance
✅ Framework baseline cost

### What This Doesn't Capture

❌ Code splitting effectiveness for large apps
❌ Runtime performance after initial load
❌ Real-world CDN latency (localhost measurement)
❌ Progressive enhancement strategies
❌ Warm-cache / repeat visit performance

### Localhost vs Production

These measurements run against `localhost` servers:

**Advantages:**
- Eliminates network variance
- Fair comparison across frameworks
- Reproducible results

**Disadvantages:**
- No CDN latency
- No geographic distribution effects
- Popular frameworks may benefit from better CDN availability in production

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

### Bundle Size Differences

When comparing bundle sizes, consider:

- **< 20 kB difference**: Likely not perceptible to users on 4G+
- **20-50 kB difference**: Noticeable on slower connections (3G)
- **> 50 kB difference**: Significant impact on initial load, especially mobile

### Performance Score Differences

Lighthouse scores are weighted composites:

- **< 5 points**: Within measurement noise
- **5-10 points**: Potentially meaningful but verify with specific metrics
- **> 10 points**: Significant difference, investigate specific metrics (FCP, LCP, etc.)

### Statistical Significance

With 3 runs, differences are meaningful when:

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

# 2. Build all frameworks
# (see individual framework READMEs)

# 3. Run measurements
tsx scripts/measure-final.ts --runs 3

# 4. View results
cat metrics/final-measurements.md
```

**Requirements:**
- Node.js 20+
- Chrome/Chromium
- Same network conditions (or accept different absolute values)

**Expected variance:**
- Bundle sizes should be within ±5% of published values
- Performance scores should be within ±5 points of published values
- Relative rankings should be consistent

## Questions & Criticisms

### "No CPU throttling makes results unrealistic"

**Response**: We're measuring bundle size impact, not CPU performance. Using 1x CPU:
- Isolates the metric we care about (bundle size)
- Reduces measurement variance
- Ensures fair comparison across frameworks with different runtime costs

You can modify the scripts to add CPU throttling if you want to measure that aspect.

### "Cold-cache only doesn't reflect real usage"

**Response**: We're measuring worst-case (first visit) performance:
- Most sensitive to bundle size differences
- Relevant for SEO, first impressions, and bounce rates
- Warm-cache performance favors frameworks with aggressive caching, which isn't the focus here

### "Localhost doesn't reflect production"

**Response**: True, but:
- Eliminates network variance for reproducible measurements
- Fair comparison (no framework benefits from better CDN distribution)
- Focus is on bundle size, which is framework-controlled

In production with CDN, all frameworks would be faster, but relative differences would be similar.

### "Sample size of 5 is too small"

**Response**: With automated measurements in controlled environment:
- Variance is low (±2-3% for bundle sizes)
- 5 runs sufficient to identify median and outliers
- Can increase with `--runs N` flag if desired
- Trade-off: more runs = longer measurement time (2-3 min/run × frameworks)

### "What about tree-shaking/code-splitting?"

**Response**: All frameworks use their default/recommended build configurations:
- Tree-shaking: enabled where framework supports it
- Code splitting: some frameworks split by route, others don't
- We measure what frameworks actually deliver, not theoretical minimums

This reflects the out-of-box developer experience.

## Related Documentation

**For Running Measurements**: See [_loren/PERFORMANCE_METRICS_GUIDE.md](_loren/PERFORMANCE_METRICS_GUIDE.md) for:
- Step-by-step script execution instructions
- Which scripts to use when
- Troubleshooting common issues
- Expected output formats

**For Results**: See the [blog post](https://www.lorenstew.art/blog/) and [repository README](README.md) for the actual measurement results and analysis.

---

## Changelog

### Current Version
- Multiple runs with statistical measures (median ± std dev)
- 5 runs per page default for better confidence
- Cache clearing between runs (cold-load)
- Chrome/Lighthouse version tracking
- Compression type detection
- Raw + compressed bundle sizes tracked

### Future Improvements
- Add warm-cache measurements
- Test with CPU throttling variants
- Measure interaction/runtime performance
- Test on actual mobile devices (not just emulation)
