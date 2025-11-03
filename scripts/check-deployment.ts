#!/usr/bin/env tsx

/**
 * Deployment Readiness Check Script
 *
 * Validates that all frameworks are ready for Cloudflare Pages deployment.
 * Checks builds, adapters, environment variables, and configuration.
 *
 * Usage: tsx scripts/check-deployment.ts
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface Framework {
  name: string;
  dir: string;
  buildDirs: string[];
  requiredAdapter?: {
    package: string;
    configFile: string;
    configCheck: RegExp;
  };
  envVar: string;
}

const FRAMEWORKS: Framework[] = [
  {
    name: 'Next.js',
    dir: 'kanban-nextjs',
    buildDirs: ['.next'],
    requiredAdapter: {
      package: '@cloudflare/next-on-pages',
      configFile: 'package.json',
      configCheck: /"pages:build":/
    },
    envVar: 'NEXTJS_URL'
  },
  {
    name: 'Nuxt',
    dir: 'kanban-nuxt',
    buildDirs: ['.output'],
    envVar: 'NUXT_URL'
  },
  {
    name: 'Analog',
    dir: 'kanban-analog',
    buildDirs: ['dist'],
    envVar: 'ANALOG_URL'
  },
  {
    name: 'SolidStart',
    dir: 'kanban-solidstart',
    buildDirs: ['.output'],
    envVar: 'SOLIDSTART_URL'
  },
  {
    name: 'SvelteKit',
    dir: 'kanban-sveltekit',
    buildDirs: ['.svelte-kit', 'build'],
    requiredAdapter: {
      package: '@sveltejs/adapter-cloudflare',
      configFile: 'svelte.config.js',
      configCheck: /adapter-cloudflare/
    },
    envVar: 'SVELTEKIT_URL'
  },
  {
    name: 'Qwik',
    dir: 'kanban-qwikcity',
    buildDirs: ['dist'],
    envVar: 'QWIK_URL'
  },
  {
    name: 'Astro',
    dir: 'kanban-htmx',
    buildDirs: ['dist'],
    requiredAdapter: {
      package: '@astrojs/cloudflare',
      configFile: 'astro.config.mjs',
      configCheck: /@astrojs\/cloudflare/
    },
    envVar: 'ASTRO_URL'
  },
  {
    name: 'TanStack Start',
    dir: 'kanban-tanstack',
    buildDirs: ['.output', 'dist'],
    envVar: 'TANSTACK_START_URL'
  },
  {
    name: 'TanStack Start + Solid',
    dir: 'kanban-tanstack-solid',
    buildDirs: ['.output', 'dist'],
    envVar: 'TANSTACK_START_SOLID_URL'
  },
  {
    name: 'Marko',
    dir: 'kanban-marko',
    buildDirs: ['dist', 'build'],
    envVar: 'MARKO_URL'
  },
];

interface CheckResult {
  framework: string;
  buildExists: boolean;
  adapterInstalled: boolean | 'not-required';
  adapterConfigured: boolean | 'not-required';
  envVarSet: boolean;
  ready: boolean;
  issues: string[];
}

function checkBuildExists(framework: Framework): boolean {
  const projectRoot = join(process.cwd(), framework.dir);

  for (const buildDir of framework.buildDirs) {
    if (existsSync(join(projectRoot, buildDir))) {
      return true;
    }
  }

  return false;
}

function checkAdapterInstalled(framework: Framework): boolean | 'not-required' {
  if (!framework.requiredAdapter) {
    return 'not-required';
  }

  const projectRoot = join(process.cwd(), framework.dir);
  const packageJsonPath = join(projectRoot, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return false;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  return !!allDeps[framework.requiredAdapter.package];
}

function checkAdapterConfigured(framework: Framework): boolean | 'not-required' {
  if (!framework.requiredAdapter) {
    return 'not-required';
  }

  const projectRoot = join(process.cwd(), framework.dir);
  const configPath = join(projectRoot, framework.requiredAdapter.configFile);

  if (!existsSync(configPath)) {
    return false;
  }

  const configContent = readFileSync(configPath, 'utf-8');
  return framework.requiredAdapter.configCheck.test(configContent);
}

function checkEnvVar(framework: Framework): boolean {
  return !!process.env[framework.envVar];
}

function checkFramework(framework: Framework): CheckResult {
  const buildExists = checkBuildExists(framework);
  const adapterInstalled = checkAdapterInstalled(framework);
  const adapterConfigured = checkAdapterConfigured(framework);
  const envVarSet = checkEnvVar(framework);

  const issues: string[] = [];

  if (!buildExists) {
    issues.push(`Build not found (expected: ${framework.buildDirs.join(' or ')})`);
  }

  if (adapterInstalled === false) {
    issues.push(`Adapter not installed: ${framework.requiredAdapter!.package}`);
  }

  if (adapterConfigured === false) {
    issues.push(`Adapter not configured in ${framework.requiredAdapter!.configFile}`);
  }

  if (!envVarSet) {
    issues.push(`Environment variable not set: ${framework.envVar}`);
  }

  const adapterReady = adapterInstalled !== false && adapterConfigured !== false;
  const ready = buildExists && adapterReady;

  return {
    framework: framework.name,
    buildExists,
    adapterInstalled,
    adapterConfigured,
    envVarSet,
    ready,
    issues
  };
}

function printResults(results: CheckResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 CLOUDFLARE PAGES DEPLOYMENT READINESS CHECK');
  console.log('='.repeat(80) + '\n');

  const readyCount = results.filter(r => r.ready).length;
  const withEnvVars = results.filter(r => r.envVarSet).length;

  console.log(`📊 Summary: ${readyCount}/${results.length} frameworks ready for deployment`);
  console.log(`🌐 CDN URLs: ${withEnvVars}/${results.length} environment variables set\n`);

  console.log('Framework Status:\n');

  for (const result of results) {
    const statusEmoji = result.ready ? '✅' : '❌';
    const cdnEmoji = result.envVarSet ? '🌐' : '🏠';

    console.log(`${statusEmoji} ${cdnEmoji} ${result.framework}`);

    if (result.issues.length > 0) {
      for (const issue of result.issues) {
        console.log(`     ⚠️  ${issue}`);
      }
    } else if (result.ready) {
      console.log(`     ✓ Build exists`);
      if (result.adapterInstalled !== 'not-required') {
        console.log(`     ✓ Adapter installed and configured`);
      }
      if (result.envVarSet) {
        console.log(`     ✓ CDN URL configured: ${process.env[FRAMEWORKS.find(f => f.name === result.framework)!.envVar]}`);
      } else {
        console.log(`     → Using localhost for measurements`);
      }
    }
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('Legend:');
  console.log('  ✅ = Ready for deployment');
  console.log('  ❌ = Not ready (has issues)');
  console.log('  🌐 = CDN URL configured (will use CDN for measurements)');
  console.log('  🏠 = No CDN URL (will use localhost for measurements)');
  console.log('='.repeat(80) + '\n');
}

function printRecommendations(results: CheckResult[]): void {
  const notReady = results.filter(r => !r.ready);
  const noCdnUrl = results.filter(r => !r.envVarSet);

  if (notReady.length === 0 && noCdnUrl.length === 0) {
    console.log('🎉 All frameworks are ready for deployment and have CDN URLs configured!\n');
    console.log('Next steps:');
    console.log('  1. Run measurements: npm run measure:all');
    console.log('  2. View results: cat metrics/final-measurements.md\n');
    return;
  }

  console.log('📋 RECOMMENDATIONS:\n');

  if (notReady.length > 0) {
    console.log('⚠️  Frameworks not ready for deployment:\n');

    const missingBuilds = notReady.filter(r => !r.buildExists);
    if (missingBuilds.length > 0) {
      console.log('   1. Build missing frameworks:');
      for (const result of missingBuilds) {
        const fw = FRAMEWORKS.find(f => f.name === result.framework)!;
        console.log(`      cd ${fw.dir} && npm run build`);
      }
      console.log('');
    }

    const missingAdapters = notReady.filter(r => r.adapterInstalled === false);
    if (missingAdapters.length > 0) {
      console.log('   2. Install Cloudflare adapters:');
      for (const result of missingAdapters) {
        const fw = FRAMEWORKS.find(f => f.name === result.framework)!;
        console.log(`      cd ${fw.dir} && npm install --save-dev ${fw.requiredAdapter!.package}`);
      }
      console.log('');
    }

    const notConfigured = notReady.filter(r => r.adapterConfigured === false);
    if (notConfigured.length > 0) {
      console.log('   3. Update configuration files:');
      for (const result of notConfigured) {
        const fw = FRAMEWORKS.find(f => f.name === result.framework)!;
        console.log(`      Edit ${fw.dir}/${fw.requiredAdapter!.configFile} to use Cloudflare adapter`);
      }
      console.log(`      See CLOUDFLARE_DEPLOYMENT.md for details`);
      console.log('');
    }
  }

  if (noCdnUrl.length > 0) {
    console.log('🌐 To use CDN for measurements:\n');
    console.log('   1. Deploy frameworks to Cloudflare Pages');
    console.log('   2. Copy .env.example to .env');
    console.log('   3. Fill in deployment URLs in .env\n');
    console.log('   Example:');
    for (const result of noCdnUrl.slice(0, 3)) {
      const fw = FRAMEWORKS.find(f => f.name === result.framework)!;
      console.log(`     ${fw.envVar}=https://kanban-${fw.dir.replace('kanban-', '')}.pages.dev`);
    }
    console.log(`     ... (see .env.example for all variables)\n`);
  }

  console.log('📚 Documentation:');
  console.log('   - Deployment guide: cat CLOUDFLARE_DEPLOYMENT.md');
  console.log('   - Environment setup: cat .env.example\n');
}

async function main() {
  console.log('Checking deployment readiness for all frameworks...\n');

  const results: CheckResult[] = [];

  for (const framework of FRAMEWORKS) {
    const result = checkFramework(framework);
    results.push(result);
  }

  printResults(results);
  printRecommendations(results);

  const allReady = results.every(r => r.ready);
  process.exit(allReady ? 0 : 1);
}

main().catch(console.error);
