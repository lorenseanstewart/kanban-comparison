import { defineConfig } from "vite";
import marko from "@marko/run/vite";

export default defineConfig({
  plugins: [
    marko({
      // Use static adapter to generate routes but no server
      adapter: null,
    }),
  ],
  build: {
    ssr: true,
    rollupOptions: {
      input: "src/entry.cloudflare.ts",
      output: {
        entryFileNames: "_worker.js",
        format: "esm",
      },
    },
  },
  ssr: {
    target: "webworker",
    external: ["better-sqlite3", "drizzle-orm/better-sqlite3"],
    noExternal: [/@marko/],
  },
});
