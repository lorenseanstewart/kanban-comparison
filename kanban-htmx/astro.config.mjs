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
    runtime: {
      mode: "local",
      type: "pages",
    },
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
        output: {
          manualChunks: undefined,
        },
        external: ["better-sqlite3", "drizzle-orm/better-sqlite3"],
      },
    },
    ssr: {
      external: ["better-sqlite3", "drizzle-orm/better-sqlite3"],
      noExternal: [],
    },
  },
});
