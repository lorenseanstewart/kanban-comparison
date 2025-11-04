import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('Building Cloudflare Worker...');

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
      },
      external: ['@marko/run/router'],
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

console.log('✓ Cloudflare Worker built successfully');
