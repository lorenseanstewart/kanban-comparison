#!/usr/bin/env tsx

/**
 * Single Framework Bundle Measurement Script
 *
 * Measures JS bundle sizes for a single framework's home and board pages.
 * Outputs results in JSON format for easy parsing.
 *
 * Usage: tsx scripts/measure-single.ts <framework-name>
 * Example: tsx scripts/measure-single.ts "Next.js"
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
  { name: 'Marko', dir: 'kanban-marko', port: 3007, startCmd: 'npm run preview', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
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

async function measurePageBundle(url: string): Promise<{
  jsTransferred: number;
  jsUncompressed: number;
  totalRequests: number;
  performanceScore: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
  si: number;
}> {
  const cmd = `npx lighthouse ${url} \
    --form-factor=mobile \
    --screenEmulation.mobile \
    --output=json \
    --output-path=stdout \
    --only-categories=performance \
    --throttling-method=provided \
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

    for (const request of networkRequests) {
      if (request.resourceType === 'Script') {
        jsTransferred += request.transferSize || 0;
        jsUncompressed += request.resourceSize || 0;
        totalRequests++;
      }
    }

    // Extract performance metrics
    const performanceScore = Math.round((lhr.categories.performance?.score || 0) * 100);
    const fcp = lhr.audits['first-contentful-paint']?.numericValue || 0;
    const lcp = lhr.audits['largest-contentful-paint']?.numericValue || 0;
    const tbt = lhr.audits['total-blocking-time']?.numericValue || 0;
    const cls = lhr.audits['cumulative-layout-shift']?.numericValue || 0;
    const si = lhr.audits['speed-index']?.numericValue || 0;

    return {
      jsTransferred,
      jsUncompressed,
      totalRequests,
      performanceScore,
      fcp: Math.round(fcp),
      lcp: Math.round(lcp),
      tbt: Math.round(tbt),
      cls: Math.round(cls * 1000) / 1000,
      si: Math.round(si)
    };
  } catch (error) {
    console.error(`   ❌ Lighthouse failed:`, error);
    throw error;
  }
}

async function measureFramework(framework: typeof FRAMEWORKS[0]): Promise<PageBundleStats[]> {
  console.error(`\n📦 Measuring ${framework.name}...`);

  const cleanup = await startServer(framework);
  const results: PageBundleStats[] = [];

  try {
    // Measure home page
    console.error(`   Measuring home page...`);
    const homeUrl = `http://localhost:${framework.port}${framework.homeUrl}`;
    const homeStats = await measurePageBundle(homeUrl);
    results.push({
      framework: framework.name,
      page: 'home',
      jsTransferred: homeStats.jsTransferred,
      jsUncompressed: homeStats.jsUncompressed,
      totalRequests: homeStats.totalRequests,
      performanceScore: homeStats.performanceScore,
      fcp: homeStats.fcp,
      lcp: homeStats.lcp,
      tbt: homeStats.tbt,
      cls: homeStats.cls,
      si: homeStats.si,
      timestamp: new Date().toISOString()
    });
    console.error(`   ✅ Home: ${(homeStats.jsTransferred / 1024).toFixed(1)} kB | Score: ${homeStats.performanceScore}`);

    // Measure board page
    console.error(`   Measuring board page...`);
    const boardUrl = `http://localhost:${framework.port}${framework.boardUrl}`;
    const boardStats = await measurePageBundle(boardUrl);
    results.push({
      framework: framework.name,
      page: 'board',
      jsTransferred: boardStats.jsTransferred,
      jsUncompressed: boardStats.jsUncompressed,
      totalRequests: boardStats.totalRequests,
      performanceScore: boardStats.performanceScore,
      fcp: boardStats.fcp,
      lcp: boardStats.lcp,
      tbt: boardStats.tbt,
      cls: boardStats.cls,
      si: boardStats.si,
      timestamp: new Date().toISOString()
    });
    console.error(`   ✅ Board: ${(boardStats.jsTransferred / 1024).toFixed(1)} kB | Score: ${boardStats.performanceScore}`);

  } finally {
    cleanup();
    await sleep(2000); // Let port fully release
  }

  return results;
}

async function main() {
  const frameworkName = process.argv[2];

  if (!frameworkName) {
    console.error('❌ Error: Framework name required');
    console.error('\nUsage: tsx scripts/measure-single.ts <framework-name>');
    console.error('\nAvailable frameworks:');
    FRAMEWORKS.forEach(f => console.error(`  - "${f.name}"`));
    process.exit(1);
  }

  const framework = FRAMEWORKS.find(f => f.name === frameworkName);

  if (!framework) {
    console.error(`❌ Error: Framework "${frameworkName}" not found`);
    console.error('\nAvailable frameworks:');
    FRAMEWORKS.forEach(f => console.error(`  - "${f.name}"`));
    process.exit(1);
  }

  try {
    const results = await measureFramework(framework);

    // Output JSON to stdout
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error(`\n❌ Failed to measure ${framework.name}:`, error);
    process.exit(1);
  }
}

main().catch(console.error);
