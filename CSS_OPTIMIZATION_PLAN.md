# CSS Optimization Plan

## Executive Summary

This plan addresses critical CSS delivery performance issues identified across 9 of 10 frameworks in the Kanban comparison project. Currently, only Nuxt successfully inlines CSS, achieving excellent FCP performance (495ms). The remaining frameworks suffer from render-blocking external CSS files, resulting in poor FCP times (531ms - 2357ms).

**Goal**: Inline 100% of CSS (Tailwind + DaisyUI + charts.css) across all frameworks to eliminate render-blocking resources and improve First Contentful Paint by 1000-1800ms.

**Scope**: 9 frameworks requiring optimization:
- Marko (worst FCP: 2357ms)
- HTMX (1648ms)
- SolidStart (2154ms)
- SvelteKit (580ms)
- Qwik City (579ms)
- TanStack Solid (651ms)
- TanStack React (531ms)
- Analog (1598ms)
- Next.js (2176ms)

**Excluded**: Nuxt (already optimized with `features.inlineStyles: true`)

## Current State Analysis

### Performance Impact of External CSS

| Framework | Bundle (compressed) | CSS Strategy | FCP (ms) | Problem |
|-----------|-------------------|--------------|----------|---------|
| Marko | 29.1 kB | External CSS | 2357 | Render-blocking + max-age=0 |
| HTMX | 35.2 kB | External CSS | 1648 | Render-blocking |
| SolidStart | 48.1 kB | External CSS | 2154 | Render-blocking |
| Next.js | 173.3 kB | External CSS | 2176 | Render-blocking |
| Analog | 120.8 kB | External CSS | 1598 | Render-blocking |
| SvelteKit | 55.9 kB | External CSS | 580 | External (minimal impact) |
| Qwik City | 59.4 kB | External CSS | 579 | External (minimal impact) |
| TanStack Solid | 62.0 kB | External CSS | 651 | External (moderate impact) |
| TanStack React | 120.0 kB | External CSS | 531 | External (minimal impact) |
| **Nuxt** | **89.5 kB** | **Inline CSS** | **495** | **✅ Optimized** |

### Root Cause: Render-Blocking Cascade

On 4G network (40ms RTT, 10 Mbps download):

1. HTML download: ~374ms
2. CSS discovery: +10ms (parse HTML, find `<link>` tag)
3. CSS request round-trip: +40ms RTT
4. Origin hit (cold cache): +500ms (no CDN cache due to max-age=0)
5. CSS download: +132ms (16.5 kB at 10 Mbps)
6. CSS parse: +50ms
7. **Total delay: ~1106ms minimum**

Actual measured FCP: **2357ms for Marko** (includes cold-start variance)

### Tailwind Version Matrix

| Framework | Current Tailwind | Migration Needed |
|-----------|-----------------|------------------|
| Next.js | v3 | Yes → v4 |
| SolidStart | v3 | Yes → v4 |
| Qwik City | v3 | Yes → v4 |
| Analog | v4 | No |
| SvelteKit | v4 | No |
| HTMX | v4 | No |
| TanStack React | v4 | No |
| TanStack Solid | v4 | No |
| Marko | v4 | No |

## Technical Approach

### Strategy 1: Vite-Based Frameworks (Easiest)

**Frameworks**: Marko, HTMX, TanStack Solid, TanStack React, SvelteKit, Analog, Qwik City

**Method**: Configure Vite to inline all stylesheets using `build.inlineStylesheets`

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Inline ALL stylesheets (not just small ones)
    inlineStylesheets: 'always',

    // Disable CSS code splitting to ensure single inline block
    cssCodeSplit: false,

    // Enable CSS minification
    cssMinify: true
  }
});
```

### Strategy 2: Next.js (Framework-Specific)

**Challenge**: Next.js 16 with Turbopack doesn't support full CSS inlining (only critical CSS)

**Solution**: Hybrid approach - Critical CSS inlining + Async CSS loading

**Method 1**: Enable critical CSS inlining

```bash
# Install critters
npm install critters
```

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true  // Inlines critical (above-the-fold) CSS
  }
};
```

