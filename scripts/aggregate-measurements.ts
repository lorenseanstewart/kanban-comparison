#!/usr/bin/env tsx

/**
 * Aggregate Measurements Script
 *
 * Reads all individual framework JSON reports from the metrics folder
 * and generates the final measurements document (final-measurements.md).
 *
 * Usage: tsx scripts/aggregate-measurements.ts
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
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
  scriptEvaluation: StatisticalSummary;
  mainThreadWork: StatisticalSummary;
  compressionType: string;
  chromeVersion: string;
  networkCondition: string;
  cpuThrottling: string;
  measurementTimestamp: string;
}

interface FrameworkReport {
  metadata: {
    frameworkName: string;
    url: string;
    timestamp: string;
    runsPerPage: number;
    measurementType: string;
    networkCondition: string;
    cpuThrottling: string;
    chromeVersion: string;
  };
  results: AggregatedStats[];
}

function formatKB(bytes: number): string {
  return (bytes / 1024).toFixed(1);
}

function generateMarkdownTable(results: AggregatedStats[], page: 'home' | 'board'): string {
  const pageResults = results.filter(r => r.page === page);
  const sortedByBundle = [...pageResults].sort((a, b) => a.jsTransferred.median - b.jsTransferred.median);

  let markdown = `## ${page === 'home' ? 'Home Page' : 'Board Page'} Performance\n\n`;
  markdown += `Sorted by compressed bundle size (smallest first):\n\n`;
  markdown += '| Framework | Compressed (kB) | Raw (kB) | Compression | Perf Score | FCP (ms) | LCP (ms) |\n';
  markdown += '|-----------|----------------|----------|-------------|------------|----------|----------|\n';

  for (const r of sortedByBundle) {
    const compressed = `${formatKB(r.jsTransferred.median)} ±${formatKB(r.jsTransferred.stddev)}`;
    const raw = `${formatKB(r.jsUncompressed.median)} ±${formatKB(r.jsUncompressed.stddev)}`;
    const ratio = `${r.compressionRatio}%`;
    const perf = `${r.performanceScore.median} ±${r.performanceScore.stddev.toFixed(1)}`;
    const fcp = `${r.fcp.median} ±${r.fcp.stddev.toFixed(0)}`;
    const lcp = `${r.lcp.median} ±${r.lcp.stddev.toFixed(0)}`;

    markdown += `| ${r.framework} | ${compressed} | ${raw} | ${ratio} | ${perf} | ${fcp} | ${lcp} |\n`;
  }

  markdown += '\n';
  markdown += `**Explanation:**\n`;
  markdown += `- **Compressed**: Bytes transferred over network (what users actually download)\n`;
  markdown += `- **Raw**: Uncompressed bundle size (actual code volume after decompression)\n`;
  markdown += `- **Compression**: Percentage saved by compression (higher = better compression)\n`;
  markdown += `- Values show median ±std dev from ${sortedByBundle[0]?.jsTransferred.runs || 10} measurement runs\n`;
  markdown += `- Compression type: ${sortedByBundle[0]?.compressionType || 'gzip/brotli'}\n\n`;

  return markdown;
}

function generateWebVitalsTable(results: AggregatedStats[], page: 'home' | 'board'): string {
  const pageResults = results.filter(r => r.page === page);
  const sortedByPerf = [...pageResults].sort((a, b) => b.performanceScore.median - a.performanceScore.median);

  let markdown = `### ${page === 'home' ? 'Home Page' : 'Board Page'} - Core Web Vitals\n\n`;
  markdown += '| Framework | FCP (ms) | LCP (ms) | TBT (ms) | CLS | Speed Index |\n';
  markdown += '|-----------|----------|----------|----------|-----|-------------|\n';

  for (const r of sortedByPerf) {
    const fcp = `${r.fcp.median} ±${r.fcp.stddev.toFixed(0)}`;
    const lcp = `${r.lcp.median} ±${r.lcp.stddev.toFixed(0)}`;
    const tbt = `${r.tbt.median} ±${r.tbt.stddev.toFixed(0)}`;
    const cls = `${r.cls.median.toFixed(3)} ±${r.cls.stddev.toFixed(3)}`;
    const si = `${r.si.median} ±${r.si.stddev.toFixed(0)}`;

    markdown += `| ${r.framework} | ${fcp} | ${lcp} | ${tbt} | ${cls} | ${si} |\n`;
  }

  markdown += '\n';

  return markdown;
}

async function main() {
  const metricsDir = join(process.cwd(), 'metrics');

  if (!existsSync(metricsDir)) {
    console.error('❌ Error: metrics directory not found');
    console.error('   Please run measurements first using measure-single.ts');
    process.exit(1);
  }

  // Read all JSON reports from metrics folder
  const files = readdirSync(metricsDir).filter(f => f.endsWith('.json') && f !== 'final-measurements.json' && f !== 'bundle-summary.json');

  if (files.length === 0) {
    console.error('❌ Error: No measurement reports found in metrics folder');
    console.error('   Please run measurements first using measure-single.ts');
    process.exit(1);
  }

  console.error(`\n📊 Aggregating measurements from ${files.length} framework(s)...\n`);

  const allResults: AggregatedStats[] = [];
  const reportMetadata: any[] = [];

  for (const file of files) {
    const filePath = join(metricsDir, file);
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8')) as FrameworkReport;
      allResults.push(...data.results);
      reportMetadata.push(data.metadata);
      console.error(`   ✅ Loaded ${data.metadata.frameworkName} (${data.results.length} pages)`);
    } catch (error) {
      console.error(`   ⚠️  Failed to read ${file}:`, error);
    }
  }

  if (allResults.length === 0) {
    console.error('\n❌ Error: No valid results found');
    process.exit(1);
  }

  // Generate markdown report
  console.error('\n📝 Generating final measurements document...\n');

  const markdownPath = join(metricsDir, 'final-measurements.md');
  let markdown = '# Framework Performance Comparison\n\n';
  markdown += `*Generated: ${new Date().toISOString()}*\n\n`;
  markdown += `## Methodology\n\n`;
  markdown += `- **Frameworks measured**: ${files.length}\n`;
  markdown += `- **Runs per page**: ${reportMetadata[0]?.runsPerPage || 10}\n`;
  markdown += `- **Measurement type**: ${reportMetadata[0]?.measurementType || 'cold-load'} (cache cleared between runs)\n`;
  markdown += `- **Device**: Mobile (Pixel 5 emulation)\n`;
  markdown += `- **Network**: ${reportMetadata[0]?.networkCondition || '4G'}\n`;
  markdown += `- **CPU**: ${reportMetadata[0]?.cpuThrottling || 'No throttling'}\n`;
  markdown += `- **Lighthouse version**: ${reportMetadata[0]?.chromeVersion || 'unknown'}\n\n`;

  markdown += '---\n\n';
  markdown += '# Bundle Size Comparison\n\n';
  markdown += generateMarkdownTable(allResults, 'board');
  markdown += generateMarkdownTable(allResults, 'home');

  markdown += '---\n\n';
  markdown += '# Web Vitals\n\n';
  markdown += generateWebVitalsTable(allResults, 'board');
  markdown += generateWebVitalsTable(allResults, 'home');

  markdown += '---\n\n';
  markdown += '## Framework Details\n\n';
  markdown += '| Framework | URL | Last Measured |\n';
  markdown += '|-----------|-----|---------------|\n';
  for (const meta of reportMetadata) {
    markdown += `| ${meta.frameworkName} | ${meta.url} | ${new Date(meta.timestamp).toLocaleString()} |\n`;
  }
  markdown += '\n';

  writeFileSync(markdownPath, markdown);
  console.error(`✅ Markdown report: ${markdownPath}`);

  // Save aggregated JSON
  const finalJsonPath = join(metricsDir, 'final-measurements.json');
  const finalData = {
    metadata: {
      timestamp: new Date().toISOString(),
      frameworkCount: files.length,
      runsPerPage: reportMetadata[0]?.runsPerPage || 10,
      measurementType: reportMetadata[0]?.measurementType || 'cold-load',
      networkCondition: reportMetadata[0]?.networkCondition || '4G',
      chromeVersion: reportMetadata[0]?.chromeVersion || 'unknown',
    },
    results: allResults
  };

  writeFileSync(finalJsonPath, JSON.stringify(finalData, null, 2));
  console.error(`✅ JSON aggregation: ${finalJsonPath}`);

  // Generate legacy bundle-summary.json for compatibility
  const legacySummary = {
    timestamp: new Date().toISOString(),
    note: "Bundle sizes use compressed (transferred) as primary metric",
    boardPage: allResults
      .filter(r => r.page === 'board')
      .sort((a, b) => a.jsTransferred.median - b.jsTransferred.median)
      .map(r => ({
        framework: r.framework,
        jsUncompressed: r.jsUncompressed.median,
        jsTransferred: r.jsTransferred.median,
        compressionRatio: r.compressionRatio,
        requests: 0 // Not tracked
      })),
    homePage: allResults
      .filter(r => r.page === 'home')
      .sort((a, b) => a.jsTransferred.median - b.jsTransferred.median)
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

  // Print summary
  console.error('\n\n' + '='.repeat(60));
  console.error('📊 BUNDLE SIZE SUMMARY');
  console.error('='.repeat(60));

  const boardResults = allResults.filter(r => r.page === 'board')
    .sort((a, b) => a.jsTransferred.median - b.jsTransferred.median);

  console.error('\n📋 Board Page (sorted by compressed size):');
  for (const r of boardResults) {
    const compressed = formatKB(r.jsTransferred.median);
    const raw = formatKB(r.jsUncompressed.median);
    const ratio = r.compressionRatio;
    console.error(`   ${r.framework.padEnd(25)} ${compressed.padStart(6)} kB compressed (${raw.padStart(6)} kB raw, ${ratio}% compression)`);
  }

  const homeResults = allResults.filter(r => r.page === 'home')
    .sort((a, b) => a.jsTransferred.median - b.jsTransferred.median);

  console.error('\n🏠 Home Page (sorted by compressed size):');
  for (const r of homeResults) {
    const compressed = formatKB(r.jsTransferred.median);
    const raw = formatKB(r.jsUncompressed.median);
    const ratio = r.compressionRatio;
    console.error(`   ${r.framework.padEnd(25)} ${compressed.padStart(6)} kB compressed (${raw.padStart(6)} kB raw, ${ratio}% compression)`);
  }

  console.error('\n✅ Aggregation complete!\n');
}

main().catch(console.error);
