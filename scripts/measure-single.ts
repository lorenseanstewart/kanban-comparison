#!/usr/bin/env tsx

/**
 * Single Framework Bundle Measurement Script
 *
 * Measures JS bundle sizes for a single framework's home and board pages.
 * Runs multiple measurements and calculates statistics for reliability.
 * Outputs results in JSON format for easy parsing.
 *
 * Usage: tsx scripts/measure-single.ts <framework-name> [--runs N]
 * Example: tsx scripts/measure-single.ts "Next.js" --runs 3
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PageBundleStats {
  framework: string;
  page: 'home' | 'board';
  jsTransferred: number;
  jsUncompressed: number;
  totalRequests: number;
  performanceScore: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
  si: number;
  scriptEvaluation: number;
  mainThreadWork: number;
  timestamp: string;
  compressionType?: string;
}

interface StatisticalSummary {
  mean: number;
  median: number;
  stddev: number;
  min: number;
  max: number;
  runs: number;
}

interface AggregatedStats {
  framework: string;
  page: 'home' | 'board';
  jsTransferred: StatisticalSummary;
  jsUncompressed: StatisticalSummary;
  compressionRatio: number; // Percentage saved by compression
  performanceScore: StatisticalSummary;
  fcp: StatisticalSummary;
  lcp: StatisticalSummary;
  tbt: StatisticalSummary;
  cls: StatisticalSummary;
  si: StatisticalSummary;
  scriptEvaluation: StatisticalSummary;
  mainThreadWork: StatisticalSummary;
  compressionType: string;
  chromeVersion: string;
  networkCondition: string;
  cpuThrottling: string;
  measurementTimestamp: string;
}

// Network throttling configurations
const NETWORK_CONDITIONS = {
  '4g': {
    name: '4G',
    downloadThroughput: 10 * 1024 * 1024 / 8, // 10 Mbps in bytes/sec
    uploadThroughput: 1 * 1024 * 1024 / 8,
    rttMs: 40
  },
  '3g': {
    name: 'Regular 3G',
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps in bytes/sec
    uploadThroughput: 0.75 * 1024 * 1024 / 8,
    rttMs: 150
  },
  'slow-3g': {
    name: 'Slow 3G',
    downloadThroughput: 0.4 * 1024 * 1024 / 8, // 0.4 Mbps in bytes/sec
    uploadThroughput: 0.4 * 1024 * 1024 / 8,
    rttMs: 400
  }
} as const;

type NetworkCondition = keyof typeof NETWORK_CONDITIONS;

// CPU throttling configurations
const CPU_THROTTLING = {
  '1x': {
    name: 'No throttling',
    multiplier: 1
  },
  '4x': {
    name: '4x slowdown (mid-tier mobile)',
    multiplier: 4
  },
  '6x': {
    name: '6x slowdown (low-end mobile)',
    multiplier: 6
  }
} as const;

type CpuThrottling = keyof typeof CPU_THROTTLING;

const FRAMEWORKS = [
  { name: 'Next.js', dir: 'kanban-nextjs', port: 3000, startCmd: 'npm run start', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Next.js + Compiler', dir: 'kanban-nextjs-compiler', port: 3001, startCmd: 'npm run start', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Nuxt', dir: 'kanban-nuxt', port: 3002, startCmd: 'npm run preview', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Analog', dir: 'kanban-analog', port: 3003, startCmd: 'node dist/analog/server/index.mjs', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'SolidStart', dir: 'kanban-solidstart', port: 3004, startCmd: 'npm run start', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'SvelteKit', dir: 'kanban-sveltekit', port: 3005, startCmd: 'npm run preview', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Qwik', dir: 'kanban-qwikcity', port: 3006, startCmd: 'npm run preview', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Astro', dir: 'kanban-htmx', port: 3007, startCmd: 'npm run preview', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'TanStack Start', dir: 'kanban-tanstack', port: 3008, startCmd: 'npm run start', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'TanStack Start + Solid', dir: 'kanban-tanstack-solid', port: 3010, startCmd: 'npm run start', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Marko', dir: 'kanban-marko', port: 3009, startCmd: 'npm run start', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
];

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getChromeVersion(): string {
  try {
    const output = execSync('npx lighthouse --version', { encoding: 'utf-8' });
    return output.trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Remove outliers using IQR (Interquartile Range) method
 * Values outside Q1 - 1.5×IQR and Q3 + 1.5×IQR are considered outliers
 * Returns filtered values with outliers removed, or original if too few values
 */
