/// <reference types="vitest" />

import { defineConfig, type Plugin, type HtmlTagDescriptor } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

function inlineCss(): Plugin {
  return {
    name: "inline-css",
    enforce: "post",
    apply: "build",
    transformIndexHtml(html, ctx) {
      const htmlTagDescriptors: HtmlTagDescriptor[] = [];
      const bundle = ctx.bundle;
      if (bundle == null) {
        return [];
      }

      let stylesToInline: Record<string, string> = {};

      for (const chunk of Object.values(bundle)) {
        if (chunk.fileName.endsWith(".css")
          && chunk.type === "asset"
          && typeof chunk.source === "string"
        ) {
          stylesToInline[chunk.fileName] = chunk.source;
        }
      }

      const combinedStyle = Object.values(stylesToInline).join(" ");

      htmlTagDescriptors.push({
        tag: "style",
        children: combinedStyle,
        injectTo: "head",
      });

      const htmlWithoutLinks = html
        .replaceAll(/<link\s+rel="stylesheet"(\s.*\s)href="(.*)\.css">/gi, "");

      return {
        html: htmlWithoutLinks,
        tags: htmlTagDescriptors,
      };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
    cssCodeSplit: false, // Bundle all CSS into one file for inlining
    cssMinify: true, // Minify CSS
    assetsInlineLimit: 100000, // Inline CSS files smaller than 100KB
    rollupOptions: {
      treeshake: {
        preset: 'recommended', // Enable aggressive tree-shaking
      },
      output: {
        manualChunks: undefined, // Prevent unnecessary chunking
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      treeShaking: true, // Enable tree-shaking for dependencies
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
    inlineCss(),
  ],
}));
