import { build } from 'vite';
import marko from '@marko/run/vite';

// Build the Marko routes
await build({
  plugins: [marko({ adapter: null })],
  build: {
    ssr: true,
    outDir: 'dist',
    rollupOptions: {
      input: '.marko-run/entry.js',
      output: {
        entryFileNames: 'marko-routes.mjs',
        format: 'esm',
      },
    },
  },
  ssr: {
    target: 'webworker',
    external: ['better-sqlite3', 'drizzle-orm/better-sqlite3'],
    noExternal: true,
  },
});

// Build the Cloudflare Worker entry point
await build({
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
      external: ['./marko-routes.mjs'],
    },
  },
  ssr: {
    target: 'webworker',
    external: ['better-sqlite3', 'drizzle-orm/better-sqlite3'],
  },
});

console.log('✓ Cloudflare build complete');
