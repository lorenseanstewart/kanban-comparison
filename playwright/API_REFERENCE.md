# Playwright Measurement Script - API Reference

## Type Definitions

### ResourceMetrics

```typescript
interface ResourceMetrics {
  name: string; // URL of the resource
  type: "script" | "stylesheet" | "other";
  transferSize: number; // Size after transfer (compressed)
  decodedBodySize: number; // Original size before compression
  duration: number; // Time to fetch resource
  decodedSize: number; // Decoded body size
}
```

### WebVitals

```typescript
interface WebVitals {
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  cls: number; // Cumulative Layout Shift (unitless, 0-1 scale)
  ttfb: number; // Time to First Byte (ms)
}
```

### ScriptEvaluationMetrics

```typescript
interface ScriptEvaluationMetrics {
  totalScriptEvalTime: number; // Total JS eval time (ms)
  scriptCount: number; // Number of script resources
  averageScriptEvalTime: number; // Average per script (ms)
}
```

### PageMeasurement

```typescript
interface PageMeasurement {
  jsTransferred: number; // Compressed JS total (bytes)
  jsUncompressed: number; // Uncompressed JS total (bytes)
  cssTransferred: number; // Compressed CSS total (bytes)
  cssUncompressed: number; // Uncompressed CSS total (bytes)
  totalTransferred: number; // JS + CSS transferred (bytes)
  totalUncompressed: number; // JS + CSS uncompressed (bytes)
  jsFiles: ResourceMetrics[]; // Individual JS file data
  cssFiles: ResourceMetrics[]; // Individual CSS file data
  webVitals: WebVitals; // Web Vitals metrics
  scriptEvaluation: ScriptEvaluationMetrics;
  resourceCount: number; // Total resources loaded
  timestamp: string; // ISO timestamp of measurement
}
```

### StatisticalSummary

```typescript
interface StatisticalSummary {
  mean: number; // Average value
  median: number; // Middle value (50th percentile)
  stddev: number; // Standard deviation
  min: number; // Minimum observed value
  max: number; // Maximum observed value
  runs: number; // Number of data points (after outlier removal)
}
```

### AggregatedPageStats

```typescript
interface AggregatedPageStats {
  framework: string; // Framework name
  page: "home" | "board"; // Page identifier
  jsTransferred: StatisticalSummary;
  jsUncompressed: StatisticalSummary;
  cssTransferred: StatisticalSummary;
  cssUncompressed: StatisticalSummary;
  totalTransferred: StatisticalSummary;
  totalUncompressed: StatisticalSummary;
  jsToTotalRatio: number; // Percentage 0-100
  fcp: StatisticalSummary;
  lcp: StatisticalSummary;
  cls: StatisticalSummary;
  ttfb: StatisticalSummary;
  scriptEvalTime: StatisticalSummary;
  resourceCount: StatisticalSummary;
  timestamp: string; // ISO timestamp
}
```

## Function Reference

### Core Functions

#### `measurePage(page, url, runNumber, totalRuns, networkCondition): Promise<PageMeasurement>`

Measures a single page load with the given network conditions.

**Parameters:**

- `page` - Playwright Page object
- `url` - Full URL to measure
- `runNumber` - Current run number (for logging)
- `totalRuns` - Total number of runs (for logging)
- `networkCondition` - One of: '4g', '3g', 'slow-3g'

**Returns:** PageMeasurement object

**Network Throttling Applied:**

- Clears browser cache
- Applies download/upload throttling via CDP
- Applies latency via CDP
- Waits for networkidle before collecting metrics

#### `measureFramework(frameworkName, baseUrl, numRuns, networkCondition): Promise<AggregatedPageStats[]>`

Runs complete measurement suite for a framework across home and board pages.

**Parameters:**

