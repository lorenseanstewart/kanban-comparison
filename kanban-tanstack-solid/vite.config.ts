import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteSolid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3008,
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
  optimizeDeps: {
    esbuildOptions: {
      treeShaking: true, // Enable tree-shaking for dependencies
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    viteSolid({ ssr: true }),
    tailwindcss(),
  ],
});
