import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    ssr: { external: ["drizzle-orm"] },
    plugins: [tailwindcss()]
  },
});
