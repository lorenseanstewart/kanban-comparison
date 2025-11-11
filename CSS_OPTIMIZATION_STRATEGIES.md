# CSS Optimization Strategies Across Frameworks

This document outlines the CSS optimization approaches used across all kanban applications to make them comparable for performance testing.

## Summary Table

| App                   | Framework              | Build Tool | CSS Strategy               | Implementation                               |
| --------------------- | ---------------------- | ---------- | -------------------------- | -------------------------------------------- |
| kanban-marko          | Marko                  | Vite       | **Full Inline**            | Vite plugin (`transformIndexHtml`)           |
| kanban-qwikcity       | Qwik                   | Vite       | **Full Inline**            | Qwik native `inlineStylesUpToBytes`          |
| kanban-tanstack       | TanStack Start (React) | Vite       | **Full Inline**            | `?inline` import + `dangerouslySetInnerHTML` |
| kanban-tanstack-solid | TanStack Start (Solid) | Vite       | **Full Inline**            | `?inline` import + `innerHTML`               |
| kanban-analog         | Analog (Angular)       | Vite       | **Full Inline**            | Vite plugin (`transformIndexHtml`)           |
| kanban-sveltekit      | SvelteKit              | Vite       | **Full Inline**            | `?inline` import + `{@html}`                 |
| kanban-solidstart     | SolidStart             | Vinxi/Vite | **Full Inline**            | `?inline` import + `innerHTML`               |
| kanban-nuxt           | Nuxt                   | Vite       | **Full Inline**            | Nuxt native `features.inlineStyles`          |
| kanban-nextjs         | Next.js App Router     | Turbopack  | **External (Recommended)** | Next.js default optimization                 |

## Implementation Details by Framework

### 1. Marko (kanban-marko)

**Strategy:** Vite Plugin with `transformIndexHtml` Hook

**Implementation:**

```typescript
// vite.config.ts
function inlineCss(): Plugin {
  return {
    name: "inline-css",
    enforce: "post",
    apply: "build",
    transformIndexHtml(html, ctx) {
      // Collect all CSS files from bundle
      // Combine into single <style> tag
      // Remove <link rel="stylesheet"> tags
    },
  };
}
```

**Why it works:** Marko generates static HTML files during build, so the Vite `transformIndexHtml` hook can process and inline CSS before deployment.

---

### 2. Qwik (kanban-qwikcity)

**Strategy:** Qwik Native `inlineStylesUpToBytes`

**Implementation:**

```typescript
// vite.config.ts
qwikVite({
  experimental: ["valibot"],
  optimizerOptions: {
    inlineStylesUpToBytes: 120000, // 120KB
  },
});
```

**Why it works:** Qwik's built-in CSS inlining operates at the bundle generation phase, compatible with both SSR and SSG builds. Works seamlessly with Qwik's resumability model.

**Why generic Vite plugin doesn't work:** Qwik uses `renderToStream()` for SSR, generating HTML dynamically. The `transformIndexHtml` hook only works on static HTML files.

---

### 3. TanStack Start - React (kanban-tanstack)

**Strategy:** Vite `?inline` Import + React `dangerouslySetInnerHTML`

**Implementation:**

```tsx
// src/routes/__root.tsx
import appCssContent from "~/styles/app.css?inline";

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{ __html: appCssContent }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Configuration:**

```typescript
// vite.config.ts
build: {
  cssCodeSplit: false,
  cssMinify: true,
}
```

**Why generic Vite plugin doesn't work:** TanStack Start uses pure SSR with no static HTML generation. The `transformIndexHtml` hook never runs.

---

### 4. TanStack Start - Solid (kanban-tanstack-solid)

**Strategy:** Vite `?inline` Import + Solid `innerHTML`

**Implementation:**

```tsx
// src/routes/__root.tsx
import appCssContent from "~/styles/app.css?inline";

