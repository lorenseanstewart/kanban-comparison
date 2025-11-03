import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "cloudflare-pages",
  },
  vite: {
    ssr: {
      external: ["drizzle-orm"],
      noExternal: ["@thisbeyond/solid-dnd"],
    },
  },
});
