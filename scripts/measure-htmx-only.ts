#!/usr/bin/env tsx
import { execSync } from 'child_process';

const PORT = 4321;
const HOME_URL = `http://localhost:${PORT}/`;
const BOARD_URL = `http://localhost:${PORT}/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c`;

function measurePage(url: string, pageName: string) {
  console.log(`\n📊 Measuring ${pageName}...`);

  const cmd = `npx lighthouse "${url}" \
    --form-factor=mobile \
    --screenEmulation.mobile \
    --output=json \
    --output-path=stdout \
    --only-categories=performance,accessibility,best-practices,seo \
    --throttling.rttMs=40 \
    --throttling.throughputKbps=10240 \
    --throttling.cpuSlowdownMultiplier=1 \
    --chrome-flags="--headless --no-sandbox --disable-gpu"`;

  const output = execSync(cmd, { maxBuffer: 10 * 1024 * 1024 });
  const lhr = JSON.parse(output.toString());

  // Extract JS bundle info
  const networkRequests = lhr.audits['network-requests']?.details?.items || [];
  let jsTransferred = 0;
  let jsUncompressed = 0;
  let jsRequests = 0;

  for (const request of networkRequests) {
    if (request.resourceType === 'Script') {
      jsTransferred += request.transferSize || 0;
      jsUncompressed += request.resourceSize || 0;
      jsRequests++;
    }
  }

  const metrics = {
    framework: 'Astro + HTMX',
    page: pageName,
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    fcp: Math.round(lhr.audits['first-contentful-paint'].numericValue),
    lcp: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
    tbt: Math.round(lhr.audits['total-blocking-time'].numericValue),
    cls: lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3),
    tti: Math.round(lhr.audits['interactive'].numericValue),
    jsTransferred: Math.round(jsTransferred / 1024 * 10) / 10,
    jsUncompressed: Math.round(jsUncompressed / 1024 * 10) / 10,
    jsRequests
  };

  console.log(`✅ ${pageName} Results:`);
  console.log(`   Performance: ${metrics.performance}`);
  console.log(`   FCP: ${metrics.fcp}ms | LCP: ${metrics.lcp}ms | TTI: ${metrics.tti}ms`);
  console.log(`   TBT: ${metrics.tbt}ms | CLS: ${metrics.cls}`);
  console.log(`   JS: ${metrics.jsTransferred}kB transferred (${metrics.jsUncompressed}kB uncompressed, ${metrics.jsRequests} requests)`);

  return metrics;
}

console.log('🚀 Measuring kanban-htmx (Astro + HTMX)...\n');

const homeMetrics = measurePage(HOME_URL, 'Home');
const boardMetrics = measurePage(BOARD_URL, 'Board');

console.log('\n' + '='.repeat(80));
console.log('SUMMARY FOR README/BLOG:');
console.log('='.repeat(80));
console.log(`\nHome Page:`);
console.log(`  Performance: ${homeMetrics.performance} | Accessibility: ${homeMetrics.accessibility}`);
console.log(`  FCP: ${homeMetrics.fcp}ms | LCP: ${homeMetrics.lcp}ms | TTI: ${homeMetrics.tti}ms`);
console.log(`  TBT: ${homeMetrics.tbt}ms | CLS: ${homeMetrics.cls}`);
console.log(`  JS Bundle: ${homeMetrics.jsTransferred}kB`);

console.log(`\nBoard Page:`);
console.log(`  Performance: ${boardMetrics.performance} | Accessibility: ${boardMetrics.accessibility}`);
console.log(`  FCP: ${boardMetrics.fcp}ms | LCP: ${boardMetrics.lcp}ms | TTI: ${boardMetrics.tti}ms`);
console.log(`  TBT: ${boardMetrics.tbt}ms | CLS: ${boardMetrics.cls}`);
console.log(`  JS Bundle: ${boardMetrics.jsTransferred}kB`);
console.log('\n' + '='.repeat(80));
