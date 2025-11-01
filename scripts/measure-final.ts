#!/usr/bin/env tsx

/**
 * Final Production Measurement Script
 *
 * Runs measure-single.ts for all frameworks with statistical rigor.
 * Validates builds, generates comprehensive reports, and outputs
 * both JSON (for charts) and markdown (for blog posts).
 *
 * Usage: tsx scripts/measure-final.ts [--runs N]
 * Example: tsx scripts/measure-final.ts --runs 10
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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
  compressionRatio: number;
  performanceScore: StatisticalSummary;
  fcp: StatisticalSummary;
  lcp: StatisticalSummary;
  tbt: StatisticalSummary;
  cls: StatisticalSummary;
  si: StatisticalSummary;
  compressionType: string;
  chromeVersion: string;
  measurementTimestamp: string;
}

const FRAMEWORKS = [
  { name: 'Next.js', dir: 'kanban-nextjs', buildCheck: ['.next', 'dist'] },
  { name: 'Nuxt', dir: 'kanban-nuxt', buildCheck: ['.output', 'dist'] },
  { name: 'Analog', dir: 'kanban-analog', buildCheck: ['dist'] },
  { name: 'SolidStart', dir: 'kanban-solidstart', buildCheck: ['.output', 'dist'] },
  { name: 'SvelteKit', dir: 'kanban-sveltekit', buildCheck: ['.svelte-kit', 'build'] },
  { name: 'Qwik', dir: 'kanban-qwikcity', buildCheck: ['dist'] },
  { name: 'Astro', dir: 'kanban-htmx', buildCheck: ['dist'] },
  { name: 'TanStack Start', dir: 'kanban-tanstack', buildCheck: ['.output', 'dist'] },
  { name: 'TanStack Start + Solid', dir: 'kanban-tanstack-solid', buildCheck: ['.output', 'dist'] },
  { name: 'Marko', dir: 'kanban-marko', buildCheck: ['dist', 'build'] },
  { name: 'Datastar', dir: 'kanban-datastar', buildCheck: ['bin'] },
];

function checkBuildExists(framework: typeof FRAMEWORKS[0]): boolean {
  const projectRoot = join(process.cwd(), framework.dir);

  for (const buildDir of framework.buildCheck) {
    if (existsSync(join(projectRoot, buildDir))) {
      return true;
    }
  }

  return false;
}

function formatKB(bytes: number): string {
  return (bytes / 1024).toFixed(1);
}

function generateMarkdownTable(results: AggregatedStats[], page: 'home' | 'board'): string {
  const pageResults = results.filter(r => r.page === page);
  const sortedByBundle = [...pageResults].sort((a, b) => a.jsUncompressed.median - b.jsUncompressed.median);

  let markdown = `## ${page === 'home' ? 'Home Page' : 'Board Page'} Performance\n\n`;
  markdown += `Sorted by raw bundle size (smallest first):\n\n`;
  markdown += '| Framework | Raw (kB) | Compressed (kB) | Ratio | Perf Score | FCP (ms) | LCP (ms) |\n';
  markdown += '|-----------|----------|----------------|-------|------------|----------|----------|\n';

  for (const r of sortedByBundle) {
    const raw = `${formatKB(r.jsUncompressed.median)} ±${formatKB(r.jsUncompressed.stddev)}`;
    const compressed = `${formatKB(r.jsTransferred.median)} ±${formatKB(r.jsTransferred.stddev)}`;
    const ratio = `${r.compressionRatio}%`;
    const perf = `${r.performanceScore.median} ±${r.performanceScore.stddev.toFixed(1)}`;
    const fcp = `${r.fcp.median} ±${r.fcp.stddev.toFixed(0)}`;
    const lcp = `${r.lcp.median} ±${r.lcp.stddev.toFixed(0)}`;

    markdown += `| ${r.framework} | ${raw} | ${compressed} | ${ratio} | ${perf} | ${fcp} | ${lcp} |\n`;
  }

  markdown += '\n';
  markdown += `**Explanation:**\n`;
  markdown += `- **Raw**: Uncompressed bundle size (actual code volume, more consistent for comparison)\n`;
  markdown += `- **Compressed**: Bytes transferred over network (what users download)\n`;
  markdown += `- **Ratio**: Percentage saved by compression (higher is better compression)\n`;
  markdown += `- Values show median ±std dev from ${sortedByBundle[0]?.jsTransferred.runs || 3} measurement runs\n`;
  markdown += `- Compression type: ${sortedByBundle[0]?.compressionType || 'gzip'}\n\n`;

  return markdown;
}

async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let numRuns = 10; // Default to 10 runs for better statistical power with IQR outlier removal

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--runs' && i + 1 < args.length) {
      numRuns = parseInt(args[i + 1], 10);
      if (isNaN(numRuns) || numRuns < 1) {
        console.error('❌ Error: --runs must be a positive number');
        process.exit(1);
      }
      i++; // Skip next arg
    }
  }

  console.error('\n🚀 Final Production Measurements');
  console.error(`   Runs per page: ${numRuns}`);
  console.error(`   Frameworks: ${FRAMEWORKS.length}\n`);

  // Validate all builds exist
  console.error('📋 Validating builds...');
  const missingBuilds: string[] = [];

  for (const framework of FRAMEWORKS) {
    if (!checkBuildExists(framework)) {
      missingBuilds.push(framework.name);
      console.error(`   ❌ ${framework.name}: Build not found`);
    } else {
      console.error(`   ✅ ${framework.name}: Build found`);
    }
  }

  if (missingBuilds.length > 0) {
    console.error(`\n❌ Error: Missing builds for: ${missingBuilds.join(', ')}`);
    console.error('   Please run "npm run build" in each framework directory first.');
    process.exit(1);
  }

  console.error('\n✅ All builds validated\n');

  // Run measurements
  const allResults: AggregatedStats[] = [];
  const failedFrameworks: string[] = [];

  for (const framework of FRAMEWORKS) {
    console.error(`\n${'='.repeat(60)}`);
    console.error(`Measuring ${framework.name}...`);
    console.error(`${'='.repeat(60)}`);

    try {
      const output = execSync(`tsx scripts/measure-single.ts "${framework.name}" --runs ${numRuns}`, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
        stdio: ['pipe', 'pipe', 'inherit'] // stderr goes to console
      });

      const results: AggregatedStats[] = JSON.parse(output);
      allResults.push(...results);
    } catch (error) {
      console.error(`❌ Failed to measure ${framework.name}:`, error);
      failedFrameworks.push(framework.name);
    }
  }

  // Generate reports
  console.error('\n\n📊 Generating Reports...\n');

  // Ensure metrics directory exists
  const metricsDir = join(process.cwd(), 'metrics');
  if (!existsSync(metricsDir)) {
    mkdirSync(metricsDir, { recursive: true });
  }

  // Save JSON results
  const resultsPath = join(metricsDir, 'final-measurements.json');
  const resultsData = {
    metadata: {
      timestamp: new Date().toISOString(),
      runsPerPage: numRuns,
      measurementType: 'cold-load',
      chromeVersion: allResults[0]?.chromeVersion || 'unknown',
      compressionType: allResults[0]?.compressionType || 'gzip'
    },
    results: allResults
  };

  writeFileSync(resultsPath, JSON.stringify(resultsData, null, 2));
  console.error(`✅ JSON results: ${resultsPath}`);

  // Generate markdown tables
  const markdownPath = join(metricsDir, 'final-measurements.md');
  let markdown = '# Framework Performance Comparison\n\n';
  markdown += `*Measured: ${new Date().toISOString()}*\n\n`;
  markdown += `## Methodology\n\n`;
  markdown += `- **Runs per page**: ${numRuns}\n`;
  markdown += `- **Measurement type**: Cold-load (cache cleared between runs)\n`;
  markdown += `- **Device**: Mobile (Pixel 5 emulation)\n`;
  markdown += `- **Network**: 4G throttling (10 Mbps down, 40ms RTT)\n`;
  markdown += `- **CPU**: 1x (no throttling, to isolate bundle size impact)\n`;
  markdown += `- **Lighthouse version**: ${allResults[0]?.chromeVersion || 'unknown'}\n`;
  markdown += `- **Compression**: ${allResults[0]?.compressionType || 'gzip'}\n\n`;

  markdown += generateMarkdownTable(allResults, 'board');
  markdown += generateMarkdownTable(allResults, 'home');

  if (failedFrameworks.length > 0) {
    markdown += `## Failed Measurements\n\n`;
    markdown += `The following frameworks failed to measure: ${failedFrameworks.join(', ')}\n\n`;
  }

  writeFileSync(markdownPath, markdown);
  console.error(`✅ Markdown report: ${markdownPath}`);

  // Generate legacy format for compatibility with existing charts
  const legacySummary = {
    timestamp: new Date().toISOString(),
    note: "Bundle sizes use raw (uncompressed) as primary, compressed in parentheses",
    boardPage: allResults
      .filter(r => r.page === 'board')
      .sort((a, b) => a.jsUncompressed.median - b.jsUncompressed.median)
      .map(r => ({
        framework: r.framework,
        jsUncompressed: r.jsUncompressed.median,
        jsTransferred: r.jsTransferred.median,
        compressionRatio: r.compressionRatio,
        requests: 0 // Not tracked in new format
      })),
    homePage: allResults
      .filter(r => r.page === 'home')
      .sort((a, b) => a.jsUncompressed.median - b.jsUncompressed.median)
      .map(r => ({
        framework: r.framework,
        jsUncompressed: r.jsUncompressed.median,
        jsTransferred: r.jsTransferred.median,
        compressionRatio: r.compressionRatio,
        requests: 0
      }))
  };

  const legacyPath = join(metricsDir, 'bundle-summary.json');
  writeFileSync(legacyPath, JSON.stringify(legacySummary, null, 2));
  console.error(`✅ Legacy format: ${legacyPath}`);

  // Summary
  console.error('\n\n' + '='.repeat(60));
  console.error('📊 MEASUREMENT SUMMARY');
  console.error('='.repeat(60));

  const boardResults = allResults.filter(r => r.page === 'board')
    .sort((a, b) => a.jsUncompressed.median - b.jsUncompressed.median);

  console.error('\n📋 Board Page Bundle Sizes (smallest to largest by raw size):');
  for (const r of boardResults) {
    const raw = formatKB(r.jsUncompressed.median);
    const compressed = formatKB(r.jsTransferred.median);
    const ratio = r.compressionRatio;
    const perf = r.performanceScore.median;
    console.error(`   ${r.framework.padEnd(23)} ${raw.padStart(6)} kB raw (${compressed.padStart(5)} kB compressed, ${ratio}%) | Perf: ${perf}`);
  }

  const homeResults = allResults.filter(r => r.page === 'home')
    .sort((a, b) => a.jsUncompressed.median - b.jsUncompressed.median);

  console.error('\n🏠 Home Page Bundle Sizes (smallest to largest by raw size):');
  for (const r of homeResults) {
    const raw = formatKB(r.jsUncompressed.median);
    const compressed = formatKB(r.jsTransferred.median);
    const ratio = r.compressionRatio;
    const perf = r.performanceScore.median;
    console.error(`   ${r.framework.padEnd(23)} ${raw.padStart(6)} kB raw (${compressed.padStart(5)} kB compressed, ${ratio}%) | Perf: ${perf}`);
  }

  if (failedFrameworks.length > 0) {
    console.error(`\n❌ Failed: ${failedFrameworks.join(', ')}`);
  }

  console.error('\n✅ All measurements complete!\n');
}

main().catch(console.error);
