/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
    minify: 'esbuild',
    cssMinify: 'esbuild', // Use esbuild for CSS minification instead of lightningcss
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group all Angular core packages together to avoid initialization issues
            if (id.includes('@angular/core') || id.includes('@angular/common') || id.includes('@angular/platform-browser')) {
              return 'angular-core';
            }
            if (
              id.includes('@angular/router') ||
              id.includes('@analogjs/router')
            ) {
              return 'angular-router';
            }
            if (id.includes('@angular/cdk')) {
              return 'angular-cdk';
            }
            if (id.includes('@analogjs/content')) {
              return 'analogjs-content';
            }
          }
        },
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
        preset: 'cloudflare-pages',
        minify: false,
        compressPublicAssets: true,
        routeRules: {
          '/': { ssr: true },
          '/board/**': { ssr: true },
        },
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