function removeOutliers(values: number[]): number[] {
  if (values.length < 7) {
    // Need at least 7 values for reliable IQR calculation
    // With fewer values, don't remove outliers
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

  const filtered = values.filter(v => v >= lowerBound && v <= upperBound);

  // Only use filtered values if we still have at least half the original data
  return filtered.length >= values.length / 2 ? filtered : values;
}

function calculateStats(values: number[]): StatisticalSummary {
  // Remove outliers before calculating statistics
  const cleanedValues = removeOutliers(values);

  const sorted = [...cleanedValues].sort((a, b) => a - b);
  const mean = cleanedValues.reduce((sum, val) => sum + val, 0) / cleanedValues.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const variance = cleanedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / cleanedValues.length;
  const stddev = Math.sqrt(variance);

  return {
    mean: Math.round(mean),
    median: Math.round(median),
    stddev: Math.round(stddev * 10) / 10,
    min: Math.min(...values), // Use original values for min/max to show full range
    max: Math.max(...values),
    runs: values.length
  };
}

function calculateStatsFloat(values: number[]): StatisticalSummary {
  // Remove outliers before calculating statistics
  const cleanedValues = removeOutliers(values);

  const sorted = [...cleanedValues].sort((a, b) => a - b);
  const mean = cleanedValues.reduce((sum, val) => sum + val, 0) / cleanedValues.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const variance = cleanedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / cleanedValues.length;
  const stddev = Math.sqrt(variance);

  return {
    mean: Math.round(mean * 1000) / 1000,
    median: Math.round(median * 1000) / 1000,
    stddev: Math.round(stddev * 1000) / 1000,
    min: Math.round(Math.min(...values) * 1000) / 1000, // Use original values for min/max to show full range
    max: Math.round(Math.max(...values) * 1000) / 1000,
    runs: values.length
  };
}

function isPortInUse(port: number): boolean {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function killPort(port: number): void {
  try {
    execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
    console.error(`   Killed process on port ${port}`);
  } catch {
    // Port wasn't in use
  }
}

async function startServer(framework: typeof FRAMEWORKS[0]): Promise<() => void> {
  const projectRoot = join(process.cwd(), framework.dir);

  // Kill any existing process on this port
  killPort(framework.port);

  console.error(`   Starting ${framework.name} on port ${framework.port}...`);

  // Start server in background with PORT env var
  execSync(`PORT=${framework.port} ${framework.startCmd} &`, {
    cwd: projectRoot,
    stdio: 'ignore',
    shell: '/bin/bash'
  });

  // Wait for server to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    if (isPortInUse(framework.port)) {
      ready = true;
      break;
    }
  }

  if (!ready) {
    throw new Error(`Server failed to start on port ${framework.port}`);
  }

  console.error(`   ✅ Server ready at http://localhost:${framework.port}`);

  // Return cleanup function
  return () => killPort(framework.port);
}

/**
 * Perform warmup requests to stabilize server/database performance
 * This helps reduce variance by ensuring caches are warm and database
 * connections are established before actual measurements
 */
