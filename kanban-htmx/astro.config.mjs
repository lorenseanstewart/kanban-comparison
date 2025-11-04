import { defineConfig } from "astro/config";
// import node from "@astrojs/node";
// Cloudflare Pages adapter (for deployment)
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  // For Cloudflare Pages deployment
  adapter: cloudflare({
    mode: "directory",
  }),
  // For local development with node adapter, uncomment below and comment out cloudflare:
  // import node from "@astrojs/node";
  // adapter: node({ mode: "middleware" }),
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
      cssMinify: true,
      rollupOptions: {
        external: ["better-sqlite3", "drizzle-orm/better-sqlite3", "url", "path"],
        output: {
          manualChunks: undefined,
        },
      },
    },
    ssr: {
      external: ["better-sqlite3", "drizzle-orm/better-sqlite3"],
      noExternal: [],
    },
  },
});
