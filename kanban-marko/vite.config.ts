import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import adapter from "@marko/run/adapter";

export default defineConfig({
  plugins: [
    marko({
      adapter: adapter(),
    }),
  ],
  ssr: {
    external: ["better-sqlite3", "drizzle-orm/better-sqlite3"],
    noExternal: [],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
