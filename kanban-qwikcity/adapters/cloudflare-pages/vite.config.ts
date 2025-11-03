import { extendConfig } from "@builder.io/qwik-city/vite";
import { cloudflarePagesAdapter } from "@builder.io/qwik-city/adapters/cloudflare-pages/vite";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.cloudflare-pages.tsx", "@qwik-city-plan"],
      },
      outDir: ".cloudflare",
    },
    plugins: [
      cloudflarePagesAdapter(),
    ],
  };
});
