import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
    ssr: {
      external: ["drizzle-orm", "better-sqlite3"],
      noExternal: ["@thisbeyond/solid-dnd"],
    },
  },
});
