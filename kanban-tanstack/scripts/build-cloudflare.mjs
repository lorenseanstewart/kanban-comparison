import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, rmSync, existsSync, cpSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('Building for Cloudflare Pages...');

console.log('Step 1: Running standard TanStack Start build...');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

console.log('Step 2: Bundling Worker with Vite + inlineDynamicImports...');

// Create a temporary entry point that exports in Cloudflare Workers format
const entryContent = `
import server from './server/server.js';

export default {
  async fetch(request, env, ctx) {
    // Make env available via process.env for compatibility
    const proc = globalThis['process'] || (globalThis['process'] = { env: {} });
    proc.env = env;

    // Serve static assets using Cloudflare Pages ASSETS binding
    const url = new URL(request.url);
    if (url.pathname.startsWith('/assets/') ||
        url.pathname.startsWith('/android-chrome-') ||
        url.pathname.startsWith('/apple-touch-icon') ||
        url.pathname.startsWith('/favicon') ||
        url.pathname === '/site.webmanifest') {
      try {
        if (env.ASSETS) {
          return await env.ASSETS.fetch(request);
        }
      } catch (e) {
        // Fall through to server if ASSETS binding fails
      }
    }

    return server.fetch(request, env, ctx);
  }
};
`;

const tempEntryPath = join(root, 'dist/_worker-entry.js');
writeFileSync(tempEntryPath, entryContent);

// Build the worker with Vite - WITHOUT TanStack Start plugins
await build({
  root,
  configFile: false,
  define: {
    'process.env': 'process.env',
  },
  build: {
    ssr: true,
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: tempEntryPath,
      output: {
        entryFileNames: '_worker.js',
        format: 'esm',
        inlineDynamicImports: true,
      },
      external: (id) => {
        return id.startsWith('node:') ||
               id === 'async_hooks' ||
               id === 'stream' ||
               id === 'react' ||
               id === 'react-dom' ||
               id === 'react/jsx-runtime' ||
               id.startsWith('react/');
      },
    },
  },
  ssr: {
    target: 'webworker',
    noExternal: true,
  },
});

console.log('Step 3: Cleaning up temporary files...');
rmSync(tempEntryPath);

const clientWranglerPath = join(root, 'dist/client/wrangler.json');
if (existsSync(clientWranglerPath)) {
  rmSync(clientWranglerPath);
  console.log('  Removed dist/client/wrangler.json');
}

const wranglerDeployPath = join(root, '.wrangler/deploy');
if (existsSync(wranglerDeployPath)) {
  rmSync(wranglerDeployPath, { recursive: true });
  console.log('  Removed .wrangler/deploy cache');
}

console.log('Step 4: Copying client assets...');
const pagesDir = join(root, 'dist/pages');
if (existsSync(pagesDir)) {
  rmSync(pagesDir, { recursive: true });
}

cpSync(join(root, 'dist/client'), pagesDir, { recursive: true });
cpSync(join(root, 'dist/_worker.js'), join(pagesDir, '_worker.js'));

console.log('Step 5: Creating wrangler.json...');
const wranglerConfig = {
  name: "kanban-tanstack",
  compatibility_date: "2025-11-07",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: [
    {
      binding: "DB",
      database_name: "kanban-db",
      database_id: "58c3811a-0dfd-4f17-8d1a-16bb8fada81b" // Using same D1 database as kanban-tanstack-solid
    }
  ]
};
writeFileSync(join(pagesDir, 'wrangler.json'), JSON.stringify(wranglerConfig, null, 2));

console.log('✓ Cloudflare Pages build complete');
console.log('\nDeploy with: wrangler pages deploy dist/pages --project-name=kanban-tanstack');
