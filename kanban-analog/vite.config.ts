/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
    cssCodeSplit: false, // Bundle all CSS into one file for inlining
    cssMinify: true, // Minify CSS
    assetsInlineLimit: 100000, // Inline CSS files smaller than 100KB
    rollupOptions: {
      output: {
        manualChunks: undefined, // Prevent unnecessary chunking
      },
    },
  },
  css: {
    transformer: 'postcss', // Use PostCSS instead of lightningcss for better DaisyUI compatibility
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      ssr: true,
      prerender: {
        routes: async () => [],
      },
      nitro: {
        preset: 'vercel',
        minify: false,
        compressPublicAssets: true,
      },
      vite: {
        experimental: {
          supportAnalogFormat: false,
        },
      },
    }),
    tailwindcss(),
  ],
}));
