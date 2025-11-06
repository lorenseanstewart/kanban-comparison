import { extendConfig } from "@builder.io/qwik-city/vite";
import { vercelAdapter } from "@builder.io/qwik-city/adapters/vercel/vite";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.ssr.tsx", "@qwik-city-plan"],
      },
    },
    plugins: [
      vercelAdapter({
        staticGenerate: false,
      }),
    ],
  };
});