**Method 2**: Make remaining CSS load asynchronously (non-blocking)

Since Next.js keeps full CSS as external `<link>` tags even with `optimizeCss: true`, we use Cloudflare Pages middleware to make those links non-blocking:

```typescript
// functions/_middleware.ts
/**
 * Transforms CSS link tags to load asynchronously
 * Uses media="print" trick + HTMLRewriter
 */
class AsyncCSSTransformer {
  element(element: Element) {
    const rel = element.getAttribute('rel');
    const href = element.getAttribute('href');

    if (rel === 'stylesheet' && href?.includes('.css')) {
      // Load with low priority (non-blocking)
      element.setAttribute('media', 'print');

      // Apply once loaded
      element.setAttribute('onload', "this.media='all'");

      // Fallback for no-JS
      element.after(
        `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
        { html: true }
      );
    }
  }
}

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  if (!response.headers.get('content-type')?.includes('text/html')) {
    return response;
  }

  return new HTMLRewriter()
    .on('link[rel="stylesheet"]', new AsyncCSSTransformer())
    .transform(response);
};
```

**Result**:
- Critical CSS: Inlined in `<style>` tags → instant FCP
- Remaining CSS: Async-loaded via `media="print"` trick → doesn't block rendering
- No render-blocking CSS!

**Note**: Use this approach for frameworks that can't inline 100% of CSS (Next.js, potentially others)

### Strategy 3: SolidStart (Framework-Specific)

**Method**: Configure Solid adapter with Vite inlining

```typescript
// app.config.ts
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    build: {
      inlineStylesheets: 'always',
      cssCodeSplit: false,
      cssMinify: true
    }
  }
});
```

### Charts.css Integration

**Current**: Nuxt bundles charts.css in main CSS inline block

**Target**: All frameworks should inline charts.css the same way

**Implementation**:
1. Import charts.css in main entry point (not via `<link>` tag)
2. Let bundler include it in main CSS bundle
3. Inline entire bundle using strategy above

```typescript
// src/entry-client.tsx or app.tsx
import 'charts.css';  // ← Import, don't link
```

## Phase-by-Phase Implementation

### Phase 1: Tailwind v4 Migration (Week 1)

**Frameworks**: Next.js, SolidStart, Qwik City

**Steps**:

#### Next.js
```bash
cd kanban-nextjs
npm uninstall tailwindcss postcss autoprefixer
npm install tailwindcss@next @tailwindcss/postcss@next
```

Update `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
```

Update `postcss.config.js`:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

#### SolidStart
```bash
cd kanban-solidstart
npm uninstall tailwindcss postcss autoprefixer
npm install tailwindcss@next @tailwindcss/postcss@next
```

Update config (same as Next.js pattern)

#### Qwik City
```bash
cd kanban-qwikcity
npm uninstall tailwindcss postcss autoprefixer
npm install tailwindcss@next @tailwindcss/postcss@next
```

Update config (same pattern)

**Verification**: Run `npm run build` for each framework, ensure no errors

### Phase 2: CSS Inlining Implementation (Week 2-3)

#### Week 2: Vite-Based Frameworks

##### Day 1-2: Marko
```bash
cd kanban-marko
```

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import marko from '@marko/vite';

export default defineConfig({
  plugins: [marko()],
  build: {
    inlineStylesheets: 'always',
    cssCodeSplit: false,
    cssMinify: true
  }
});
```

**Testing**:
```bash
npm run build
# Inspect dist/assets - should have NO .css files
# All CSS should be in <style> tags in HTML
tsx ../scripts/measure-single.ts --url https://kanban-marko.pages.dev --runs 10
```

##### Day 3: HTMX (Astro)
```bash
cd kanban-htmx
```

