#!/usr/bin/env tsx

/**
 * Quick script to measure missing frameworks: Next.js and Astro
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
    console.log(`Killed process on port ${port}`);
  } catch {
    // Port wasn't in use
  }
}

async function measureBundle(url: string) {
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
    console.error(`Lighthouse failed:`, error);
    throw error;
  }
}

async function measureAstro() {
  console.log('\\n📦 Measuring Astro...');

  // Kill any existing process
  killPort(3007);

  // Start server
  console.log('Starting Astro server...');
  execSync('npm run preview -- --port 3007 &', {
    cwd: join(process.cwd(), 'kanban-htmx'),
    stdio: 'ignore',
    shell: '/bin/bash'
  });

  // Wait for server
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    if (isPortInUse(3007)) {
      ready = true;
      break;
    }
  }

  if (!ready) {
    throw new Error('Astro server failed to start');
  }

  console.log('✅ Server ready');

  // Measure home page
  console.log('Measuring home page...');
  const home = await measureBundle('http://localhost:3007/');
  console.log(`✅ Home: ${(home.jsTransferred / 1024).toFixed(1)} kB`);

  // Measure board page
  console.log('Measuring board page...');
  const board = await measureBundle('http://localhost:3007/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c');
  console.log(`✅ Board: ${(board.jsTransferred / 1024).toFixed(1)} kB`);

  // Cleanup
  killPort(3007);
  await sleep(2000);

  return { home, board };
}

async function measureNextJS() {
  console.log('\\n📦 Measuring Next.js...');

  // Kill any existing process
  killPort(3000);

  // Start server
  console.log('Starting Next.js server...');
  execSync('npm run start &', {
    cwd: join(process.cwd(), 'kanban-nextjs'),
    stdio: 'ignore',
    shell: '/bin/bash'
  });

  // Wait for server
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    if (isPortInUse(3000)) {
      ready = true;
      break;
    }
  }

  if (!ready) {
    throw new Error('Next.js server failed to start');
  }

  console.log('✅ Server ready');

  // Measure home page
  console.log('Measuring home page...');
  const home = await measureBundle('http://localhost:3000/');
  console.log(`✅ Home: ${(home.jsTransferred / 1024).toFixed(1)} kB`);

  // Measure board page
  console.log('Measuring board page...');
  const board = await measureBundle('http://localhost:3000/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c');
  console.log(`✅ Board: ${(board.jsTransferred / 1024).toFixed(1)} kB`);

  // Cleanup
  killPort(3000);
  await sleep(2000);

  return { home, board };
}

async function main() {
  console.log('🚀 Measuring missing frameworks...');

  const results: any = {
    homePage: [],
    boardPage: []
  };

  try {
    const astro = await measureAstro();
    results.homePage.push({
      framework: 'Astro',
      jsTransferred: astro.home.jsTransferred,
      jsUncompressed: astro.home.jsUncompressed,
      requests: astro.home.totalRequests
    });
    results.boardPage.push({
      framework: 'Astro',
      jsTransferred: astro.board.jsTransferred,
      jsUncompressed: astro.board.jsUncompressed,
      requests: astro.board.totalRequests
    });
  } catch (error) {
    console.error('Failed to measure Astro:', error);
  }

  try {
    const nextjs = await measureNextJS();
    results.homePage.push({
      framework: 'Next.js',
      jsTransferred: nextjs.home.jsTransferred,
      jsUncompressed: nextjs.home.jsUncompressed,
      requests: nextjs.home.totalRequests
    });
    results.boardPage.push({
      framework: 'Next.js',
      jsTransferred: nextjs.board.jsTransferred,
      jsUncompressed: nextjs.board.jsUncompressed,
      requests: nextjs.board.totalRequests
    });
  } catch (error) {
    console.error('Failed to measure Next.js:', error);
  }

  // Read existing summary
  const summaryPath = join(process.cwd(), 'metrics', 'bundle-summary.json');
  const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));

  // Add missing frameworks
  summary.homePage.push(...results.homePage);
  summary.boardPage.push(...results.boardPage);

  // Save updated summary
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\\n✅ Updated bundle-summary.json');
}

main().catch(console.error);
