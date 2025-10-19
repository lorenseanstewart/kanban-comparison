#!/usr/bin/env tsx

/**
 * Lighthouse Performance Measurement Script
 *
 * Runs Lighthouse audits on all 7 framework implementations
 * Tests both desktop and mobile with network throttling
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface LighthouseResult {
  framework: string;
  page: 'home' | 'board';
  url: string;
  device: 'desktop' | 'mobile';
  throttling: 'none' | '3g' | '4g';
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    timeToInteractive: number;
  };
  timestamp: string;
}

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
  { name: 'Marko', dir: 'kanban-marko', port: 3009, startCmd: 'npm run start', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
];

const DEVICES = ['mobile'] as const;
const THROTTLING = ['4g'] as const; // Only mobile 4G for realistic performance testing

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    console.log(`   Killed process on port ${port}`);
  } catch {
    // Port wasn't in use
  }
}

async function startServer(framework: typeof FRAMEWORKS[0]): Promise<() => void> {
  const projectRoot = join(process.cwd(), framework.dir);

  // Ensure build exists
  if (!existsSync(join(projectRoot, 'dist')) && !existsSync(join(projectRoot, '.next'))) {
    console.log(`   Building ${framework.name}...`);
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  }

  // Kill any existing process on this port
  killPort(framework.port);

  console.log(`   Starting ${framework.name} on port ${framework.port}...`);

  // Start server in background with PORT env var
  const serverProcess = execSync(`PORT=${framework.port} ${framework.startCmd} &`, {
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

  console.log(`   ✅ Server ready at http://localhost:${framework.port}`);

  // Return cleanup function
  return () => killPort(framework.port);
}

async function runLighthouse(
  url: string,
  device: 'desktop' | 'mobile',
  throttling: 'none' | '3g' | '4g'
): Promise<any> {
  const formFactor = device === 'desktop' ? 'desktop' : 'mobile';
  const screenEmulation = device === 'mobile' ? '--screenEmulation.mobile' : '--screenEmulation.disabled';

  let throttlingFlag = '';
  if (throttling === '3g') {
    throttlingFlag = '--throttling.rttMs=150 --throttling.throughputKbps=1638 --throttling.cpuSlowdownMultiplier=4';
  } else if (throttling === '4g') {
    throttlingFlag = '--throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=1';
  } else {
    throttlingFlag = '--throttling-method=provided';
  }

  const cmd = `npx lighthouse ${url} \
    --form-factor=${formFactor} \
    ${screenEmulation} \
    --output=json \
    --output-path=stdout \
    --only-categories=performance,accessibility,best-practices,seo \
    ${throttlingFlag} \
    --chrome-flags="--headless --no-sandbox --disable-gpu"`;

  try {
    const output = execSync(cmd, { maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(output.toString());
  } catch (error) {
    console.error(`   ❌ Lighthouse failed:`, error);
    throw error;
  }
}

function parseLighthouseResult(lhr: any, framework: string, page: 'home' | 'board', device: 'desktop' | 'mobile', throttling: 'none' | '3g' | '4g'): LighthouseResult {
  const audits = lhr.audits;

  return {
    framework,
    page,
    url: lhr.finalUrl,
    device,
    throttling,
    scores: {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
    },
    metrics: {
      firstContentfulPaint: audits['first-contentful-paint'].numericValue,
      largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
      totalBlockingTime: audits['total-blocking-time'].numericValue,
      cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
      speedIndex: audits['speed-index'].numericValue,
      timeToInteractive: audits['interactive'].numericValue,
    },
    timestamp: new Date().toISOString(),
  };
}

async function measureFramework(framework: typeof FRAMEWORKS[0]): Promise<LighthouseResult[]> {
  console.log(`\n🔍 Measuring ${framework.name}...`);

  const cleanup = await startServer(framework);
  const results: LighthouseResult[] = [];

  try {
    const pages: Array<{ name: 'home' | 'board'; url: string }> = [
      { name: 'home', url: `http://localhost:${framework.port}${framework.homeUrl}` },
      { name: 'board', url: `http://localhost:${framework.port}${framework.boardUrl}` }
    ];

    for (const page of pages) {
      for (const device of DEVICES) {
        for (const throttle of THROTTLING) {
          console.log(`   Running Lighthouse: ${page.name} page / ${device} / ${throttle}...`);

          const lhr = await runLighthouse(page.url, device, throttle);
          const result = parseLighthouseResult(lhr, framework.name, page.name, device, throttle);

          results.push(result);

          console.log(`   ✅ ${page.name}: Performance ${result.scores.performance}, FCP: ${result.metrics.firstContentfulPaint.toFixed(0)}ms`);
        }
      }
    }
  } finally {
    cleanup();
    await sleep(2000); // Let port fully release
  }

  return results;
}

async function main() {
  console.log('🚀 Starting Lighthouse measurements...');
  console.log('   This will take several minutes...\n');

  const allResults: LighthouseResult[] = [];

  for (const framework of FRAMEWORKS) {
    try {
      const results = await measureFramework(framework);
      allResults.push(...results);
    } catch (error) {
      console.error(`Failed to measure ${framework.name}:`, error);
    }
  }

  // Ensure metrics directory exists
  const metricsDir = join(process.cwd(), 'metrics');
  if (!existsSync(metricsDir)) {
    mkdirSync(metricsDir, { recursive: true });
  }

  // Save detailed results
  const outputPath = join(metricsDir, 'lighthouse-results.json');
  writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`\n✅ Results saved to ${outputPath}`);

  // Home page summary
  console.log('\n📊 Home Page Performance (Mobile 4G):');
  console.log('┌─────────────────────────┬───────┬──────────┬──────────┬──────────┐');
  console.log('│ Framework               │ Perf  │ FCP (ms) │ LCP (ms) │ TTI (ms) │');
  console.log('├─────────────────────────┼───────┼──────────┼──────────┼──────────┤');

  const homeResults = allResults.filter(r => r.page === 'home' && r.device === 'mobile' && r.throttling === '4g');
  homeResults
    .sort((a, b) => b.scores.performance - a.scores.performance)
    .forEach(r => {
      const name = r.framework.padEnd(23);
      const perf = r.scores.performance.toString().padStart(5);
      const fcp = r.metrics.firstContentfulPaint.toFixed(0).padStart(8);
      const lcp = r.metrics.largestContentfulPaint.toFixed(0).padStart(8);
      const tti = r.metrics.timeToInteractive.toFixed(0).padStart(8);
      console.log(`│ ${name} │ ${perf} │ ${fcp} │ ${lcp} │ ${tti} │`);
    });

  console.log('└─────────────────────────┴───────┴──────────┴──────────┴──────────┘');

  // Board page summary
  console.log('\n📱 Board Page Performance (Mobile 4G):');
  console.log('┌─────────────────────────┬───────┬──────────┬──────────┬──────────┐');
  console.log('│ Framework               │ Perf  │ FCP (ms) │ LCP (ms) │ TTI (ms) │');
  console.log('├─────────────────────────┼───────┼──────────┼──────────┼──────────┤');

  const boardResults = allResults.filter(r => r.page === 'board' && r.device === 'mobile' && r.throttling === '4g');
  boardResults
    .sort((a, b) => b.scores.performance - a.scores.performance)
    .forEach(r => {
      const name = r.framework.padEnd(23);
      const perf = r.scores.performance.toString().padStart(5);
      const fcp = r.metrics.firstContentfulPaint.toFixed(0).padStart(8);
      const lcp = r.metrics.largestContentfulPaint.toFixed(0).padStart(8);
      const tti = r.metrics.timeToInteractive.toFixed(0).padStart(8);
      console.log(`│ ${name} │ ${perf} │ ${fcp} │ ${lcp} │ ${tti} │`);
    });

  console.log('└─────────────────────────┴───────┴──────────┴──────────┴──────────┘');

  // Create chart-ready summary
  const summary = {
    timestamp: new Date().toISOString(),
    homePage: homeResults.map(r => ({
      framework: r.framework,
      performance: r.scores.performance,
      fcp: r.metrics.firstContentfulPaint,
      lcp: r.metrics.largestContentfulPaint,
      tti: r.metrics.timeToInteractive,
      tbt: r.metrics.totalBlockingTime,
      cls: r.metrics.cumulativeLayoutShift,
    })),
    boardPage: boardResults.map(r => ({
      framework: r.framework,
      performance: r.scores.performance,
      fcp: r.metrics.firstContentfulPaint,
      lcp: r.metrics.largestContentfulPaint,
      tti: r.metrics.timeToInteractive,
      tbt: r.metrics.totalBlockingTime,
      cls: r.metrics.cumulativeLayoutShift,
    })),
  };

  const summaryPath = join(metricsDir, 'lighthouse-summary.json');
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n✅ Summary saved to ${summaryPath}`);
}

main().catch(console.error);