Update `astro.config.mjs`:
```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  adapter: cloudflare(),
  integrations: [tailwind()],
  vite: {
    build: {
      inlineStylesheets: 'always',
      cssCodeSplit: false,
      cssMinify: true
    }
  }
});
```

##### Day 4: TanStack Solid
```bash
cd kanban-tanstack-solid
```

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  build: {
    inlineStylesheets: 'always',
    cssCodeSplit: false,
    cssMinify: true
  }
});
```

##### Day 5: TanStack React
```bash
cd kanban-tanstack
```

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    inlineStylesheets: 'always',
    cssCodeSplit: false,
    cssMinify: true
  }
});
```

##### Day 6: Qwik City
```bash
cd kanban-qwikcity
```

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';

export default defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite()],
    build: {
      inlineStylesheets: 'always',
      cssCodeSplit: false,
      cssMinify: true
    }
  };
});
```

#### Week 3: Framework-Specific

##### Day 7-8: Analog
```bash
cd kanban-analog
```

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

export default defineConfig(({ mode }) => ({
  plugins: [analog()],
  build: {
    inlineStylesheets: 'always',
    cssCodeSplit: false,
    cssMinify: true
  }
}));
```

##### Day 9-10: SvelteKit
```bash
cd kanban-sveltekit
```

Update `vite.config.ts`:
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    inlineStylesheets: 'always',
    cssCodeSplit: false,
    cssMinify: true
  }
});
```

##### Day 11-12: Next.js
```bash
cd kanban-nextjs
npm install critters
```

Update `next.config.js`:
```javascript
const nextConfig = {
  experimental: {
    optimizeCss: true
  }
};

module.exports = nextConfig;
```

**Note**: If `optimizeCss` doesn't inline 100% of CSS, implement custom webpack config:

```javascript
const InlineSourceWebpackPlugin = require('inline-source-webpack-plugin');

const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.plugins.push(
        new InlineSourceWebpackPlugin({
          compress: true,
          rootpath: './public',
          noAssetMatch: 'warn'
        })
      );
    }
    return config;
  }
};
```

##### Day 13-14: SolidStart
```bash
cd kanban-solidstart
```

Update `app.config.ts`:
```typescript
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    build: {
      inlineStylesheets: 'always',
      cssCodeSplit: false,
      cssMinify: true
    }
  }
});
```

### Phase 3: Charts.css Standardization

**All Frameworks**: Ensure charts.css is imported in main entry point

Example for each framework type:

**Vite-based** (Marko, HTMX, TanStack, SvelteKit, etc.):
```typescript
// src/index.tsx or src/main.tsx
import 'charts.css';
import './index.css';  // Tailwind entry point
```

**Next.js**:
```typescript
// app/layout.tsx
import 'charts.css';
import './globals.css';
```

**SolidStart**:
```typescript
// src/app.tsx
import 'charts.css';
import './app.css';
```

Remove any `<link>` tags for charts.css from HTML templates.

## Testing Strategy

### Per-Framework Testing

After implementing CSS inlining for each framework:

1. **Build inspection**:
```bash
npm run build
# Check dist/public/assets - should have NO .css files
# All CSS should be in HTML <style> tags
```

2. **Local verification**:
```bash
npm run preview
# Open browser DevTools Network tab
# Verify NO CSS file requests
# View page source - confirm <style> tags with CSS content
```

3. **Deploy to Cloudflare Pages**:
```bash
git add .
git commit -m "feat: inline CSS for {framework-name}"
git push
# Wait for Cloudflare Pages deployment
```

4. **Run measurement**:
```bash
tsx scripts/measure-single.ts --url https://kanban-{framework}.pages.dev --runs 10
```

5. **Verify improvements**:
   - FCP should decrease by 1000-1800ms (worst performers)
   - FCP should decrease by 200-500ms (already-fast frameworks)
   - NO external CSS requests in Lighthouse network audit

### Full Re-Measurement Suite

After all 9 frameworks are optimized:

```bash
# Measure all 10 frameworks (including already-optimized Nuxt)
tsx scripts/measure-single.ts --url https://kanban-nextjs.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-nuxt.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-analog.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-solidstart.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-sveltekit.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-qwikcity.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-tanstack-solid.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-tanstack.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-marko.pages.dev --runs 10
tsx scripts/measure-single.ts --url https://kanban-htmx.pages.dev --runs 10

