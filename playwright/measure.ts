#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from "playwright";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface ResourceMetrics {
  name: string;
  type: "script" | "stylesheet" | "other";
  transferSize: number;
  decodedBodySize: number;
  duration: number;
  decodedSize: number;
}

interface WebVitals {
  fcp: number;
  lcp: number;
  cls: number;
  ttfb: number;
}

interface ScriptEvaluationMetrics {
  totalScriptEvalTime: number;
  scriptCount: number;
  averageScriptEvalTime: number;
}

interface ParseCompileMetrics {
  jsParseTime: number;
  jsCompileTime: number;
  jsExecutionTime: number;
  cssParseTime: number;
  styleRecalcTime: number;
  totalParseCompileTime: number;
}

interface PageMeasurement {
  jsTransferred: number;
  jsUncompressed: number;
  cssTransferred: number;
  cssUncompressed: number;
  totalTransferred: number;
  totalUncompressed: number;
  jsFiles: ResourceMetrics[];
  cssFiles: ResourceMetrics[];
  webVitals: WebVitals;
  scriptEvaluation: ScriptEvaluationMetrics;
  parseCompile: ParseCompileMetrics;
  resourceCount: number;
  timestamp: string;
}

interface StatisticalSummary {
  mean: number;
  median: number;
  stddev: number;
  min: number;
  max: number;
  runs: number;
  ci95Lower: number; // 95% confidence interval lower bound
  ci95Upper: number; // 95% confidence interval upper bound
}

interface AggregatedPageStats {
  framework: string;
  page: "home" | "board";
  cacheMode: "cold" | "warm";
  jsTransferred: StatisticalSummary;
  jsUncompressed: StatisticalSummary;
  cssTransferred: StatisticalSummary;
  cssUncompressed: StatisticalSummary;
  totalTransferred: StatisticalSummary;
  totalUncompressed: StatisticalSummary;
  jsToTotalRatio: number;
  fcp: StatisticalSummary;
  lcp: StatisticalSummary;
  cls: StatisticalSummary;
  ttfb: StatisticalSummary;
  scriptEvalTime: StatisticalSummary;
  jsParseTime: StatisticalSummary;
  jsCompileTime: StatisticalSummary;
  jsExecutionTime: StatisticalSummary;
  cssParseTime: StatisticalSummary;
  styleRecalcTime: StatisticalSummary;
  totalParseCompileTime: StatisticalSummary;
  resourceCount: StatisticalSummary;
  timestamp: string;
}

// Using Chrome DevTools Protocol connection types
type ConnectionType = "cellular2g" | "cellular3g" | "cellular4g" | "none";

