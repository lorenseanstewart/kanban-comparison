#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface Metric {
  median: number;
  stddev: number;
  ci95Lower: number;
  ci95Upper: number;
}

interface Result {
  framework: string;
  page: string;
  cacheMode: string;
  fcp: Metric;
  ttfb: Metric;
  jsTransferred: Metric;
  cssTransferred: Metric;
  totalTransferred: Metric;
}

const metricsDir = join(process.cwd(), 'metrics');
const files = readdirSync(metricsDir).filter(f => f.endsWith('.json') && f.includes('-playwright_'));

const data: Record<string, any> = {};

for (const file of files) {
  const match = file.match(/^(.+)-playwright_(3g|4g)\.json$/);
  if (!match) continue;

  const framework = match[1];
  const network = match[2];

  const content = JSON.parse(readFileSync(join(metricsDir, file), 'utf-8'));
  const boardCold = content.results.find((r: Result) => r.page === 'board' && r.cacheMode === 'cold');

  if (!boardCold) continue;

  if (!data[framework]) data[framework] = {};

  data[framework][network] = {
    fcp: boardCold.fcp.median,
    fcpStddev: boardCold.fcp.stddev,
    fcpCI: `[${boardCold.fcp.ci95Lower}-${boardCold.fcp.ci95Upper}]`,
    ttfb: boardCold.ttfb.median,
    ttfbStddev: boardCold.ttfb.stddev,
    js: Math.round(boardCold.jsTransferred.median / 1024),
    css: Math.round(boardCold.cssTransferred.median / 1024),
    total: Math.round(boardCold.totalTransferred.median / 1024),
  };
}

// Sort by 3G FCP
const sorted = Object.entries(data).sort((a, b) => {
  return (a[1]['3g']?.fcp || 99999) - (b[1]['3g']?.fcp || 99999);
});

console.log('Framework | 3G FCP | 3G CI | 4G FCP | 4G CI | TTFB | JS | CSS | Total');
console.log('----------|--------|-------|--------|-------|------|----|----|------');

for (const [framework, metrics] of sorted) {
  const m3g = metrics['3g'] || {};
  const m4g = metrics['4g'] || {};

  console.log(`${framework} | ${m3g.fcp || 'N/A'}ms | ${m3g.fcpCI || 'N/A'} | ${m4g.fcp || 'N/A'}ms | ${m4g.fcpCI || 'N/A'} | ${m3g.ttfb || 'N/A'}ms | ${m3g.js || 'N/A'}kB | ${m3g.css || 'N/A'}kB | ${m3g.total || 'N/A'}kB`);
}