# Aggregate results
tsx scripts/aggregate-measurements.ts

# Generate updated charts
tsx scripts/generate-charts.ts

# Review results
cat metrics/final-measurements.md
```

## Success Metrics

### Expected Improvements

| Framework | Current FCP | Target FCP | Expected Improvement |
|-----------|------------|-----------|---------------------|
| Marko | 2357ms | ~400-600ms | -1800ms (77% faster) |
| Next.js | 2176ms | ~400-600ms | -1700ms (78% faster) |
| SolidStart | 2154ms | ~400-600ms | -1700ms (78% faster) |
| HTMX | 1648ms | ~400-600ms | -1200ms (73% faster) |
| Analog | 1598ms | ~400-600ms | -1100ms (69% faster) |
| TanStack Solid | 651ms | ~450-550ms | -150ms (23% faster) |
| SvelteKit | 580ms | ~450-550ms | -80ms (14% faster) |
| Qwik City | 579ms | ~450-550ms | -80ms (14% faster) |
| TanStack React | 531ms | ~450-550ms | -30ms (6% faster) |

### Validation Criteria

**Pass**: Framework FCP improves by expected amount (±200ms tolerance)

**Pass**: NO external CSS files in Lighthouse network audit

**Pass**: All CSS visible in HTML `<style>` tags (view-source verification)

**Pass**: Performance score remains ≥95 (no regression)

**Fail**: FCP doesn't improve or regresses

**Fail**: External CSS files still requested

### Rollback Procedure

If optimization causes issues for a specific framework:

1. **Revert Vite config**:
```typescript
// vite.config.ts - remove inlining config
export default defineConfig({
  build: {
    // Remove or comment out:
    // inlineStylesheets: 'always',
    // cssCodeSplit: false,
  }
});
```

2. **Rebuild and redeploy**:
```bash
npm run build
git add .
git commit -m "revert: remove CSS inlining for {framework-name}"
git push
```

3. **Document issue**: Add note to this plan explaining why inlining failed for that framework

4. **Investigate alternative**: Research framework-specific CSS optimization approaches

## Risk Assessment

### Low Risk
- **Vite-based frameworks**: Well-documented configuration, minimal risk
- **Tailwind v4 migration**: Official upgrade path, good documentation

### Medium Risk
- **Next.js**: `experimental.optimizeCss` may not inline 100%, might need custom webpack config
- **Charts.css bundling**: Need to verify all frameworks bundle it correctly

### High Risk
- **SolidStart**: Newer framework, less community experience with CSS inlining
- **Bundle size increase**: Inlining CSS will increase HTML size (but improve FCP)

### Mitigation Strategies

1. **Test locally first**: Always test builds locally before deploying
2. **Deploy incrementally**: One framework at a time, verify before moving to next
3. **Monitor bundle sizes**: Track if HTML size increases significantly (expected: +15-20 kB per page)
4. **Keep git history clean**: One commit per framework for easy rollback
5. **Document blockers**: If a framework can't inline CSS, document why and explore alternatives

## Timeline

### Week 1: Tailwind v4 Migration
- **Day 1-2**: Migrate Next.js to Tailwind v4
- **Day 3-4**: Migrate SolidStart to Tailwind v4
- **Day 5**: Migrate Qwik City to Tailwind v4
- **Day 6-7**: Test all migrations, fix any issues

### Week 2: CSS Inlining (Batch 1)
- **Day 1**: Marko
- **Day 2**: HTMX
- **Day 3**: TanStack Solid
- **Day 4**: TanStack React
- **Day 5**: Qwik City
- **Day 6-7**: Test batch, verify measurements

### Week 3: CSS Inlining (Batch 2)
- **Day 1-2**: Analog
- **Day 3-4**: SvelteKit
- **Day 5-6**: Next.js
- **Day 7**: SolidStart

### Week 4: Validation & Documentation
- **Day 1-2**: Full re-measurement suite (all 10 frameworks)
- **Day 3-4**: Analyze results, create comparison tables
- **Day 5**: Update METHODOLOGY.md with findings
- **Day 6**: Update README.md with new performance numbers
- **Day 7**: Final review, publish results

## Implementation Checklist

### Pre-Implementation
- [x] Research all 10 frameworks' CSS strategies
- [x] Identify Tailwind version per framework
- [x] Create comprehensive implementation plan
- [ ] Review plan with stakeholders
- [ ] Set up branch protection/testing strategy

### Phase 1: Tailwind v4 Migration
- [ ] Migrate Next.js to Tailwind v4
- [ ] Migrate SolidStart to Tailwind v4
- [ ] Migrate Qwik City to Tailwind v4
- [ ] Test all migrations locally
- [ ] Deploy and verify

### Phase 2: CSS Inlining
- [ ] Implement Marko CSS inlining
- [ ] Implement HTMX CSS inlining
- [ ] Implement TanStack Solid CSS inlining
- [ ] Implement TanStack React CSS inlining
- [ ] Implement Qwik City CSS inlining
- [ ] Implement Analog CSS inlining
- [ ] Implement SvelteKit CSS inlining
- [ ] Implement Next.js CSS inlining
- [ ] Implement SolidStart CSS inlining

### Phase 3: Charts.css Standardization
- [ ] Update all frameworks to import charts.css
- [ ] Remove charts.css `<link>` tags from HTML
- [ ] Verify charts.css bundles correctly

### Testing & Validation
- [ ] Run individual measurements for all 9 optimized frameworks
- [ ] Run full 10-framework measurement suite
- [ ] Aggregate results
- [ ] Generate updated charts
- [ ] Compare before/after performance

### Documentation
- [ ] Update METHODOLOGY.md with CSS optimization strategy
- [ ] Update README.md with new performance numbers
- [ ] Document any framework-specific issues encountered
- [ ] Create blog post summarizing findings

## Technical Reference

### Vite `inlineStylesheets` Configuration

**Values**:
- `'always'`: Inline all CSS (our choice)
- `'auto'`: Inline CSS smaller than `assetsInlineLimit` (default: 4kb)
- `false`: Never inline CSS

**Related Options**:
```typescript
{
  build: {
    inlineStylesheets: 'always',  // Always inline
    cssCodeSplit: false,          // Single CSS bundle (easier to inline)
    cssMinify: true,              // Minify CSS before inlining
    assetsInlineLimit: 0          // Don't inline other assets (images, fonts)
  }
}
```

### Next.js CSS Optimization

**Method 1**: Experimental flag (easiest)
```javascript
module.exports = {
  experimental: {
    optimizeCss: true  // Uses critters
  }
}
```

**Method 2**: Custom webpack config (if method 1 insufficient)
```javascript
const InlineSourceWebpackPlugin = require('inline-source-webpack-plugin');