function RootDocument({ children }: { children: JSXElement }) {
  return (
    <html>
      <head>
        <HydrationScript />
        <style innerHTML={appCssContent} />
      </head>
      <body>
        <HeadContent />
        <Suspense>{children}</Suspense>
        <Scripts />
      </body>
    </html>
  );
}
```

**Configuration:** Same as TanStack React (cssCodeSplit: false, cssMinify: true)

---

### 5. Analog - Angular (kanban-analog)

**Strategy:** Vite Plugin with `transformIndexHtml` Hook

**Implementation:** Same plugin as Marko (see #1)

**Why it works:** Analog has an `index.html` entry point that Vite processes during build, making the `transformIndexHtml` hook effective.

---

### 6. SvelteKit (kanban-sveltekit)

**Strategy:** Vite `?inline` Import + Svelte `{@html}`

**Implementation:**

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import appCss from '../app.css?inline';
  let { children } = $props();
</script>

<svelte:head>
  {@html `<style>${appCss}</style>`}
</svelte:head>

<div class="min-h-screen bg-base-200">
  {@render children?.()}
</div>
```

**Configuration:**

```typescript
// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

function suppressCssOutput(): Plugin {
  return {
    name: "suppress-css-output",
    enforce: "post",
    generateBundle(_, bundle) {
      const cssFiles = Object.keys(bundle).filter((fileName) =>
        fileName.endsWith(".css")
      );
      cssFiles.forEach((fileName) => {
        delete bundle[fileName];
      });
    },
  };
}

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), suppressCssOutput()],
  build: {
    cssCodeSplit: false,
    cssMinify: true,
  },
});
```

**Why generic Vite plugin doesn't work:** SvelteKit with Vercel adapter uses SSR without static HTML file generation. The `transformIndexHtml` hook doesn't run for SSR pages.

---

### 7. SolidStart (kanban-solidstart)

**Strategy:** Vite `?inline` Import + Solid `innerHTML`

**Implementation:**

```tsx
// src/entry-server.tsx
import "dotenv/config";
import { StartServer, createHandler } from "@solidjs/start/server";
import appCssContent from "./app.css?inline";

export default createHandler(() => (
  <StartServer
    document={({ children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <link
            rel="icon"
            href="/favicon.ico"
          />
          <style innerHTML={appCssContent} />
        </head>
        <body data-theme="pastel">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
```

**Why inline CSS goes in entry-server.tsx, not app.tsx:**

- The `document` prop in `StartServer` defines the actual `<html>` structure
- CSS must be in the `<head>` for proper rendering and hydration
- Putting `<style>` in `app.tsx` would render it in the `<body>`, causing hydration errors

**Configuration:**

```typescript
// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import type { Plugin } from "vite";

// Plugin to prevent CSS from being emitted as separate files
// since we're inlining it in entry-server.tsx
function suppressCssOutput(): Plugin {
  return {
    name: "suppress-css-output",
    enforce: "post",
    apply: "build", // Only apply during production build, not dev
    generateBundle(_, bundle) {
      // Remove CSS files from the bundle
      for (const fileName in bundle) {
        if (fileName.endsWith(".css")) {
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [suppressCssOutput()],
    build: {
      cssCodeSplit: false,
      cssMinify: true,
    },
  },
});
```

**Important configuration for SolidStart:**

1. **Keep `{assets}` in entry-server.tsx**: Required for hydration scripts and Vite dev tooling. When using `?inline` import, `{assets}` does not include CSS in dev mode.
2. **Add inline CSS after `{assets}`**: Place `<style innerHTML={appCssContent} />` after `{assets}` to ensure CSS loads after hydration scripts.
3. **suppressCssOutput plugin**: Removes CSS files from production bundle (`apply: "build"`) as an extra safeguard.
4. **optimizeDeps.exclude**: Excludes `lightningcss` and `fsevents` to prevent infinite reload loops in dev mode.

**Result:** Both dev and production have a single inline `<style>` tag with no duplication. The `?inline` import prevents Vite from emitting separate CSS files, and `{assets}` only includes hydration scripts.

---

### 8. Nuxt (kanban-nuxt)

