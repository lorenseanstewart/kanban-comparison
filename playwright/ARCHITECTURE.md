# Playwright Measurement Tool - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Measurement Process                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────────┐
        │  Parse Command Line Arguments              │
        │  - URL                                     │
        │  - Framework Name                          │
        │  - Number of Runs                          │
        │  - Network Condition                       │
        └────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────────┐
        │  Launch Chromium Browser                   │
        │  - Headless mode                           │
        │  - Automation detection disabled           │
        └────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────────┐
        │  For Each Page (Home, Board)               │
        │  ┌──────────────────────────────────────┐  │
        │  │  Page 1: Warmup                      │  │
        │  │  ├─ Create new browser context      │  │
        │  │  ├─ Navigate to URL                 │  │
        │  │  └─ Wait for networkidle            │  │
        │  └──────────────────────────────────────┘  │
        │  ┌──────────────────────────────────────┐  │
        │  │  Runs 1-N: Measurement               │  │
        │  │  ├─ New context (cold-load)         │  │
        │  │  ├─ Clear cache via CDP             │  │
        │  │  ├─ Apply network throttling        │  │
        │  │  ├─ Navigate & collect metrics      │  │
        │  │  ├─ Extract resource data           │  │
        │  │  └─ Collect Web Vitals              │  │
        │  └──────────────────────────────────────┘  │
        │  ┌──────────────────────────────────────┐  │
        │  │  Analysis: Statistics                │  │
        │  │  ├─ Remove outliers (IQR)           │  │
        │  │  ├─ Calculate mean/median/stddev    │  │
        │  │  └─ Aggregate results               │  │
        │  └──────────────────────────────────────┘  │
        └────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────────┐
        │  Output Results                            │
        │  - Save to metrics/{name}-playwright.json  │
        │  - Print to stdout                         │
        └────────────────────────────────────────────┘
```

## Data Flow - Single Run

```
                        Browser Context
                             │
                    ┌────────┴────────┐
                    │                 │
            Navigate to URL    Enable CDP Session
                    │                 │
                    └────────┬────────┘
                             │
                    ┌────────▼────────────────┐
                    │  Network Throttling     │
                    │  ├─ Download speed      │
                    │  ├─ Upload speed        │
                    │  └─ Latency             │
                    └────────┬────────────────┘
                             │
                    ┌────────▼────────────────┐
                    │  Page Load              │
                    │  (waitUntil: networkidle)
                    └────────┬────────────────┘
                             │
                ┌────────────┼────────────────┐
                │            │                │
        ┌───────▼────────┐   │         ┌──────▼────────┐
        │Performance API │   │         │Document Query │
        ├──────────────┤   │         ├──────────────┤
        │Resource      │   │         │Script count  │
        │Timing        │   │         └──────────────┘
        ├──────────────┤   │
        │Paint         │   │
        │Entries       │   │
        ├──────────────┤   │
        │Largest       │   │
        │Contentful    │   │
        │Paint         │   │
        ├──────────────┤   │
        │Layout Shift  │   │
        │Events        │   │
        └───────┬──────┘   │
                └────────┬─┘
                         │
            ┌────────────▼────────────────┐
            │  Measurement Result         │
            │  ├─ JS/CSS sizes           │
            │  ├─ Web Vitals             │
            │  ├─ Script eval time       │
            │  └─ Resource count         │
            └────────────────────────────┘
```

## Class/Function Hierarchy

```
main()
├── parseArguments()
├── measureFramework()
│   ├── browser.launch()
│   ├── measurePage() [loops for each run]
│   │   ├── browser.newContext()
│   │   ├── context.newPage()
│   │   ├── warmupServer() [first run only]
│   │   ├── page.goto()
│   │   ├── collectResourceMetrics()
│   │   │   └── page.evaluate() → Performance API
│   │   ├── collectWebVitals()
│   │   │   └── page.evaluate() → Timing entries
│   │   └── collectScriptEvaluationMetrics()
│   │       └── page.evaluate() → Measure entries
│   ├── calculateStats() [for each metric]
│   │   ├── removeOutliers() → IQR algorithm
│   │   ├── mean/median/stddev calculations
│   │   └── StatisticalSummary object
│   └── browser.close()
└── output()
    ├── write to metrics/{name}.json
    └── console.log(JSON.stringify())
```

## Network Throttling Implementation

```
┌─────────────────────────────────────────────┐
│  Chrome DevTools Protocol Session           │
│  ├─ Network.emulateNetworkConditions        │
│  │  ├─ downloadThroughput (bytes/sec)      │
│  │  ├─ uploadThroughput (bytes/sec)        │
│  │  ├─ latency (ms)                        │
│  │  └─ offline (boolean)                   │
│  ├─ Network.clearBrowserCache               │
│  └─ [measurement runs]                      │
└─────────────────────────────────────────────┘

Conversion Formula (Mbps to bytes/sec):
  bytes/sec = (Mbps × 1024 × 1024) / 8

Examples:
  4G:       (10 × 1024 × 1024) / 8 = 1,310,720 bytes/sec
  3G:       (1.6 × 1024 × 1024) / 8 = 209,715 bytes/sec
  Slow 3G:  (0.4 × 1024 × 1024) / 8 = 52,429 bytes/sec
```

## Resource Classification

```
Performance Timeline Entry
         │
    ├─ initiatorType
    │   ├─ "script" → JS
    │   ├─ "link" + ".css" → CSS
    │   └─ other → Other
    │
    └─ Resource Name
        ├─ ends with ".js" → JS
        ├─ ends with ".css" → CSS
        └─ other → Other