module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.plugins.push(
        new InlineSourceWebpackPlugin({
          compress: true
        })
      );
    }
    return config;
  }
}
```

### Tailwind v4 Migration

**Package changes**:
```bash
# Remove v3
npm uninstall tailwindcss postcss autoprefixer

# Install v4
npm install tailwindcss@next @tailwindcss/postcss@next
```

**Config changes**:
```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}  // v4 PostCSS plugin
  }
}
```

**Key differences**:
- Native CSS features (no more JIT engine)
- Better tree-shaking
- Faster builds
- CSS-first configuration

## Implementation Progress

### ✅ Completed: Next.js Tailwind v4 Migration (Nov 4, 2025)

**What was done:**
1. Migrated Next.js from Tailwind v3 to v4
2. Updated package.json: `tailwindcss: "^4"` with `@tailwindcss/postcss: "^4"`
3. Updated postcss.config.mjs: Changed from `tailwindcss: {}` to `'@tailwindcss/postcss': {}`
4. Removed autoprefixer (v4 includes it)
5. Updated globals.css:
   ```css
   @import "tailwindcss";
   @plugin "daisyui";
   ```
6. Added `// @ts-ignore` for DaisyUI config in tailwind.config.ts
7. Build successful with DaisyUI working
8. Deployed to Cloudflare Pages: https://kanban-nextjs.pages.dev