const CONNECTION_TYPE_NAMES: Record<ConnectionType, string> = {
  cellular2g: "2G",
  cellular3g: "3G",
  cellular4g: "4G",
  none: "No Throttling",
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function removeOutliers(values: number[]): number[] {
  if (values.length < 7) {
    return values;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const filtered = values.filter((v) => v >= lowerBound && v <= upperBound);

  return filtered.length >= values.length / 2 ? filtered : values;
}

function calculateStats(values: number[]): StatisticalSummary {
  const cleanedValues = removeOutliers(values);

  const sorted = [...cleanedValues].sort((a, b) => a - b);
  const mean =
    cleanedValues.reduce((sum, val) => sum + val, 0) / cleanedValues.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  const variance =
    cleanedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    cleanedValues.length;
  const stddev = Math.sqrt(variance);

  // Calculate 95% confidence interval (mean ± 1.96 * standard error)
  const standardError = stddev / Math.sqrt(cleanedValues.length);
  const marginOfError = 1.96 * standardError;
  const ci95Lower = mean - marginOfError;
  const ci95Upper = mean + marginOfError;

  return {
    mean: Math.round(mean),
    median: Math.round(median),
    stddev: Math.round(stddev * 10) / 10,
    min: Math.min(...values),
    max: Math.max(...values),
    runs: values.length,
    ci95Lower: Math.round(ci95Lower),
    ci95Upper: Math.round(ci95Upper),
  };
}

function calculateStatsFloat(values: number[]): StatisticalSummary {
  const cleanedValues = removeOutliers(values);

  const sorted = [...cleanedValues].sort((a, b) => a - b);
  const mean =
    cleanedValues.reduce((sum, val) => sum + val, 0) / cleanedValues.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  const variance =
    cleanedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    cleanedValues.length;
  const stddev = Math.sqrt(variance);

  // Calculate 95% confidence interval (mean ± 1.96 * standard error)
  const standardError = stddev / Math.sqrt(cleanedValues.length);
  const marginOfError = 1.96 * standardError;
  const ci95Lower = mean - marginOfError;
  const ci95Upper = mean + marginOfError;

  return {
    mean: Math.round(mean * 1000) / 1000,
    median: Math.round(median * 1000) / 1000,
    stddev: Math.round(stddev * 1000) / 1000,
    min: Math.round(Math.min(...values) * 1000) / 1000,
    max: Math.round(Math.max(...values) * 1000) / 1000,
    runs: values.length,
    ci95Lower: Math.round(ci95Lower * 1000) / 1000,
    ci95Upper: Math.round(ci95Upper * 1000) / 1000,
  };
}

async function collectWebVitals(page: Page): Promise<WebVitals> {
  const vitals = await page.evaluate(() => {
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType("paint");

    const fcp =
      paintEntries.find((entry) => entry.name === "first-contentful-paint")
        ?.startTime || 0;

    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const lcp =
      lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;

    const clsValue =
      (performance as any)
        .getEntriesByType?.("layout-shift")
        ?.reduce((sum: number, entry: any) => {
          return sum + (entry.hadRecentInput ? 0 : entry.value);
        }, 0) || 0;

    const ttfb = nav?.responseStart ? nav.responseStart : 0;

    return {
      fcp: Math.round(fcp),
      lcp: Math.round(lcp),
      cls: Math.round(clsValue * 1000) / 1000,
      ttfb: Math.round(ttfb),
    };
  });

  return vitals;
}

async function collectResourceMetrics(page: Page): Promise<{
  jsTransferred: number;
  jsUncompressed: number;
  cssTransferred: number;
  cssUncompressed: number;
  jsFiles: ResourceMetrics[];
  cssFiles: ResourceMetrics[];
  resourceCount: number;
}> {
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];

    return entries.map((entry) => {
      let type: "script" | "stylesheet" | "other" = "other";
      if (entry.initiatorType === "script") type = "script";
      if (entry.initiatorType === "link" && entry.name.includes(".css"))
        type = "stylesheet";
      if (entry.name.includes(".js")) type = "script";
      if (entry.name.includes(".css")) type = "stylesheet";

      return {
        name: entry.name,
        type,
        transferSize: entry.transferSize || 0,
        decodedBodySize: entry.decodedBodySize || 0,
        duration: entry.duration || 0,
        decodedSize: entry.decodedBodySize || 0,
      };
    });
  });

  let jsTransferred = 0;
  let jsUncompressed = 0;
  let cssTransferred = 0;
  let cssUncompressed = 0;
  const jsFiles: ResourceMetrics[] = [];
  const cssFiles: ResourceMetrics[] = [];

  for (const resource of resources) {
    if (resource.type === "script") {
      jsTransferred += resource.transferSize;
      jsUncompressed += resource.decodedBodySize;
      jsFiles.push(resource);
    } else if (resource.type === "stylesheet") {
      cssTransferred += resource.transferSize;
      cssUncompressed += resource.decodedBodySize;
      cssFiles.push(resource);
    }
  }

  return {
    jsTransferred,
    jsUncompressed,
    cssTransferred,
    cssUncompressed,
    jsFiles,
    cssFiles,
    resourceCount: resources.length,
  };
}

async function collectScriptEvaluationMetrics(
  page: Page
): Promise<ScriptEvaluationMetrics> {
  const metrics = await page.evaluate(() => {
    const bootupEntries =
      (performance as any)
        .getEntriesByType?.("measure")
        ?.filter((entry: any) => entry.name.includes("script")) || [];

    const scriptEvalTime = bootupEntries.reduce(
      (sum: number, entry: any) => sum + entry.duration,
      0
    );

    const scriptTags = document.querySelectorAll("script[src]");

    return {
      totalScriptEvalTime: Math.round(scriptEvalTime),
      scriptCount: scriptTags.length,
      averageScriptEvalTime:
        scriptTags.length > 0
          ? Math.round(scriptEvalTime / scriptTags.length)
          : 0,
    };
  });

  return metrics;
}

