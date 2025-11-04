/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
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
