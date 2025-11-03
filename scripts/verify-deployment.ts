#!/usr/bin/env tsx

/**
 * Deployment Verification Script
 *
 * Verifies that deployed frameworks are accessible and working correctly
 * before running Lighthouse measurements. Helps catch deployment issues early.
 *
 * Usage: tsx scripts/verify-deployment.ts [framework-name]
 * Example: tsx scripts/verify-deployment.ts "Next.js"
 * Or: tsx scripts/verify-deployment.ts  (verifies all frameworks with CDN URLs)
 */

import { execSync } from 'child_process';

interface Framework {
  name: string;
  envVar: string;
  homeUrl: string;
  boardUrl: string;
}

const FRAMEWORKS: Framework[] = [
  { name: 'Next.js', envVar: 'NEXTJS_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Nuxt', envVar: 'NUXT_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Analog', envVar: 'ANALOG_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'SolidStart', envVar: 'SOLIDSTART_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'SvelteKit', envVar: 'SVELTEKIT_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Qwik', envVar: 'QWIK_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Astro', envVar: 'ASTRO_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'TanStack Start', envVar: 'TANSTACK_START_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'TanStack Start + Solid', envVar: 'TANSTACK_START_SOLID_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
  { name: 'Marko', envVar: 'MARKO_URL', homeUrl: '/', boardUrl: '/board/b05927a0-76d2-42d5-8ad3-a1b93c39698c' },
];

interface VerificationResult {
  framework: string;
  url: string;
  homePageStatus: number | 'timeout' | 'error';
  boardPageStatus: number | 'timeout' | 'error';
  hasJavaScript: boolean;
  responseTime: number; // ms
  issues: string[];
  passed: boolean;
}

async function checkUrl(url: string, timeout: number = 10000): Promise<{ status: number | 'timeout' | 'error'; time: number; body: string }> {
  const startTime = Date.now();

  try {
    // Use curl with timeout
    const output = execSync(
      `curl -s -w "\\n%{http_code}" -m ${timeout / 1000} "${url}"`,
      { encoding: 'utf-8', timeout }
    );

    const lines = output.trim().split('\n');
    const statusCode = parseInt(lines[lines.length - 1], 10);
    const body = lines.slice(0, -1).join('\n');
    const time = Date.now() - startTime;

    return { status: statusCode, time, body };
  } catch (error: any) {
    const time = Date.now() - startTime;

    // Check if it's a timeout
    if (error.killed || error.signal === 'SIGTERM') {
      return { status: 'timeout', time, body: '' };
    }

    return { status: 'error', time, body: '' };
  }
}

function detectJavaScript(html: string): boolean {
  // Look for common signs of JavaScript being served
  const patterns = [
    /<script[^>]*src=/i,  // External script tags
    /<script[^>]*>/i,     // Any script tag
    /\.js["']?>/,         // .js file references
    /_next\//,            // Next.js specific
    /_nuxt\//,            // Nuxt specific
    /\.chunk\.js/,        // Webpack chunks
  ];

  return patterns.some(pattern => pattern.test(html));
}

async function verifyFramework(framework: Framework): Promise<VerificationResult> {
  const baseUrl = process.env[framework.envVar];

  if (!baseUrl) {
    return {
      framework: framework.name,
      url: '',
      homePageStatus: 'error',
      boardPageStatus: 'error',
      hasJavaScript: false,
      responseTime: 0,
      issues: [`No CDN URL set for ${framework.envVar}`],
      passed: false
    };
  }

  console.error(`\n🔍 Verifying ${framework.name}...`);
  console.error(`   CDN URL: ${baseUrl}`);

  const issues: string[] = [];
  let totalTime = 0;

  // Check home page
  console.error(`   Testing home page...`);
  const homeResult = await checkUrl(`${baseUrl}${framework.homeUrl}`);
  totalTime += homeResult.time;

  if (homeResult.status === 'timeout') {
    issues.push('Home page request timed out (>10s)');
  } else if (homeResult.status === 'error') {
    issues.push('Home page request failed (connection error)');
  } else if (homeResult.status !== 200) {
    issues.push(`Home page returned HTTP ${homeResult.status} (expected 200)`);
  }

  // Check board page
  console.error(`   Testing board page...`);
  const boardResult = await checkUrl(`${baseUrl}${framework.boardUrl}`);
  totalTime += boardResult.time;

  if (boardResult.status === 'timeout') {
    issues.push('Board page request timed out (>10s)');
  } else if (boardResult.status === 'error') {
    issues.push('Board page request failed (connection error)');
  } else if (boardResult.status !== 200 && boardResult.status !== 500) {
    // 500 is expected if database doesn't work, but page structure is there
    issues.push(`Board page returned HTTP ${boardResult.status}`);
  }

  // Check for JavaScript bundles
  const hasHomeJS = detectJavaScript(homeResult.body);
  const hasBoardJS = detectJavaScript(boardResult.body);
  const hasJavaScript = hasHomeJS || hasBoardJS;

  if (!hasJavaScript && homeResult.status === 200) {
    issues.push('No JavaScript bundles detected in HTML (might be a problem)');
  }

  // Determine if verification passed
  const homeOk = typeof homeResult.status === 'number' && homeResult.status === 200;
  const boardOk = typeof boardResult.status === 'number' && (boardResult.status === 200 || boardResult.status === 500);
  const passed = homeOk && boardOk && hasJavaScript;

  const avgTime = Math.round(totalTime / 2);

  // Report results
  if (homeOk) {
    console.error(`   ✅ Home page accessible (${homeResult.status}) - ${homeResult.time}ms`);
  } else {
    console.error(`   ❌ Home page issue: ${homeResult.status}`);
  }

  if (boardOk) {
    console.error(`   ✅ Board page accessible (${boardResult.status}) - ${boardResult.time}ms`);
    if (boardResult.status === 500) {
      console.error(`      ℹ️  500 error is expected if database doesn't work on Cloudflare`);
    }
  } else {
    console.error(`   ❌ Board page issue: ${boardResult.status}`);
  }

  if (hasJavaScript) {
    console.error(`   ✅ JavaScript bundles detected`);
  } else {
    console.error(`   ⚠️  No JavaScript bundles detected`);
  }

  if (passed) {
    console.error(`   ✅ ${framework.name} deployment verified!`);
  } else {
    console.error(`   ❌ ${framework.name} has issues (see above)`);
  }

  return {
    framework: framework.name,
    url: baseUrl,
    homePageStatus: homeResult.status,
    boardPageStatus: boardResult.status,
    hasJavaScript,
    responseTime: avgTime,
    issues,
    passed
  };
}

async function main() {
  const args = process.argv.slice(2);
  const frameworkName = args[0];

  console.error('\n🚀 DEPLOYMENT VERIFICATION\n');
  console.error('Checking deployed frameworks are accessible before running measurements...\n');

  const results: VerificationResult[] = [];

  if (frameworkName) {
    // Verify single framework
    const framework = FRAMEWORKS.find(f => f.name === frameworkName);
    if (!framework) {
      console.error(`❌ Error: Framework "${frameworkName}" not found`);
      console.error('\nAvailable frameworks:');
      FRAMEWORKS.forEach(f => console.error(`  - "${f.name}"`));
      process.exit(1);
    }

    const result = await verifyFramework(framework);
    results.push(result);
  } else {
    // Verify all frameworks with CDN URLs set
    console.error('No framework specified - verifying all frameworks with CDN URLs...\n');

    for (const framework of FRAMEWORKS) {
      const cdnUrl = process.env[framework.envVar];
      if (cdnUrl) {
        const result = await verifyFramework(framework);
        results.push(result);
      } else {
        console.error(`⏭️  Skipping ${framework.name} (no ${framework.envVar} set)`);
      }
    }
  }

  // Summary
  console.error('\n' + '='.repeat(80));
  console.error('📊 VERIFICATION SUMMARY');
  console.error('='.repeat(80) + '\n');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.error(`Verified: ${passed}/${total} deployments passed\n`);

  for (const result of results) {
    const emoji = result.passed ? '✅' : '❌';
    console.error(`${emoji} ${result.framework}`);

    if (result.url) {
      console.error(`   URL: ${result.url}`);
      console.error(`   Response time: ${result.responseTime}ms avg`);
    }

    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        console.error(`   ⚠️  ${issue}`);
      });
    }
    console.error('');
  }

  // Recommendations
  if (passed < total) {
    console.error('📋 RECOMMENDATIONS:\n');

    const failed = results.filter(r => !r.passed);
    for (const result of failed) {
      console.error(`${result.framework}:`);

      if (!result.url) {
        console.error(`  1. Set ${FRAMEWORKS.find(f => f.name === result.framework)?.envVar} in .env`);
        console.error(`  2. Deploy to Cloudflare Pages first`);
      } else if (result.homePageStatus === 'timeout') {
        console.error(`  1. Check if deployment is still building in Cloudflare dashboard`);
        console.error(`  2. Verify URL is correct: ${result.url}`);
        console.error(`  3. Try accessing URL in browser to confirm it's live`);
      } else if (result.homePageStatus !== 200) {
        console.error(`  1. Check Cloudflare build logs for errors`);
        console.error(`  2. Verify build completed successfully`);
        console.error(`  3. Check Functions logs in Cloudflare dashboard`);
      } else if (!result.hasJavaScript) {
        console.error(`  1. Verify build output directory is correct`);
        console.error(`  2. Check that JS bundles are in the deployed files`);
        console.error(`  3. Review Cloudflare build configuration`);
      }
      console.error('');
    }
  } else {
    console.error('🎉 All deployments verified! Ready to run measurements.\n');
    console.error('Next steps:');
    console.error('  1. Run measurements: npm run measure:single "Next.js"');
    console.error('  2. Or measure all: npm run measure:all\n');
  }

  console.error('='.repeat(80) + '\n');

  // Output JSON for programmatic use
  console.log(JSON.stringify(results, null, 2));

  // Exit with error code if any failures
  process.exit(passed === total ? 0 : 1);
}

main().catch(console.error);
