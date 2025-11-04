import { cpSync, mkdirSync, existsSync, rmSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

// Clean and create dist/pages directory
const pagesDir = `${root}/dist/pages`;
if (existsSync(pagesDir)) {
  rmSync(pagesDir, { recursive: true });
}
mkdirSync(pagesDir, { recursive: true });

// Copy client assets
console.log('Copying client assets...');
cpSync(`${root}/dist/client`, pagesDir, { recursive: true });

// Copy server assets and worker files
console.log('Copying server files...');
cpSync(`${root}/dist/server/assets`, `${pagesDir}/assets`, { recursive: true });

// Copy server.js (needed by assets)
console.log('Copying server.js...');
cpSync(`${root}/dist/server/server.js`, `${pagesDir}/server.js`);

// Create _worker.js as entry point
console.log('Creating _worker.js...');
cpSync(`${root}/dist/server/server.js`, `${pagesDir}/_worker.js`);

// Create wrangler.json with Pages-compatible configuration
console.log('Creating wrangler.json...');
const wranglerConfig = {
  name: "kanban-tanstack",
  compatibility_date: "2025-01-01",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: [
    {
      binding: "DB",
      database_name: "kanban-db",
      database_id: "58c3811a-0dfd-4f17-8d1a-16bb8fada81b"
    }
  ]
};
writeFileSync(`${pagesDir}/wrangler.json`, JSON.stringify(wranglerConfig, null, 2));

console.log('✓ Pages build complete: dist/pages');
