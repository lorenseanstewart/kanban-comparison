#!/usr/bin/env tsx

/**
 * Generate Charts Script
 *
 * Generates SVG charts from the final-measurements.json file.
 * Creates bundle size comparison charts for both home and board pages.
 *
 * Usage: tsx scripts/generate-charts.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
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
}

interface FinalMeasurements {
  metadata: {
    timestamp: string;
    frameworkCount: number;
    runsPerPage: number;
    measurementType: string;
    networkCondition: string;
    chromeVersion: string;
  };
  results: AggregatedStats[];
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#84cc16', // lime
  '#f97316', // orange
];

function generateBarChart(
  data: Array<{ framework: string; value: number }>,
  title: string,
  subtitle: string,
  outputPath: string,
  metric: 'size' | 'vitals' = 'size'
): void {
  const width = 800;
  const height = 500;
  const margin = { top: 60, right: 50, bottom: 120, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const maxScale = Math.ceil(maxValue * 1.1); // Add 10% padding

  // Calculate bar width
  const barWidth = Math.min(52, chartWidth / data.length - 13);
  const barSpacing = chartWidth / data.length;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="system-ui, -apple-system, sans-serif">\n`;
  svg += `  <!-- Background -->\n`;
  svg += `  <rect width="${width}" height="${height}" fill="#ffffff"/>\n\n`;

  // Title
  svg += `  <!-- Title -->\n`;
  svg += `  <text x="${width / 2}" y="30" text-anchor="middle" font-size="20" font-weight="600" fill="#1f2937">\n`;
  svg += `    ${title}\n`;
  svg += `  </text>\n`;
  svg += `  <text x="${width / 2}" y="48" text-anchor="middle" font-size="12" fill="#6b7280">\n`;
  svg += `    ${subtitle}\n`;
  svg += `  </text>\n\n`;

  // Chart area
  svg += `  <!-- Chart area -->\n`;
  svg += `  <g transform="translate(${margin.left}, ${margin.top})">\n\n`;

  // Grid lines and labels
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = chartHeight - (chartHeight / gridLines) * i;
    const value = (maxScale / gridLines) * i;
    const label = metric === 'size' ? `${Math.round(value / 1024)} kB` : `${Math.round(value)} ms`;

    svg += `    <line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>\n`;
    svg += `    <text x="-10" y="${y}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">${label}</text>\n`;
  }
  svg += '\n';

  // Bars
  data.forEach((item, index) => {
    const barHeight = (item.value / maxScale) * chartHeight;
    const x = index * barSpacing + (barSpacing - barWidth) / 2;
    const y = chartHeight - barHeight;
    const color = COLORS[index % COLORS.length];

    // Gradient definition
    svg += `    <defs>\n`;
    svg += `      <linearGradient id="grad${index}" x1="0%" y1="0%" x2="0%" y2="100%">\n`;
    svg += `        <stop offset="0%" style="stop-color:${color};stop-opacity:0.9" />\n`;
    svg += `        <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />\n`;
    svg += `      </linearGradient>\n`;
    svg += `    </defs>\n`;

    // Bar
    svg += `    <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="url(#grad${index})" rx="4"/>\n`;

    // Value label above bar
    const valueLabel = metric === 'size'
      ? (item.value / 1024).toFixed(1)
      : item.value.toFixed(0);
    svg += `    <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="12" font-weight="600" fill="#1f2937">${valueLabel}</text>\n`;

    // Framework label (rotated)
    svg += `    <text x="${x + barWidth / 2}" y="${chartHeight + 15}" text-anchor="end" font-size="11" fill="#374151" transform="rotate(-45, ${x + barWidth / 2}, ${chartHeight + 15})">${item.framework}</text>\n`;
  });

  svg += `  </g>\n`;
  svg += `</svg>\n`;

  writeFileSync(outputPath, svg);
  console.error(`   ✅ Generated: ${outputPath}`);
}

function generateComparisonChart(
  data: Array<{ framework: string; compressed: number; raw: number }>,
  title: string,
  subtitle: string,
  outputPath: string
): void {
  const width = 800;
  const height = 500;
  const margin = { top: 60, right: 50, bottom: 120, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Find max value for scaling (use raw size)
  const maxValue = Math.max(...data.map(d => d.raw));
  const maxScale = Math.ceil(maxValue * 1.1);

  // Calculate bar width (grouped bars)
  const groupWidth = chartWidth / data.length;
  const barWidth = Math.min(24, groupWidth / 2.5);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="system-ui, -apple-system, sans-serif">\n`;
  svg += `  <!-- Background -->\n`;
  svg += `  <rect width="${width}" height="${height}" fill="#ffffff"/>\n\n`;

  // Title
  svg += `  <!-- Title -->\n`;
  svg += `  <text x="${width / 2}" y="30" text-anchor="middle" font-size="20" font-weight="600" fill="#1f2937">\n`;
  svg += `    ${title}\n`;
  svg += `  </text>\n`;
  svg += `  <text x="${width / 2}" y="48" text-anchor="middle" font-size="12" fill="#6b7280">\n`;
  svg += `    ${subtitle}\n`;
  svg += `  </text>\n\n`;

  // Legend
  svg += `  <!-- Legend -->\n`;
  svg += `  <rect x="${width - 200}" y="60" width="15" height="15" fill="#3b82f6" rx="2"/>\n`;
  svg += `  <text x="${width - 180}" y="72" font-size="11" fill="#374151">Compressed</text>\n`;
  svg += `  <rect x="${width - 200}" y="80" width="15" height="15" fill="#8b5cf6" rx="2"/>\n`;
  svg += `  <text x="${width - 180}" y="92" font-size="11" fill="#374151">Raw</text>\n\n`;

  // Chart area
  svg += `  <!-- Chart area -->\n`;
  svg += `  <g transform="translate(${margin.left}, ${margin.top})">\n\n`;

  // Grid lines
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = chartHeight - (chartHeight / gridLines) * i;
    const value = (maxScale / gridLines) * i;
    const label = `${Math.round(value / 1024)} kB`;

    svg += `    <line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>\n`;
    svg += `    <text x="-10" y="${y}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">${label}</text>\n`;
  }
  svg += '\n';

  // Grouped bars
  data.forEach((item, index) => {
    const groupX = index * groupWidth;
    const centerX = groupX + groupWidth / 2;

    // Compressed bar (left)
    const compressedHeight = (item.compressed / maxScale) * chartHeight;
    const compressedY = chartHeight - compressedHeight;
    const compressedX = centerX - barWidth - 2;

    svg += `    <rect x="${compressedX}" y="${compressedY}" width="${barWidth}" height="${compressedHeight}" fill="#3b82f6" opacity="0.8" rx="3"/>\n`;
    svg += `    <text x="${compressedX + barWidth / 2}" y="${compressedY - 8}" text-anchor="middle" font-size="10" font-weight="600" fill="#1f2937">${(item.compressed / 1024).toFixed(1)}</text>\n`;

    // Raw bar (right)
    const rawHeight = (item.raw / maxScale) * chartHeight;
    const rawY = chartHeight - rawHeight;
    const rawX = centerX + 2;

    svg += `    <rect x="${rawX}" y="${rawY}" width="${barWidth}" height="${rawHeight}" fill="#8b5cf6" opacity="0.8" rx="3"/>\n`;
    svg += `    <text x="${rawX + barWidth / 2}" y="${rawY - 8}" text-anchor="middle" font-size="10" font-weight="600" fill="#1f2937">${(item.raw / 1024).toFixed(1)}</text>\n`;

    // Framework label
    svg += `    <text x="${centerX}" y="${chartHeight + 15}" text-anchor="end" font-size="11" fill="#374151" transform="rotate(-45, ${centerX}, ${chartHeight + 15})">${item.framework}</text>\n`;
  });

  svg += `  </g>\n`;
  svg += `</svg>\n`;

  writeFileSync(outputPath, svg);
  console.error(`   ✅ Generated: ${outputPath}`);
}

async function main() {
  const metricsDir = join(process.cwd(), 'metrics');
  const dataPath = join(metricsDir, 'final-measurements.json');

  if (!existsSync(dataPath)) {
    console.error('❌ Error: final-measurements.json not found');
    console.error('   Please run aggregate-measurements.ts first');
    process.exit(1);
  }

  console.error('\n📊 Generating bundle size comparison chart...\n');

  const data: FinalMeasurements = JSON.parse(readFileSync(dataPath, 'utf-8'));

  // Use board page results (sorted by compressed size)
  const boardResults = data.results
    .filter(r => r.page === 'board')
    .sort((a, b) => a.jsTransferred.median - b.jsTransferred.median);

  // Generate the single comparison chart
  generateComparisonChart(
    boardResults.map(r => ({
      framework: r.framework,
      compressed: r.jsTransferred.median,
      raw: r.jsUncompressed.median
    })),
    'JavaScript Bundle Size Comparison',
    'Board page • Compressed vs Raw • Smaller is better',
    join(metricsDir, 'bundle-size-comparison.svg')
  );

  console.error('\n✅ Chart generated successfully!\n');
}

main().catch(console.error);