async function collectParseCompileMetrics(
  page: Page
): Promise<ParseCompileMetrics> {
  const cdpSession = await page.context().newCDPSession(page);

  // Collect performance timeline events
  const performanceMetrics = await page.evaluate(() => {
    const perfEntries = performance.getEntriesByType('measure') as any[];
    const resourceEntries = performance.getEntriesByType('resource') as any[];

    let jsParseTime = 0;
    let jsCompileTime = 0;
    let jsExecutionTime = 0;
    let cssParseTime = 0;
    let styleRecalcTime = 0;

    // Try to extract timing from PerformanceObserver data if available
    // This is a best-effort approach using available browser APIs
    perfEntries.forEach((entry: any) => {
      const name = entry.name.toLowerCase();
      const duration = entry.duration || 0;

      if (name.includes('parse') && name.includes('script')) {
        jsParseTime += duration;
      } else if (name.includes('compile') && name.includes('script')) {
        jsCompileTime += duration;
      } else if (name.includes('evaluate') || name.includes('execute')) {
        jsExecutionTime += duration;
      } else if (name.includes('parse') && name.includes('css')) {
        cssParseTime += duration;
      } else if (name.includes('style') || name.includes('recalc')) {
        styleRecalcTime += duration;
      }
    });

    return {
      jsParseTime: Math.round(jsParseTime),
      jsCompileTime: Math.round(jsCompileTime),
      jsExecutionTime: Math.round(jsExecutionTime),
      cssParseTime: Math.round(cssParseTime),
      styleRecalcTime: Math.round(styleRecalcTime),
    };
  });

  await cdpSession.detach();

  const totalParseCompileTime =
    performanceMetrics.jsParseTime +
    performanceMetrics.jsCompileTime +
    performanceMetrics.jsExecutionTime +
    performanceMetrics.cssParseTime +
    performanceMetrics.styleRecalcTime;

  return {
    ...performanceMetrics,
    totalParseCompileTime: Math.round(totalParseCompileTime),
  };
}

async function measurePage(
  page: Page,
  url: string,
  runNumber: number,
  totalRuns: number,
  connectionType: ConnectionType,
  clearCache: boolean = true
): Promise<PageMeasurement> {
  console.error(`      Run ${runNumber}/${totalRuns}...`);

  const cdpSession = await page.context().newCDPSession(page);

  // Use Chrome's built-in connection type presets with proper values
  // Good3G preset: ~400 Kbps download (realistic congested 4G)
  // Regular4G preset: ~4 Mbps download (ideal 4G)
  const networkConditions: Record<ConnectionType, { latency: number; downloadThroughput: number; uploadThroughput: number }> = {
    cellular2g: { latency: 300, downloadThroughput: (250 * 1024) / 8, uploadThroughput: (50 * 1024) / 8 },
    cellular3g: { latency: 100, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (150 * 1024) / 8 }, // Good3G preset
    cellular4g: { latency: 20, downloadThroughput: (4 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 }, // Regular4G preset
    none: { latency: 0, downloadThroughput: -1, uploadThroughput: -1 },
  };

  const conditions = networkConditions[connectionType];
  await cdpSession.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: conditions.latency,
    downloadThroughput: conditions.downloadThroughput,
    uploadThroughput: conditions.uploadThroughput,
  });

  // CPU throttling: 4x slowdown simulates mid-to-high-end mobile device
  await cdpSession.send("Emulation.setCPUThrottlingRate", {
    rate: 4,
  });

  if (clearCache) {
    await cdpSession.send("Network.clearBrowserCache");
  }

  await page.goto(url, { waitUntil: "networkidle" });

  const webVitals = await collectWebVitals(page);
  const resources = await collectResourceMetrics(page);
  const scriptMetrics = await collectScriptEvaluationMetrics(page);
  const parseCompileMetrics = await collectParseCompileMetrics(page);

  await cdpSession.detach();

  return {
    jsTransferred: resources.jsTransferred,
    jsUncompressed: resources.jsUncompressed,
    cssTransferred: resources.cssTransferred,
    cssUncompressed: resources.cssUncompressed,
    totalTransferred: resources.jsTransferred + resources.cssTransferred,
    totalUncompressed: resources.jsUncompressed + resources.cssUncompressed,
    jsFiles: resources.jsFiles,
    cssFiles: resources.cssFiles,
    webVitals,
    scriptEvaluation: scriptMetrics,
    parseCompile: parseCompileMetrics,
    resourceCount: resources.resourceCount,
    timestamp: new Date().toISOString(),
  };
}

async function warmupPage(page: Page, url: string): Promise<void> {
  console.error(`   Warming up...`);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await sleep(1000);
  } catch (error) {
    console.error(`   ⚠️  Warmup request failed`);
  }
}

