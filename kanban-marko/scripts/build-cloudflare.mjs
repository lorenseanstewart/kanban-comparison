import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, rmSync, existsSync, cpSync, readdirSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('Building for Cloudflare Pages...');

console.log('Step 1: Running standard Marko build...');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

console.log('Step 2: Patching index.mjs to remove Node.js code...');

const indexPath = join(root, 'dist/index.mjs');
let indexContent = readFileSync(indexPath, 'utf-8');

// Replace the dynamic import to local database with a throw
indexContent = indexContent.replace(
  /const { getDatabase: getLocalDatabase } = await import\('\.\/[^']+\.js'\);/g,
  'const getLocalDatabase = () => { throw new Error("Local SQLite not available in Cloudflare Workers"); };'
);

// Remove unused Node.js imports
indexContent = indexContent.replace(/import .* from ['"]compression['"];?\n?/g, '');
indexContent = indexContent.replace(/import .* from ['"]serve-static['"];?\n?/g, '');
indexContent = indexContent.replace(/import .* from ['"]zlib['"];?\n?/g, '');
indexContent = indexContent.replace(/import .* from ['"]http['"];?\n?/g, '');
indexContent = indexContent.replace(/import .* from ['"]path['"];?\n?/g, '');
indexContent = indexContent.replace(/import .* from ['"]url['"];?\n?/g, '');
indexContent = indexContent.replace(/import .* from ['"]fs['"];?\n?/g, '');

// Extract the __MARKO_MANIFEST__ definition (everything after the last semicolon)
const lastSemicolon = indexContent.lastIndexOf(';var __MARKO_MANIFEST__');
const manifest = lastSemicolon >= 0 ? indexContent.substring(lastSemicolon) : '';

// Remove/stub out all the Node.js HTTP server code at the end
// Find everything after the fetch function definition and before export
const fetchFunctionMatch = indexContent.match(/(async function fetch\(request, platform\) \{[\s\S]*?\n\})/);
if (!fetchFunctionMatch) {
  throw new Error('Could not find fetch function in index.mjs');
}

// Keep only up to the end of the fetch function, then add export and manifest
const endOfFetchIndex = indexContent.indexOf(fetchFunctionMatch[0]) + fetchFunctionMatch[0].length;
const beforeFetch = indexContent.substring(0, endOfFetchIndex);

// Add export and manifest at the end
indexContent = beforeFetch + '\n\nexport { schema as s, fetch };\n' + manifest + '\n';

writeFileSync(indexPath, indexContent);

console.log('Step 3: Building Cloudflare Worker...');

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
        inlineDynamicImports: true,
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

console.log('Step 4: Cleaning up _worker.js...');

// Remove unused imports from _worker.js
const workerPath = join(root, 'dist/_worker.js');
let workerContent = readFileSync(workerPath, 'utf-8');

workerContent = workerContent.replace(/import ['"]compression['"];?\n?/g, '');
workerContent = workerContent.replace(/import ['"]serve-static['"];?\n?/g, '');

writeFileSync(workerPath, workerContent);

console.log('Step 5: Moving static assets to dist root...');

// Move everything from dist/public/ to dist/
const publicDir = join(root, 'dist/public');
if (existsSync(publicDir)) {
  // Copy everything from public to dist root
  const items = readdirSync(publicDir);
  for (const item of items) {
    const src = join(publicDir, item);
    const dest = join(root, 'dist', item);
    cpSync(src, dest, { recursive: true });
    console.log(`  Moved ${item} to dist root`);
  }

  // Remove the public directory
  rmSync(publicDir, { recursive: true });
  console.log('  Removed public directory');
}

console.log('Step 6: Cleaning up Node.js-specific files...');
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
