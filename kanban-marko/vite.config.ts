import { defineConfig, type Plugin, type HtmlTagDescriptor } from "vite";
import marko from "@marko/run/vite";
import adapter from "@marko/run/adapter";

function inlineCss(): Plugin {
  return {
    name: "inline-css",
    enforce: "post",
    apply: "build",
    transformIndexHtml(html, ctx) {
      const htmlTagDescriptors: HtmlTagDescriptor[] = [];
      const bundle = ctx.bundle;
      if (bundle == null) {
        return [];
      }

      let stylesToInline: Record<string, string> = {};

      for (const chunk of Object.values(bundle)) {
        if (chunk.fileName.endsWith(".css")
          && chunk.type === "asset"
          && typeof chunk.source === "string"
        ) {
          stylesToInline[chunk.fileName] = chunk.source;
        }
      }

      const combinedStyle = Object.values(stylesToInline).join(" ");

      htmlTagDescriptors.push({
        tag: "style",
        children: combinedStyle,
        injectTo: "head",
      });

      const htmlWithoutLinks = html
        .replaceAll(/<link\s+rel="stylesheet"(\s.*\s)href="(.*)\.css">/gi, "");

      return {
        html: htmlWithoutLinks,
        tags: htmlTagDescriptors,
      };
    },
  };
}

export default defineConfig({
  plugins: [
    marko({
      adapter: adapter(),
    }),
    inlineCss(),
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