Result:
  ┌─────────────────────┐
  │  JS Resources       │ → jsTransferred, jsUncompressed
  ├─────────────────────┤
  │  CSS Resources      │ → cssTransferred, cssUncompressed
  ├─────────────────────┤
  │  Other Resources    │ → not counted in JS/CSS totals
  └─────────────────────┘
```

## Statistical Analysis - Outlier Removal

```
Data Points: [100, 102, 101, 103, 95, 250, 104, 99, 102, 101]
                                     ↑ (outlier)

Step 1: Sort
[95, 99, 100, 101, 101, 102, 102, 103, 104, 250]

Step 2: Calculate Quartiles
Q1 (25%) = 100
Q3 (75%) = 103
IQR = 3

Step 3: Define Bounds
Lower = 100 - (1.5 × 3) = 95.5
Upper = 103 + (1.5 × 3) = 107.5

Step 4: Remove Outliers
[95*, 99, 100, 101, 101, 102, 102, 103, 104, 250*]
 ↑ at bound              ↑↑ within bounds           ↑ beyond

Step 5: Keep or Reject?
Filtered: [99, 100, 101, 101, 102, 102, 103, 104] (8 points)
If 8 ≥ 10/2: Use filtered
Else: Use original

Result: [99, 100, 101, 101, 102, 102, 103, 104]
```

## Web Vitals Collection

```
Core Web Vitals                    Data Source

FCP (First Contentful Paint)
└─ performance.getEntriesByType('paint')
   └─ Find entry with name === 'first-contentful-paint'

LCP (Largest Contentful Paint)
└─ performance.getEntriesByType('largest-contentful-paint')
   └─ Use last entry (largest one)

CLS (Cumulative Layout Shift)
└─ performance.getEntriesByType('layout-shift')
   └─ Sum all shifts excluding ones with hadRecentInput

TTFB (Time to First Byte)
└─ performance.getEntriesByType('navigation')
   └─ Use navigation.responseStart
```

## Metric Aggregation Pipeline

```
Individual Runs
    ├─ Run 1: {jsTransferred: 45100, ...}
    ├─ Run 2: {jsTransferred: 45300, ...}
    ├─ Run 3: {jsTransferred: 44900, ...}
    ├─ Run 4: {jsTransferred: 45200, ...}
    ├─ Run 5: {jsTransferred: 45000, ...}
    └─ [5 more runs]
         │
         ▼
    Extract by metric
         │
    [45100, 45300, 44900, 45200, 45000, ...]
         │
         ▼
    Remove outliers (IQR)
         │
    [45100, 45300, 44900, 45200, 45000, ...]
         │
         ▼
    Calculate statistics
         │
    ┌────────────────────────┐
    │ StatisticalSummary     │
    ├────────────────────────┤
    │ mean: 45160            │
    │ median: 45100          │
    │ stddev: 145            │
    │ min: 44900             │
    │ max: 45300             │
    │ runs: 10               │
    └────────────────────────┘
```

## Browser Context Lifecycle

```
Per-Run Flow (Cold-Load):

1. Create Context
   browser.newContext()
   └─ Isolated cookies, cache, storage

2. Create Page
   context.newPage()
   └─ Blank page with no history

3. Network Simulation
   cdpSession.send('Network.emulateNetworkConditions')
   cdpSession.send('Network.clearBrowserCache')
   └─ Apply throttling, clear cache

4. Navigate
   page.goto(url, {waitUntil: 'networkidle'})
   └─ Page load completes

5. Measure
   page.evaluate() → Performance APIs
   └─ Collect all metrics

6. Close
   context.close()
   └─ Cleanup, prepare for next run

Result: Fresh environment for each run (true cold-load)
```

## Error Handling & Recovery

```
Measurement Process
    │
    ├─ Try: Page Load
    │   ├─ Success → Measure
    │   └─ Error → Retry or Log
    │
    ├─ Try: Metric Collection
    │   ├─ Success → Aggregate
    │   └─ Error → Use 0 or fallback
    │
    └─ Finally: Cleanup
        ├─ Close context (always)
        └─ Detach CDP session (always)

Result: Partial measurements saved, process continues
```

## Output File Structure

```
metrics/
├── frameworkname-playwright.json
│   ├── metadata
│   │   ├── frameworkName
│   │   ├── url
│   │   ├── timestamp
│   │   ├── runsPerPage
│   │   ├── measurementType
│   │   ├── networkCondition
│   │   └── tool
│   │
│   └── results []
│       ├── [0] Page Result (home)
│       │   ├── framework
│       │   ├── page
│       │   ├── jsTransferred {stats}
│       │   ├── jsUncompressed {stats}
│       │   ├── cssTransferred {stats}
│       │   ├── cssUncompressed {stats}
│       │   ├── totalTransferred {stats}
│       │   ├── totalUncompressed {stats}
│       │   ├── jsToTotalRatio
│       │   ├── fcp {stats}
│       │   ├── lcp {stats}
│       │   ├── cls {stats}
│       │   ├── ttfb {stats}
│       │   ├── scriptEvalTime {stats}
│       │   ├── resourceCount {stats}
│       │   └── timestamp
│       │
│       └── [1] Page Result (board)
│           └── [same structure]
```

## Memory & Performance Profile

```
Resource Usage per Run:

Browser Instance:
├─ Chromium process: ~80-120 MB
├─ Single page context: ~20-50 MB
└─ Cold-load cache cleared

Per-Run Timeline:
├─ Launch browser: 2-3s
├─ Create context: <100ms
├─ Navigate + load: 5-15s (varies with network)
├─ Measure: <500ms
├─ Close: <500ms
└─ Total per run: 8-20s

10 Runs Timeline:
├─ Warmup: 5-10s
├─ Measurements: 80-200s (depends on network)
└─ Total: 85-210s (~1-3 minutes)
```
