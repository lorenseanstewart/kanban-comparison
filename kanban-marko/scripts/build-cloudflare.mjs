import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, rmSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('Building for Cloudflare Pages...');

// First build with marko-run
console.log('Step 1: Running marko-run build...');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

console.log('Step 2: Building Cloudflare Worker entry...');

// Read the index.mjs and remove the dynamic import to better-sqlite3
const indexPath = join(root, 'dist/index.mjs');
let indexContent = readFileSync(indexPath, 'utf-8');

// Replace the dynamic import to local database with a throw
indexContent = indexContent.replace(
  /const { getDatabase: getLocalDatabase } = await import\('\.\/[^']+\.js'\);/g,
  'const getLocalDatabase = () => { throw new Error("Local SQLite not available in Cloudflare Workers"); };'
);

// Export the fetch function for the Cloudflare Worker
indexContent = indexContent.replace(
  /export { schema as s };/,
  'export { schema as s, fetch };'
);

writeFileSync(indexPath, indexContent);

// Build the worker
await build({
  root,
  build: {
    ssr: true,
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/entry.cloudflare.ts',
      output: {
        entryFileNames: '_worker.js',
        format: 'esm',
        inlineDynamicImports: true, // Inline everything into one file
      },
    },
  },
  resolve: {
    alias: {
      '@marko/run/router': join(root, 'dist/index.mjs'),
    },
  },
  ssr: {
    target: 'webworker',
    external: ['better-sqlite3', 'drizzle-orm/better-sqlite3'],
  },
});

// Remove the better-sqlite3 chunk files
console.log('Step 3: Cleaning up Node.js-specific files...');
const files = ['_CIhK7HE9.js', '_BA_G8cDY.js'];
for (const file of files) {
  try {
    rmSync(join(root, 'dist', file));
    console.log(`  Removed ${file}`);
  } catch (e) {
    // File might not exist, that's okay
  }
}

console.log('✓ Cloudflare Pages build complete');
console.log('\nDeploy with: wrangler pages deploy dist --project-name=kanban-marko');