async function warmupServer(urls: string[]): Promise<void> {
  console.error(`   Warming up server (${urls.length} requests)...`);

  for (const url of urls) {
    try {
      execSync(`curl -s -o /dev/null "${url}"`, {
        stdio: 'ignore',
        timeout: 10000
      });
    } catch (error) {
      console.error(`   ⚠️  Warmup request failed for ${url}`);
    }
    await sleep(500); // Small delay between warmup requests
  }

  // Additional delay to let server fully stabilize
  await sleep(2000);
  console.error(`   ✅ Warmup complete`);
}

async function measurePageBundle(url: string, runNumber: number, totalRuns: number, networkCondition: NetworkCondition, cpuThrottling: CpuThrottling): Promise<{
  jsTransferred: number;
  jsUncompressed: number;
  totalRequests: number;
  performanceScore: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
  si: number;
  scriptEvaluation: number;
  mainThreadWork: number;
  compressionType: string;
}> {
  console.error(`      Run ${runNumber}/${totalRuns}...`);

  const throttling = NETWORK_CONDITIONS[networkCondition];
  const cpu = CPU_THROTTLING[cpuThrottling];
  const cmd = `npx lighthouse ${url} \
    --form-factor=mobile \
    --screenEmulation.mobile \
    --output=json \
    --output-path=stdout \
    --only-categories=performance \
    --throttling-method=provided \
    --throttling.rttMs=${throttling.rttMs} \
    --throttling.throughputKbps=${Math.round(throttling.downloadThroughput * 8 / 1024)} \
    --throttling.requestLatencyMs=${throttling.rttMs / 2} \
    --throttling.downloadThroughputKbps=${Math.round(throttling.downloadThroughput * 8 / 1024)} \
    --throttling.uploadThroughputKbps=${Math.round(throttling.uploadThroughput * 8 / 1024)} \
    --throttling.cpuSlowdownMultiplier=${cpu.multiplier} \
    --clear-storage \
    --chrome-flags="--headless --no-sandbox --disable-gpu" \
    --quiet`;

  try {
    const output = execSync(cmd, { maxBuffer: 10 * 1024 * 1024 });
    const lhr = JSON.parse(output.toString());

    // Extract network data from audits
    const networkRequests = lhr.audits['network-requests']?.details?.items || [];

    let jsTransferred = 0;
    let jsUncompressed = 0;
    let totalRequests = 0;
    let compressionType = 'none';

    for (const request of networkRequests) {
      if (request.resourceType === 'Script') {
        jsTransferred += request.transferSize || 0;
        jsUncompressed += request.resourceSize || 0;
        totalRequests++;

        // Detect compression type from first compressed JS file
        if (compressionType === 'none' && request.transferSize < request.resourceSize) {
          // Infer compression type - if compressed but we can't detect encoding,
          // assume gzip (most common for local dev servers)
          compressionType = 'gzip';
        }
      }
    }

    // Extract performance metrics
    const performanceScore = Math.round((lhr.categories.performance?.score || 0) * 100);
    const fcp = lhr.audits['first-contentful-paint']?.numericValue || 0;
    const lcp = lhr.audits['largest-contentful-paint']?.numericValue || 0;
    const tbt = lhr.audits['total-blocking-time']?.numericValue || 0;
    const cls = lhr.audits['cumulative-layout-shift']?.numericValue || 0;
    const si = lhr.audits['speed-index']?.numericValue || 0;

    // Extract parse/compile metrics
    const bootupTime = lhr.audits['bootup-time']?.details?.items || [];
    let scriptEvaluation = 0;
    for (const item of bootupTime) {
      scriptEvaluation += (item.scripting || 0);
    }

    const mainThreadWorkBreakdown = lhr.audits['mainthread-work-breakdown']?.numericValue || 0;

    return {
      jsTransferred,
      jsUncompressed,
      totalRequests,
      performanceScore,
      fcp: Math.round(fcp),
      lcp: Math.round(lcp),
      tbt: Math.round(tbt),
      cls: Math.round(cls * 1000) / 1000,
      si: Math.round(si),
      scriptEvaluation: Math.round(scriptEvaluation),
      mainThreadWork: Math.round(mainThreadWorkBreakdown),
      compressionType
    };
  } catch (error) {
    console.error(`   ❌ Lighthouse failed:`, error);
    throw error;
  }
}