async function measureFramework(
  frameworkName: string,
  baseUrl: string,
  numRuns: number,
  connectionType: ConnectionType
): Promise<AggregatedPageStats[]> {
  console.error(
    `\n📦 Measuring ${frameworkName} (${numRuns} runs per page, cold + warm)...`
  );
  console.error(`   🌐 URL: ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  // Mobile device emulation (Pixel 5)
  // Simulates mid-to-high-end phones: Pixel 5-7, iPhone 12-14, Galaxy S21-S22
  const mobileDevice = {
    viewport: {
      width: 393,
      height: 851,
    },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  };

  const allResults: AggregatedPageStats[] = [];

  try {
    const pages: Array<{ name: "home" | "board"; url: string }> = [
      { name: "home", url: `${baseUrl}/` },
      {
        name: "board",
        url: `${baseUrl}/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c`,
      },
    ];

    for (const pageInfo of pages) {
      console.error(`   Measuring ${pageInfo.name} page...`);

      const cacheModes: Array<{ mode: "cold" | "warm"; clearCache: boolean }> =
        [
          { mode: "cold", clearCache: true },
          { mode: "warm", clearCache: false },
        ];

      for (const cacheMode of cacheModes) {
        console.error(`     🔹 ${cacheMode.mode}-load (${numRuns} runs)...`);

        const runs: PageMeasurement[] = [];

        if (cacheMode.mode === "warm") {
          const context = await browser.newContext(mobileDevice);
          const page = await context.newPage();

          try {
            await warmupPage(page, pageInfo.url);

            for (let i = 1; i <= numRuns; i++) {
              const measurement = await measurePage(
                page,
                pageInfo.url,
                i,
                numRuns,
                connectionType,
                false
              );
              runs.push(measurement);
              await sleep(1000);
            }
          } finally {
            await context.close();
          }
        } else {
          for (let i = 1; i <= numRuns; i++) {
            const context = await browser.newContext(mobileDevice);
            const page = await context.newPage();

            try {
              if (i === 1) {
                await warmupPage(page, pageInfo.url);
              }

              const measurement = await measurePage(
                page,
                pageInfo.url,
                i,
                numRuns,
                connectionType,
                true
              );
              runs.push(measurement);

              await sleep(1000);
            } finally {
              await context.close();
            }
          }
        }

        const jsTransferredStats = calculateStats(
          runs.map((r) => r.jsTransferred)
        );
        const jsUncompressedStats = calculateStats(
          runs.map((r) => r.jsUncompressed)
        );
        const cssTransferredStats = calculateStats(
          runs.map((r) => r.cssTransferred)
        );
        const cssUncompressedStats = calculateStats(
          runs.map((r) => r.cssUncompressed)
        );
        const totalTransferredStats = calculateStats(
          runs.map((r) => r.totalTransferred)
        );
        const totalUncompressedStats = calculateStats(
          runs.map((r) => r.totalUncompressed)
        );
        const fcpStats = calculateStats(runs.map((r) => r.webVitals.fcp));
        const lcpStats = calculateStats(runs.map((r) => r.webVitals.lcp));
        const clsStats = calculateStatsFloat(runs.map((r) => r.webVitals.cls));
        const ttfbStats = calculateStats(runs.map((r) => r.webVitals.ttfb));
        const scriptEvalStats = calculateStats(
          runs.map((r) => r.scriptEvaluation.totalScriptEvalTime)
        );
        const jsParseStats = calculateStats(
          runs.map((r) => r.parseCompile.jsParseTime)
        );
        const jsCompileStats = calculateStats(
          runs.map((r) => r.parseCompile.jsCompileTime)
        );
        const jsExecutionStats = calculateStats(
          runs.map((r) => r.parseCompile.jsExecutionTime)
        );
        const cssParseStats = calculateStats(
          runs.map((r) => r.parseCompile.cssParseTime)
        );
        const styleRecalcStats = calculateStats(
          runs.map((r) => r.parseCompile.styleRecalcTime)
        );
        const totalParseCompileStats = calculateStats(
          runs.map((r) => r.parseCompile.totalParseCompileTime)
        );
        const resourceCountStats = calculateStats(
          runs.map((r) => r.resourceCount)
        );

        const jsRatio =
          totalTransferredStats.median > 0
            ? Math.round(
                (jsTransferredStats.median / totalTransferredStats.median) * 100
              )
            : 0;

        const cacheLabel = cacheMode.mode === "cold" ? "❄️ " : "🔥 ";
        console.error(
          `     ${cacheLabel}${pageInfo.name} (${cacheMode.mode}): JS ${(jsTransferredStats.median / 1024).toFixed(1)}kB | CSS ${(cssTransferredStats.median / 1024).toFixed(1)}kB | Total ${(totalTransferredStats.median / 1024).toFixed(1)}kB | LCP ${lcpStats.median}ms`
        );

        allResults.push({
          framework: frameworkName,
          page: pageInfo.name,
          cacheMode: cacheMode.mode,
          jsTransferred: jsTransferredStats,
          jsUncompressed: jsUncompressedStats,
          cssTransferred: cssTransferredStats,
          cssUncompressed: cssUncompressedStats,
          totalTransferred: totalTransferredStats,
          totalUncompressed: totalUncompressedStats,
          jsToTotalRatio: jsRatio,
          fcp: fcpStats,
          lcp: lcpStats,
          cls: clsStats,
          ttfb: ttfbStats,
          scriptEvalTime: scriptEvalStats,
          jsParseTime: jsParseStats,
          jsCompileTime: jsCompileStats,
          jsExecutionTime: jsExecutionStats,
          cssParseTime: cssParseStats,
          styleRecalcTime: styleRecalcStats,
          totalParseCompileTime: totalParseCompileStats,
          resourceCount: resourceCountStats,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } finally {
    await browser.close();
  }

  return allResults;
}

async function main() {
  const args = process.argv.slice(2);
  let url: string | undefined;
  let frameworkName: string | undefined;
  let numRuns = 50; // Increased from 10 to 50 for better statistical reliability
  let connectionType: ConnectionType = "cellular4g";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && i + 1 < args.length) {
      url = args[i + 1];
      i++;
    } else if (args[i] === "--name" && i + 1 < args.length) {
      frameworkName = args[i + 1];
      i++;
    } else if (args[i] === "--runs" && i + 1 < args.length) {
      numRuns = parseInt(args[i + 1], 10);
      if (isNaN(numRuns) || numRuns < 1) {
        console.error("❌ Error: --runs must be a positive number");
        process.exit(1);
      }
      i++;
    } else if (args[i] === "--network" && i + 1 < args.length) {
      const network = args[i + 1] as ConnectionType;
      if (!CONNECTION_TYPE_NAMES[network]) {
        console.error(`❌ Error: Invalid connection type "${network}"`);
        console.error("Available types: cellular2g, cellular3g, cellular4g, none");
        process.exit(1);
      }
      connectionType = network;
      i++;
    }
  }

  if (!url) {
    console.error("❌ Error: URL required");
    console.error(
      "\nUsage: tsx playwright/measure.ts --url <url> [--name <framework-name>] [--runs N] [--network CONDITION]"
    );
    console.error("\nExamples:");
    console.error(
      "  tsx playwright/measure.ts --url https://kanban-nextjs.pages.dev --runs 5"
    );
    console.error(
      '  tsx playwright/measure.ts --url http://localhost:3000 --name "Next.js" --runs 10'
    );
    console.error("\nOptions:");
    console.error("  --url URL             URL to measure (required)");
    console.error(
      "  --name NAME           Framework name (inferred from URL if not provided)"
    );
    console.error(
      "  --runs N              Number of measurement runs per page (default: 50)"
    );
    console.error(
      "  --network TYPE        Connection type: cellular2g, cellular3g, cellular4g, none (default: cellular4g)"
    );
    process.exit(1);
  }

  if (!frameworkName) {
    try {
      const urlObj = new URL(url);
      frameworkName = urlObj.hostname.replace(".pages.dev", "");
    } catch {
      frameworkName = "unknown";
    }
  }

  const connectionName = CONNECTION_TYPE_NAMES[connectionType];
  console.error(`\n🔍 Measurement Configuration`);
  console.error(`   Framework: ${frameworkName}`);
  console.error(`   URL: ${url}`);
  console.error(`   Runs per page: ${numRuns}`);
  console.error(`   Network: ${connectionName}`);
  console.error(`   Device: Pixel 5 (mobile emulation)`);
  console.error(`   CPU: 4x slowdown (Pixel 5-7, iPhone 12-14, Galaxy S21-S22)`);

  try {
    const results = await measureFramework(
      frameworkName,
      url,
      numRuns,
      connectionType
    );

    const metricsDir = join(process.cwd(), "metrics");
    if (!existsSync(metricsDir)) {
      mkdirSync(metricsDir, { recursive: true });
    }

    // Add connection type suffix to filename (e.g., _3g, _4g)
    const connectionSuffix = connectionType === "none"
      ? ""
      : `_${connectionType.replace("cellular", "")}`;
    const reportPath = join(metricsDir, `${frameworkName}-playwright${connectionSuffix}.json`);
    const reportData = {
      metadata: {
        frameworkName,
        url,
        timestamp: new Date().toISOString(),
        runsPerPage: numRuns,
        measurementType: "playwright-cold-warm",
        connectionType: connectionName,
        tool: "playwright",
      },
      results,
    };

    writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.error(`\n✅ Report saved to: ${reportPath}`);

    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error(`\n❌ Failed to measure ${frameworkName}:`, error);
    process.exit(1);
  }
}

main().catch(console.error);