**Strategy:** Nuxt Native `features.inlineStyles`

**Implementation:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  features: {
    inlineStyles: true,
  },
});
```

**Why it works:** Nuxt's built-in `inlineStyles` feature automatically inlines all CSS into the HTML document during SSR. This is a native Nuxt feature that requires no manual configuration like `?inline` imports or plugins.

**How it differs from other SSR frameworks:**

- **No manual imports needed:** Unlike TanStack, SvelteKit, and SolidStart, Nuxt handles inlining automatically
- **Framework-native approach:** Similar to Qwik's `inlineStylesUpToBytes`, Nuxt provides a built-in solution
- **Works seamlessly with SSR:** CSS is inlined in the HTML response, available immediately on page load
- **Simpler than plugin approach:** No need for `transformIndexHtml` hooks or manual bundle manipulation

**Key benefits:**

- Automatic and transparent CSS inlining
- No blocking CSS requests
- Single HTTP request for HTML + CSS
- Works with all Nuxt adapters (Vercel, Netlify, etc.)

---

### 9. Next.js App Router (kanban-nextjs)

**Strategy:** External Stylesheets (Recommended by Next.js)

**Why CSS inlining doesn't work:**

1. **App Router uses streaming SSR:** HTML is generated dynamically at runtime, not during build
2. **No static HTML files:** Post-build scripts can't process non-existent files
3. **`optimizeCss: true` (Critters) only works with Pages Router:** App Router's streaming is incompatible with Critters

**What Next.js does instead:**

- Automatic CSS optimization and minification
- CSS file caching with long cache headers
- Resource hints (`precedence="next"`) for optimal loading
- Parallel CSS/HTML loading (non-blocking)
- Automatic code splitting for CSS

**Why this is the recommended approach for Next.js:**

- Better caching strategy (CSS cached separately from HTML)
- Smaller HTML payload
- Browser can download CSS and HTML in parallel
- Next.js team's recommended best practice for App Router

### 10. kanban-htmx (Astro + HTMX)

**Problem:**

- Initial implementation used external CSS file (18 kB transferred, 122 kB uncompressed)
- External CSS requires separate network request, blocking FCP
- On 3G networks, this resulted in slower FCP (~896ms) compared to frameworks with inline CSS

**Solution:**
Inline all CSS using Astro's built-in `inlineStylesheets` option.

**Implementation:**

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  build: {
    inlineStylesheets: "always", // Always inline CSS for better performance
  },
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
```

**Results:**

- CSS is now inlined in the HTML document
- No separate CSS file to download (0 external CSS requests)
- Aligns with other frameworks using DaisyUI (which also inline CSS)
- Expected FCP improvement: 200-400ms on 3G networks

**Trade-offs:**

- **Pro**: Faster FCP - no blocking CSS request
- **Pro**: CSS arrives with HTML - one less roundtrip
- **Pro**: Consistent with other framework implementations
- **Con**: Increases HTML document size by ~18 kB
- **Con**: CSS can't be cached separately (but compresses well with gzip/brotli)
- **Con**: Every page load includes all CSS (even on warm cache)

**Verification:**

```bash
# Check that no CSS files exist in build output
ls dist/client/_astro/*.css
# Should return: No such file or directory

# Verify CSS is inlined in HTML
curl https://kanban-htmx.vercel.app/board | grep '<style'
# Should show inline <style> tags
```

---

## Key Learnings

### When Vite Plugins Work

Vite's `transformIndexHtml` hook works for frameworks that:

- Generate static HTML files during build
- Don't use runtime HTML generation
- Examples: **Marko**, **Analog**

### When Vite Plugins Don't Work

The plugin approach fails for frameworks with:

- Pure SSR (runtime HTML generation)
- No static HTML file output
- Streaming responses
- Examples: **TanStack Start**, **SvelteKit (with SSR)**, **Qwik**, **SolidStart**

### SSR Framework Solutions

For SSR frameworks, use framework-specific approaches:

1. **Framework-native solutions** (Best)
   - Qwik: `inlineStylesUpToBytes`
   - Nuxt: `features.inlineStyles`

2. **Vite `?inline` import** (Good)
   - Import CSS as string: `import css from './style.css?inline'`
   - Inject via framework's head mechanism
   - Works with: TanStack, SvelteKit, SolidStart

3. **Runtime modification** (Complex, not recommended)
   - Middleware to modify HTML at runtime
   - Performance overhead
   - Not used in any of our apps

### CSS Minification

All Vite-based apps use:

```typescript
build: {
  cssMinify: true,
}
```

When CSS is imported with `?inline`, Vite automatically minifies it during build.

---

## Performance Considerations

### Advantages of Inlined CSS

- **Eliminates render-blocking requests:** No separate CSS file download
- **Faster initial render:** CSS available immediately with HTML
- **Single HTTP request:** Reduces network overhead
- **Better for small CSS files:** Under ~100KB

### Disadvantages of Inlined CSS

- **Larger HTML payload:** Every page load includes full CSS
- **No CSS caching:** CSS re-downloaded with each page
- **Worse for large CSS files:** Over ~100KB
- **Can't parallelize:** CSS and HTML load together, not separately

### When External CSS is Better

- **Large CSS files:** Over 100-150KB
- **Multi-page apps:** CSS can be cached across pages
- **Frequently changing HTML, static CSS:** Better cache hit ratio
- **Next.js App Router:** Framework recommendation

---

## Build Configuration Patterns

### Standard Vite Plugin Pattern

Used by: Marko, Analog

```typescript
import { defineConfig, type Plugin, type HtmlTagDescriptor } from "vite";

function inlineCss(): Plugin {
  return {
    name: "inline-css",
    enforce: "post",
    apply: "build",
    transformIndexHtml(html, ctx) {
      const htmlTagDescriptors: HtmlTagDescriptor[] = [];
      const bundle = ctx.bundle;
      if (bundle == null) return [];

      let stylesToInline: Record<string, string> = {};

      // Collect CSS files
      for (const chunk of Object.values(bundle)) {
        if (
          chunk.fileName.endsWith(".css") &&
          chunk.type === "asset" &&
          typeof chunk.source === "string"
        ) {
          stylesToInline[chunk.fileName] = chunk.source;
        }
      }

      // Combine CSS
      const combinedStyle = Object.values(stylesToInline).join(" ");

      // Add <style> tag
      htmlTagDescriptors.push({
        tag: "style",
        children: combinedStyle,
        injectTo: "head",
      });

      // Remove <link> tags
      const htmlWithoutLinks = html.replaceAll(
        /<link\s+rel="stylesheet"(\s.*\s)href="(.*)\.css">/gi,
        ""
      );

      return {
        html: htmlWithoutLinks,
        tags: htmlTagDescriptors,
      };
    },
  };
}
```

### SSR Framework Pattern (Vite `?inline`)

Used by: TanStack Start, SvelteKit, SolidStart

```typescript
// 1. Import CSS as string
import appCss from "./app.css?inline";

// 2. Inject in head via framework-specific mechanism
// React: dangerouslySetInnerHTML={{ __html: appCss }}
// Solid: innerHTML={appCss}
// Svelte: {@html `<style>${appCss}</style>`}

// 3. Configure Vite
export default defineConfig({
  build: {
    cssCodeSplit: false, // Bundle all CSS into one file
    cssMinify: true, // Minify CSS
  },
});
```

---

## Verification Steps

To verify CSS is inlined correctly:

1. **Build the app:** `npm run build`
2. **Check production HTML:**
   - For static apps: Inspect `.next/`, `dist/`, or `.output/` directories
   - For deployed apps: View source of deployed URL
3. **Look for:**
   - ✅ `<style>` tag in `<head>` with full CSS
   - ❌ No `<link rel="stylesheet">` tags (or minimal framework-specific ones)
4. **Verify size:**
   - Check `<style>` tag contains minified CSS
   - Compare size to original CSS file