async function measureFramework(framework: typeof FRAMEWORKS[0], numRuns: number, networkCondition: NetworkCondition, cpuThrottling: CpuThrottling): Promise<AggregatedStats[]> {
  console.error(`\n📦 Measuring ${framework.name} (${numRuns} runs per page)...`);

  const cleanup = await startServer(framework);
  const allResults: AggregatedStats[] = [];

  try {
    const pages: Array<{ name: 'home' | 'board'; url: string }> = [
      { name: 'home', url: `http://localhost:${framework.port}${framework.homeUrl}` },
      { name: 'board', url: `http://localhost:${framework.port}${framework.boardUrl}` }
    ];

    // Warmup: request each page twice to stabilize server/database performance
    await warmupServer([
      ...pages.map(p => p.url),
      ...pages.map(p => p.url) // Request each page twice
    ]);

    for (const page of pages) {
      console.error(`   Measuring ${page.name} page (${numRuns} runs)...`);

      const runs: Array<{
        jsTransferred: number;
        jsUncompressed: number;
        performanceScore: number;
        fcp: number;
        lcp: number;
        tbt: number;
        cls: number;
        si: number;
        scriptEvaluation: number;
        mainThreadWork: number;
        compressionType: string;
      }> = [];

      // Run measurements multiple times
      for (let i = 1; i <= numRuns; i++) {
        const stats = await measurePageBundle(page.url, i, numRuns, networkCondition, cpuThrottling);
        runs.push(stats);
        await sleep(2000); // Brief pause between runs
      }

      // Calculate statistics
      const jsTransferredStats = calculateStats(runs.map(r => r.jsTransferred));
      const jsUncompressedStats = calculateStats(runs.map(r => r.jsUncompressed));
      const performanceScoreStats = calculateStats(runs.map(r => r.performanceScore));
      const fcpStats = calculateStats(runs.map(r => r.fcp));
      const lcpStats = calculateStats(runs.map(r => r.lcp));
      const tbtStats = calculateStats(runs.map(r => r.tbt));
      const clsStats = calculateStatsFloat(runs.map(r => r.cls));
      const siStats = calculateStats(runs.map(r => r.si));
      const scriptEvaluationStats = calculateStats(runs.map(r => r.scriptEvaluation));
      const mainThreadWorkStats = calculateStats(runs.map(r => r.mainThreadWork));

      const compressionType = runs[0].compressionType;

      // Calculate compression ratio (percentage saved)
      const compressionRatio = jsUncompressedStats.median > 0
        ? Math.round(((jsUncompressedStats.median - jsTransferredStats.median) / jsUncompressedStats.median) * 100)
        : 0;

      console.error(`   ✅ ${page.name}: ${(jsTransferredStats.median / 1024).toFixed(1)} kB compressed (${(jsUncompressedStats.median / 1024).toFixed(1)} kB raw, ${compressionRatio}% reduction) | Score: ${performanceScoreStats.median} (±${performanceScoreStats.stddev.toFixed(1)}) | Script eval: ${scriptEvaluationStats.median}ms`);

      allResults.push({
        framework: framework.name,
        page: page.name,
        jsTransferred: jsTransferredStats,
        jsUncompressed: jsUncompressedStats,
        compressionRatio,
        performanceScore: performanceScoreStats,
        fcp: fcpStats,
        lcp: lcpStats,
        tbt: tbtStats,
        cls: clsStats,
        si: siStats,
        scriptEvaluation: scriptEvaluationStats,
        mainThreadWork: mainThreadWorkStats,
        compressionType,
        chromeVersion: getChromeVersion(),
        networkCondition: NETWORK_CONDITIONS[networkCondition].name,
        cpuThrottling: CPU_THROTTLING[cpuThrottling].name,
        measurementTimestamp: new Date().toISOString()
      });
    }

  } finally {
    cleanup();
    await sleep(2000); // Let port fully release
  }

  return allResults;
}

