#!/usr/bin/env tsx

/**
 * Bundle Size Measurement Script
 *
 * Measures JS bundle sizes for home page and board page by running
 * lighthouse and extracting network transfer data
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
];

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

  // Kill any existing process on this port
  killPort(framework.port);

  console.log(`   Starting ${framework.name} on port ${framework.port}...`);

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

  console.log(`   ✅ Server ready at http://localhost:${framework.port}`);

  // Return cleanup function
  return () => killPort(framework.port);
}

async function measurePageBundle(url: string): Promise<{ jsTransferred: number; jsUncompressed: number; totalRequests: number }> {
  const cmd = `npx lighthouse ${url} \
    --form-factor=mobile \
    --screenEmulation.mobile \
    --output=json \
    --output-path=stdout \
    --only-categories=performance \
    --throttling-method=provided \
    --chrome-flags="--headless --no-sandbox --disable-gpu"`;

  try {
    const output = execSync(cmd, { maxBuffer: 10 * 1024 * 1024 });
    const lhr = JSON.parse(output.toString());

    // Extract network data from audits
    const networkRequests = lhr.audits['network-requests']?.details?.items || [];

    let jsTransferred = 0;
    let jsUncompressed = 0;
    let totalRequests = 0;

    for (const request of networkRequests) {
      if (request.resourceType === 'Script') {
        jsTransferred += request.transferSize || 0;
        jsUncompressed += request.resourceSize || 0;
        totalRequests++;
      }
    }

    return { jsTransferred, jsUncompressed, totalRequests };
  } catch (error) {
    console.error(`   ❌ Lighthouse failed:`, error);
    throw error;
  }
}

async function measureFramework(framework: typeof FRAMEWORKS[0]): Promise<PageBundleStats[]> {
  console.log(`\n📦 Measuring ${framework.name}...`);

  const cleanup = await startServer(framework);
  const results: PageBundleStats[] = [];

  try {
    // Measure home page
    console.log(`   Measuring home page...`);
    const homeUrl = `http://localhost:${framework.port}${framework.homeUrl}`;
    const homeStats = await measurePageBundle(homeUrl);
    results.push({
      framework: framework.name,
      page: 'home',
      jsTransferred: homeStats.jsTransferred,
      jsUncompressed: homeStats.jsUncompressed,
      totalRequests: homeStats.totalRequests,
      timestamp: new Date().toISOString()
    });
    console.log(`   ✅ Home: ${(homeStats.jsTransferred / 1024).toFixed(1)} kB transferred (${homeStats.totalRequests} requests)`);

    // Measure board page
    console.log(`   Measuring board page...`);
    const boardUrl = `http://localhost:${framework.port}${framework.boardUrl}`;
    const boardStats = await measurePageBundle(boardUrl);
    results.push({
      framework: framework.name,
      page: 'board',
      jsTransferred: boardStats.jsTransferred,
      jsUncompressed: boardStats.jsUncompressed,
      totalRequests: boardStats.totalRequests,
      timestamp: new Date().toISOString()
    });
    console.log(`   ✅ Board: ${(boardStats.jsTransferred / 1024).toFixed(1)} kB transferred (${boardStats.totalRequests} requests)`);

  } finally {
    cleanup();
    await sleep(2000); // Let port fully release
  }

  return results;
}

async function main() {
  console.log('🚀 Starting bundle size measurements...');
  console.log('   Measuring JS transferred for home and board pages\n');

  const allResults: PageBundleStats[] = [];

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
  const outputPath = join(metricsDir, 'bundle-analysis.json');
  writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`\n✅ Detailed results saved to ${outputPath}`);

  // Create summary tables
  console.log('\n📊 Home Page Bundle Sizes:');
  console.log('┌─────────────────────────┬──────────────┬──────────────┬──────────┐');
  console.log('│ Framework               │ JS (kB)      │ Uncompressed │ Requests │');
  console.log('├─────────────────────────┼──────────────┼──────────────┼──────────┤');

  const homeResults = allResults.filter(r => r.page === 'home');
  homeResults
    .sort((a, b) => a.jsTransferred - b.jsTransferred)
    .forEach(r => {
      const name = r.framework.padEnd(23);
      const transferred = (r.jsTransferred / 1024).toFixed(1).padStart(12);
      const uncompressed = (r.jsUncompressed / 1024).toFixed(1).padStart(12);
      const requests = r.totalRequests.toString().padStart(8);
      console.log(`│ ${name} │ ${transferred} │ ${uncompressed} │ ${requests} │`);
    });

  console.log('└─────────────────────────┴──────────────┴──────────────┴──────────┘');

  console.log('\n📊 Board Page Bundle Sizes:');
  console.log('┌─────────────────────────┬──────────────┬──────────────┬──────────┐');
  console.log('│ Framework               │ JS (kB)      │ Uncompressed │ Requests │');
  console.log('├─────────────────────────┼──────────────┼──────────────┼──────────┤');

  const boardResults = allResults.filter(r => r.page === 'board');
  boardResults
    .sort((a, b) => a.jsTransferred - b.jsTransferred)
    .forEach(r => {
      const name = r.framework.padEnd(23);
      const transferred = (r.jsTransferred / 1024).toFixed(1).padStart(12);
      const uncompressed = (r.jsUncompressed / 1024).toFixed(1).padStart(12);
      const requests = r.totalRequests.toString().padStart(8);
      console.log(`│ ${name} │ ${transferred} │ ${uncompressed} │ ${requests} │`);
    });

  console.log('└─────────────────────────┴──────────────┴──────────────┴──────────┘');

  // Create chart-ready summary
  const summary = {
    timestamp: new Date().toISOString(),
    homePage: homeResults.map(r => ({
      framework: r.framework,
      jsTransferred: r.jsTransferred,
      jsUncompressed: r.jsUncompressed,
      requests: r.totalRequests
    })),
    boardPage: boardResults.map(r => ({
      framework: r.framework,
      jsTransferred: r.jsTransferred,
      jsUncompressed: r.jsUncompressed,
      requests: r.totalRequests
    }))
  };

  const summaryPath = join(metricsDir, 'bundle-summary.json');
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n✅ Summary saved to ${summaryPath}`);
}

main().catch(console.error);
