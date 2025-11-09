import { defineConfig } from "@solidjs/start/config";
import type { Plugin } from "vite";

// Plugin to prevent CSS from being emitted as separate files
// since we're inlining it in app.tsx
function suppressCssOutput(): Plugin {
  return {
    name: "suppress-css-output",
    enforce: "post",
    apply: "build", // Only apply during production build, not dev
    generateBundle(_, bundle) {
      // Remove CSS files from the bundle
      for (const fileName in bundle) {
        if (fileName.endsWith(".css")) {
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig({
  server: {
    preset: "vercel",
  },
  vite: {
    plugins: [suppressCssOutput()],
    optimizeDeps: {
      esbuildOptions: {
        treeShaking: true, // Enable tree-shaking for dependencies
      },
      exclude: ["lightningcss", "fsevents"],
    },
    ssr: {
      external: ["drizzle-orm"],
      noExternal: ["@thisbeyond/solid-dnd"],
    },
    build: {
      cssCodeSplit: false,
      cssMinify: true,
      minify: 'terser', // Use terser for better minification
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true, // Remove debugger statements
        },
      },
      rollupOptions: {
        treeshake: {
          preset: 'recommended', // Enable aggressive tree-shaking
        },
      },
    },
  },
});