async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let frameworkName: string | undefined;
  let numRuns = 5; // Default to 5 runs
  let networkCondition: NetworkCondition = '4g'; // Default to 4G
  let cpuThrottling: CpuThrottling = '1x'; // Default to no CPU throttling

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--runs' && i + 1 < args.length) {
      numRuns = parseInt(args[i + 1], 10);
      if (isNaN(numRuns) || numRuns < 1) {
        console.error('❌ Error: --runs must be a positive number');
        process.exit(1);
      }
      i++; // Skip next arg
    } else if (args[i] === '--network' && i + 1 < args.length) {
      const network = args[i + 1] as NetworkCondition;
      if (!NETWORK_CONDITIONS[network]) {
        console.error(`❌ Error: Invalid network condition "${network}"`);
        console.error('Available conditions: 4g, 3g, slow-3g');
        process.exit(1);
      }
      networkCondition = network;
      i++; // Skip next arg
    } else if (args[i] === '--cpu' && i + 1 < args.length) {
      const cpu = args[i + 1] as CpuThrottling;
      if (!CPU_THROTTLING[cpu]) {
        console.error(`❌ Error: Invalid CPU throttling "${cpu}"`);
        console.error('Available options: 1x, 4x, 6x');
        process.exit(1);
      }
      cpuThrottling = cpu;
      i++; // Skip next arg
    } else if (!frameworkName) {
      frameworkName = args[i];
    }
  }

  if (!frameworkName) {
    console.error('❌ Error: Framework name required');
    console.error('\nUsage: tsx scripts/measure-single.ts <framework-name> [--runs N] [--network CONDITION] [--cpu THROTTLING]');
    console.error('\nAvailable frameworks:');
    FRAMEWORKS.forEach(f => console.error(`  - "${f.name}"`));
    console.error('\nOptions:');
    console.error('  --runs N              Number of measurement runs per page (default: 5)');
    console.error('  --network CONDITION   Network condition: 4g, 3g, slow-3g (default: 4g)');
    console.error('  --cpu THROTTLING      CPU throttling: 1x, 4x, 6x (default: 1x)');
    process.exit(1);
  }

  const framework = FRAMEWORKS.find(f => f.name === frameworkName);

  if (!framework) {
    console.error(`❌ Error: Framework "${frameworkName}" not found`);
    console.error('\nAvailable frameworks:');
    FRAMEWORKS.forEach(f => console.error(`  - "${f.name}"`));
    process.exit(1);
  }

  // Display measurement configuration
  const chromeVersion = getChromeVersion();
  const networkConfig = NETWORK_CONDITIONS[networkCondition];
  const cpuConfig = CPU_THROTTLING[cpuThrottling];
  console.error(`\n🔍 Measurement Configuration`);
  console.error(`   Framework: ${framework.name}`);
  console.error(`   Runs per page: ${numRuns}`);
  console.error(`   Network: ${networkConfig.name} (${(networkConfig.downloadThroughput * 8 / 1024 / 1024).toFixed(1)} Mbps, ${networkConfig.rttMs}ms RTT)`);
  console.error(`   CPU: ${cpuConfig.name}`);
  console.error(`   Lighthouse version: ${chromeVersion}`);
  console.error(`   Cache: Cleared between runs (cold-load measurement)`);

  try {
    const results = await measureFramework(framework, numRuns, networkCondition, cpuThrottling);

    // Output JSON to stdout for programmatic consumption
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error(`\n❌ Failed to measure ${framework.name}:`, error);
    process.exit(1);
  }
}

main().catch(console.error);