**Next steps:**
- Run performance measurements to compare before/after
- If successful, migrate SolidStart and Qwik City to v4
- Then implement CSS inlining across all frameworks

### 🔄 In Progress

**Currently:** Waiting for Next.js deployment validation and performance measurements

### ⏸️ Pending

**Phase 1** (if Next.js v4 validation successful):
- [ ] Migrate SolidStart to Tailwind v4
- [ ] Migrate Qwik City to Tailwind v4

**Phase 2**: CSS Inlining (9 frameworks)
- [ ] Marko
- [ ] HTMX
- [ ] SolidStart
- [ ] SvelteKit
- [ ] Qwik City
- [ ] TanStack Solid
- [ ] TanStack React
- [ ] Analog
- [ ] Next.js

**Phase 3**: Full Re-measurement & Documentation
- [ ] Run measurement suite (all 10 frameworks)
- [ ] Aggregate results and generate charts
- [ ] Update METHODOLOGY.md
- [ ] Document findings

## Questions & Answers

### Q: Why inline ALL CSS instead of just critical CSS?

**A**:
1. **Simplicity**: Eliminates all render-blocking CSS, no complex critical CSS extraction
2. **Performance**: With our small CSS bundles (15-20 kB), inlining everything is faster than 2-round-trip (critical + deferred)
3. **Consistency**: All frameworks use same strategy, easier to maintain
4. **Real-world validation**: Nuxt already does this successfully (495ms FCP)

### Q: Won't inlining increase HTML size?

**A**: Yes, by ~15-20 kB. But:
1. **Network**: HTML is still smaller than HTML + separate CSS (eliminates round-trip)
2. **Cache**: HTML isn't cached as aggressively as CSS, but faster first paint matters more for SEO/UX
3. **Compression**: Inline CSS compresses well in HTML (gzip/brotli)
4. **Trade-off**: Accept larger HTML for faster FCP (our priority)

### Q: What if a framework's build fails after CSS inlining?

**A**:
1. Test locally first (always run `npm run build` before deploying)
2. If build fails, check Vite/framework version compatibility
3. Try alternative configurations (e.g., Next.js experimental flag vs webpack)
4. Document issue and investigate framework-specific approach
5. Worst case: rollback and accept that framework can't inline CSS

### Q: How do we verify CSS is actually inlined?

**A**:
1. **Build inspection**: Check `dist/` folder - NO .css files in assets
2. **View source**: Open deployed page, view source, find `<style>` tags with CSS content
3. **DevTools Network**: NO CSS requests in Network tab
4. **Lighthouse audit**: NO render-blocking CSS warnings

## Conclusion

This plan provides a comprehensive, phased approach to optimizing CSS delivery across all 9 frameworks. By inlining 100% of CSS, we eliminate render-blocking resources and expect FCP improvements of 1000-1800ms for the worst performers (Marko, Next.js, SolidStart) and 30-150ms for already-fast frameworks.

The implementation prioritizes:
1. **Safety**: Incremental deployment, one framework at a time
2. **Validation**: Measurement after each change
3. **Consistency**: Same strategy across all Vite-based frameworks
4. **Documentation**: Detailed tracking of before/after performance

**Total effort**: ~4 weeks (1 week per phase + 1 week validation)

**Expected outcome**: All frameworks achieve FCP ≤600ms (Nuxt-level performance)
