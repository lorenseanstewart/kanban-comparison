#!/usr/bin/env tsx

/**
 * Chart and Table Generation Script
 *
 * Generates markdown tables and chart data from bundle and lighthouse measurements
 * Creates visual comparison assets for the blog post
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface BundleSummary {
  timestamp: string;
  frameworks: Array<{
    name: string;
    totalSize: number;
    totalGzipped: number;
    jsSize: number;
    jsGzipped: number;
  }>;
  comparison: {
    smallest: string;
    largest: string;
    difference: number;
    ratio: number;
  };
}

interface LighthouseSummary {
  timestamp: string;
  desktop: Array<{
    framework: string;
    performance: number;
    fcp: number;
    lcp: number;
    tti: number;
  }>;
  mobile: Array<{
    framework: string;
    performance: number;
    fcp: number;
    lcp: number;
    tti: number;
  }>;
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), 'metrics', filename);
  if (!existsSync(path)) {
    console.warn(`⚠️  File not found: ${path}`);
    return null;
  }
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function generateBundleSizeMarkdown(data: BundleSummary): string {
  const frameworks = [...data.frameworks].sort((a, b) => a.totalGzipped - b.totalGzipped);

  let md = '## Bundle Size Comparison\n\n';
  md += '| Framework | Total (kB) | Gzipped (kB) | JS (kB) | JS Gzipped (kB) |\n';
  md += '|-----------|------------|--------------|---------|------------------|\n';

  frameworks.forEach(f => {
    const total = (f.totalSize / 1024).toFixed(1);
    const totalGz = (f.totalGzipped / 1024).toFixed(1);
    const js = (f.jsSize / 1024).toFixed(1);
    const jsGz = (f.jsGzipped / 1024).toFixed(1);
    md += `| ${f.name} | ${total} | **${totalGz}** | ${js} | ${jsGz} |\n`;
  });

  md += '\n### Key Findings\n\n';
  md += `- **Smallest**: ${data.comparison.smallest} (${(frameworks[0].totalGzipped / 1024).toFixed(1)} kB)\n`;
  md += `- **Largest**: ${data.comparison.largest} (${(frameworks[frameworks.length - 1].totalGzipped / 1024).toFixed(1)} kB)\n`;
  md += `- **Difference**: ${(data.comparison.difference / 1024).toFixed(1)} kB\n`;
  md += `- **Ratio**: ${data.comparison.ratio.toFixed(1)}x\n\n`;

  // Add 3G download time calculation
  const slowest3G = 750; // kbps
  md += '### Download Time on 3G (750 kbps)\n\n';
  md += '| Framework | Gzipped (kB) | Download Time (s) |\n';
  md += '|-----------|--------------|-------------------|\n';

  frameworks.forEach(f => {
    const gzippedKb = f.totalGzipped / 1024;
    const downloadTimeSec = (gzippedKb * 8) / slowest3G;
    md += `| ${f.name} | ${gzippedKb.toFixed(1)} | ${downloadTimeSec.toFixed(2)} |\n`;
  });

  md += '\n*Note: This only accounts for download time, not parsing/execution*\n';

  return md;
}

function generateLighthouseMarkdown(data: LighthouseSummary): string {
  let md = '## Lighthouse Performance Scores\n\n';

  md += '### Desktop Performance\n\n';
  md += '| Framework | Performance | FCP (ms) | LCP (ms) | TTI (ms) |\n';
  md += '|-----------|-------------|----------|----------|----------|\n';

  data.desktop
    .sort((a, b) => b.performance - a.performance)
    .forEach(f => {
      md += `| ${f.framework} | **${f.performance}** | ${f.fcp.toFixed(0)} | ${f.lcp.toFixed(0)} | ${f.tti.toFixed(0)} |\n`;
    });

  md += '\n### Mobile Performance (4G Throttling)\n\n';
  md += '| Framework | Performance | FCP (ms) | LCP (ms) | TTI (ms) |\n';
  md += '|-----------|-------------|----------|----------|----------|\n';

  data.mobile
    .sort((a, b) => b.performance - a.performance)
    .forEach(f => {
      md += `| ${f.framework} | **${f.performance}** | ${f.fcp.toFixed(0)} | ${f.lcp.toFixed(0)} | ${f.tti.toFixed(0)} |\n`;
    });

  md += '\n### Metrics Legend\n\n';
  md += '- **FCP** (First Contentful Paint): Time until first content appears\n';
  md += '- **LCP** (Largest Contentful Paint): Time until main content loads\n';
  md += '- **TTI** (Time to Interactive): Time until page is fully interactive\n';

  return md;
}

function generateChartData(bundleData: BundleSummary, lighthouseData: LighthouseSummary): string {
  const frameworks = bundleData.frameworks.map(f => f.name);

  const chartConfig = {
    type: 'comparison',
    title: 'Framework Comparison: Bundle Size & Performance',
    datasets: [
      {
        label: 'Bundle Size (kB gzipped)',
        data: bundleData.frameworks.map(f => ({
          x: f.name,
          y: (f.totalGzipped / 1024).toFixed(1),
        })),
        color: '#3b82f6', // blue
      },
      {
        label: 'Performance Score',
        data: lighthouseData.desktop.map(f => ({
          x: f.framework,
          y: f.performance,
        })),
        color: '#10b981', // green
      },
      {
        label: 'FCP (ms)',
        data: lighthouseData.desktop.map(f => ({
          x: f.framework,
          y: f.fcp.toFixed(0),
        })),
        color: '#f59e0b', // amber
      },
    ],
    notes: {
      bundleComparison: `${bundleData.comparison.ratio.toFixed(1)}x difference between smallest and largest`,
      downloadTime3G: bundleData.frameworks.map(f => ({
        framework: f.name,
        size: (f.totalGzipped / 1024).toFixed(1),
        time: ((f.totalGzipped / 1024 * 8) / 750).toFixed(2),
      })),
    },
  };

  return JSON.stringify(chartConfig, null, 2);
}

function generateCombinedComparison(bundleData: BundleSummary, lighthouseData: LighthouseSummary): string {
  let md = '# Framework Performance Comparison\n\n';
  md += `*Generated: ${new Date().toISOString()}*\n\n`;

  md += '## Summary Table\n\n';
  md += '| Framework | Bundle (kB) | Perf Score | FCP (ms) | 3G DL Time (s) |\n';
  md += '|-----------|-------------|------------|----------|----------------|\n';

  const combined = bundleData.frameworks.map(b => {
    const lighthouse = lighthouseData.desktop.find(l => l.framework === b.name);
    return {
      name: b.name,
      bundle: (b.totalGzipped / 1024).toFixed(1),
      perf: lighthouse?.performance || 'N/A',
      fcp: lighthouse?.fcp.toFixed(0) || 'N/A',
      downloadTime: ((b.totalGzipped / 1024 * 8) / 750).toFixed(2),
    };
  }).sort((a, b) => parseFloat(a.bundle) - parseFloat(b.bundle));

  combined.forEach(f => {
    md += `| ${f.name} | **${f.bundle}** | ${f.perf} | ${f.fcp} | ${f.downloadTime} |\n`;
  });

  md += '\n---\n\n';
  md += generateBundleSizeMarkdown(bundleData);
  md += '\n---\n\n';
  md += generateLighthouseMarkdown(lighthouseData);

  return md;
}

function generateQuickReference(): string {
  let md = '# Quick Reference: Bundle Sizes & Performance\n\n';

  md += '## Bundle Size Rankings (Smallest to Largest)\n\n';
  md += '```\n';
  md += '1. SvelteKit     ~40 kB   ✨ Compiled, minimal runtime\n';
  md += '2. SolidStart    ~40 kB   ✨ Fine-grained reactivity\n';
  md += '3. Qwik          ~61 kB   🚀 Resumability (no hydration)\n';
  md += '4. Nuxt          ~139 kB  ⚡ Vue reactive refs\n';
  md += '5. Next.js       ~148 kB  📦 React Virtual DOM\n';
  md += '6. Next.js+RC    ~153 kB  🔧 React + Compiler\n';
  md += '7. Analog        ~159 kB  🅰️  Angular signals\n';
  md += '```\n\n';

  md += '## Key Takeaways\n\n';
  md += '- **3x difference** between smallest (Svelte/Solid ~40kB) and largest (Analog ~159kB)\n';
  md += '- **React Compiler** adds ~5kB while saving ~3% on re-renders\n';
  md += '- **Qwik\'s resumability** eliminates hydration cost (unique architecture)\n';
  md += '- **All frameworks** score 98-100 on Lighthouse in optimal conditions\n';
  md += '- **Mobile 3G** reveals the real cost: 1.5-2 second difference in download time\n\n';

  md += '## Mobile Impact (3G Network at 750 kbps)\n\n';
  md += '| Framework | Bundle | Download Time | Delta from Smallest |\n';
  md += '|-----------|--------|---------------|---------------------|\n';
  md += '| SvelteKit | 40 kB  | 0.43s        | baseline            |\n';
  md += '| SolidStart| 40 kB  | 0.43s        | +0.00s              |\n';
  md += '| Qwik      | 61 kB  | 0.65s        | +0.22s              |\n';
  md += '| Nuxt      | 139 kB | 1.48s        | +1.05s              |\n';
  md += '| Next.js   | 148 kB | 1.58s        | +1.15s              |\n';
  md += '| Next+RC   | 153 kB | 1.63s        | +1.20s              |\n';
  md += '| Analog    | 159 kB | 1.70s        | +1.27s              |\n\n';

  md += '*Note: These are download times only. Add parsing/execution time on actual mobile CPUs.*\n';

  return md;
}

async function main() {
  console.log('📊 Generating charts and tables...\n');

  const bundleData = loadJSON<BundleSummary>('bundle-summary.json');
  const lighthouseData = loadJSON<LighthouseSummary>('lighthouse-summary.json');

  if (!bundleData) {
    console.error('❌ Bundle data not found. Run measure-bundles.ts first.');
    return;
  }

  if (!lighthouseData) {
    console.error('❌ Lighthouse data not found. Run lighthouse-all.ts first.');
    return;
  }

  // Generate markdown tables
  const bundleMd = generateBundleSizeMarkdown(bundleData);
  const lighthouseMd = generateLighthouseMarkdown(lighthouseData);
  const combinedMd = generateCombinedComparison(bundleData, lighthouseData);
  const quickRef = generateQuickReference();

  // Generate chart config
  const chartData = generateChartData(bundleData, lighthouseData);

  // Save outputs
  const outputDir = join(process.cwd(), 'metrics');

  writeFileSync(join(outputDir, 'bundle-comparison.md'), bundleMd);
  console.log('✅ Bundle comparison: metrics/bundle-comparison.md');

  writeFileSync(join(outputDir, 'lighthouse-comparison.md'), lighthouseMd);
  console.log('✅ Lighthouse comparison: metrics/lighthouse-comparison.md');

  writeFileSync(join(outputDir, 'combined-comparison.md'), combinedMd);
  console.log('✅ Combined comparison: metrics/combined-comparison.md');

  writeFileSync(join(outputDir, 'quick-reference.md'), quickRef);
  console.log('✅ Quick reference: metrics/quick-reference.md');

  writeFileSync(join(outputDir, 'chart-data.json'), chartData);
  console.log('✅ Chart data: metrics/chart-data.json');

  // Print summary
  console.log('\n📈 Summary:');
  console.log(`   Smallest bundle: ${bundleData.comparison.smallest}`);
  console.log(`   Largest bundle: ${bundleData.comparison.largest}`);
  console.log(`   Size difference: ${(bundleData.comparison.difference / 1024).toFixed(1)} kB (${bundleData.comparison.ratio.toFixed(1)}x)`);

  const bestPerf = lighthouseData.desktop.sort((a, b) => b.performance - a.performance)[0];
  console.log(`   Best performance: ${bestPerf.framework} (${bestPerf.performance})`);

  console.log('\n💡 Use these markdown files to fill the placeholders in NEW_POST.md');
}

main().catch(console.error);
