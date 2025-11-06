import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: false, // Bundle all CSS into one file
      cssMinify: true, // Minify CSS
      assetsInlineLimit: 100000, // Inline CSS files smaller than 100KB
      rollupOptions: {
        output: {
          manualChunks: undefined, // Prevent unnecessary chunking
        },
      },
    },
    ssr: {
      noExternal: [],
    },
  },
});