- `frameworkName` - Name for output and logging
- `baseUrl` - Base URL (e.g., http://localhost:3000)
- `numRuns` - Number of runs per page
- `networkCondition` - One of: '4g', '3g', 'slow-3g'

**Returns:** Array of AggregatedPageStats (one per page)

**Process:**

1. Launches Chromium browser
2. For each page (home, board):
   - Warms up the page
   - Runs N measurements with fresh context each time
   - Collects resource, web vitals, and script metrics
   - Calculates statistics
   - Removes outliers using IQR method
3. Closes browser

#### `collectWebVitals(page): Promise<WebVitals>`

Collects Core Web Vitals from current page.

**Data Source:** Browser Performance API

- FCP: `performance.getEntriesByType('paint')`
- LCP: `performance.getEntriesByType('largest-contentful-paint')`
- CLS: `performance.getEntriesByType('layout-shift')`
- TTFB: `navigation.responseStart`

#### `collectResourceMetrics(page): Promise<{...}>`

Collects bundle sizes and resource details.

**Data Source:** `performance.getEntriesByType('resource')`

**Categorizes Resources:**

- Scripts: `.js` files or `initiatorType === 'script'`
- Stylesheets: `.css` files or `initiatorType === 'link'`

**Returns:** Aggregated JS/CSS sizes and per-file breakdowns

#### `collectScriptEvaluationMetrics(page): Promise<ScriptEvaluationMetrics>`

Measures JavaScript parsing and evaluation time.

**Data Source:**

- `performance.getEntriesByType('measure')` for timing entries
- Document query for script tag count

#### `removeOutliers(values): number[]`

Removes statistical outliers using Interquartile Range (IQR) method.

**Algorithm:**

- Requires minimum 7 values for outlier removal
- Calculates Q1 (25th percentile) and Q3 (75th percentile)
- IQR = Q3 - Q1
- Removes values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR]
- Returns original values if filtering removes >50% of data

#### `calculateStats(values): StatisticalSummary`

Calculates statistical summary for integer metrics (sizes, durations).

**Process:**

1. Remove outliers
2. Calculate mean, median, stddev
3. Round to integers
4. Include min/max from original data

#### `calculateStatsFloat(values): StatisticalSummary`

Calculates statistical summary for floating-point metrics (CLS).

**Precision:** 3 decimal places

## Network Conditions

```typescript
{
  '4g': {
    name: '4G',
    downloadSpeed: 10 Mbps,
    uploadSpeed: 1 Mbps,
    latency: 40ms
  },
  '3g': {
    name: 'Regular 3G',
    downloadSpeed: 1.6 Mbps,
    uploadSpeed: 0.75 Mbps,
    latency: 150ms
  },
  'slow-3g': {
    name: 'Slow 3G',
    downloadSpeed: 0.4 Mbps,
    uploadSpeed: 0.4 Mbps,
    latency: 400ms
  }
}
```

## Output Files

### Metrics File: `metrics/{framework-name}-playwright.json`

```json
{
  "metadata": {
    "frameworkName": "string",
    "url": "string",
    "timestamp": "ISO8601 string",
    "runsPerPage": number,
    "measurementType": "playwright-cold-load",
    "networkCondition": "string",
    "tool": "playwright"
  },
  "results": [AggregatedPageStats, AggregatedPageStats]
}
```

## Statistics Calculation Details

### Mean

Standard arithmetic mean: Σ(values) / n

### Median

- Even count: Average of two middle values
- Odd count: Middle value

### Standard Deviation

Square root of variance (sample variance using n as denominator)

### Min/Max

From original values (before outlier removal) to show full range

### Outlier Removal

Applied before all calculations to reduce variance from anomalies

## Browser Configuration

### Chromium Launch Options

```typescript
{
  headless: true,
  args: ['--disable-blink-features=AutomationControlled']
}
```

The `AutomationControlled` flag disables helps avoid detection by anti-bot systems.

### Network Emulation

- Via Chrome DevTools Protocol (CDP)
- Applied per browser context
- Includes both bandwidth and latency
- Browser cache cleared per run

## Performance Considerations

### Cold-Load Measurements

- New browser context for each run
- Browser cache cleared via CDP
- Higher memory usage (~100MB per concurrent measurement)
- More realistic of first-visit experience

### Warmup

- First run includes page warmup
- Establishes database connections
- Warms any caches
- Reduces variance in subsequent runs

### Timing

- Typical page: 5-15 seconds per run
- With 10 runs: 50-150 seconds per framework
- Network throttling extends times accordingly

## Debugging

Enable verbose output by modifying the script:

```typescript
console.error(JSON.stringify(measurement, null, 2));
```

Check stderr for measurement progress:

- Run numbers and network conditions
- Load times per page
- Statistical summaries after completion

Monitor stdout for JSON results (redirect to file for processing).
