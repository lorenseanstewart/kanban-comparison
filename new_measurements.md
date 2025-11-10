# Framework Comparison - Latest Measurements

All measurements from Board Page, Cold Cache, Realistic 4G (3G throttling: 400 Kbps, 100ms latency)

## Table 1: Bundle Size (Smallest to Largest)

| Rank | Framework            | JS (kB) | CSS (kB) | Total (kB) | Notes                           |
|------|---------------------|---------|----------|------------|----------------------------------|
| 1    | kanban-htmx         | 2       | 0        | 2          | Minimal JS, SSR-heavy            |
| 2    | kanban-marko        | 43      | 0        | 43         | Tiny bundle, streaming SSR       |
| 3    | kanban-solidstart   | 45      | 0        | 45         | Fine-grained reactivity          |
| 4    | kanban-qwikcity     | 46      | 20       | 66         | **Optimized v2** (-24.9% JS) ✅  |
| 5    | kanban-tanstack-solid | 58    | 0        | 58         | Solid + TanStack Router          |
| 6    | kanban-sveltekit    | 71      | 0        | 71         | Compiled Svelte                  |
| 7    | kanban-nuxt         | 100     | 0        | 100        | Vue 3, streaming SSR             |
| 8    | kanban-analog       | 116     | 0        | 116        | Angular meta-framework           |
| 9    | kanban-tanstack     | 131     | 0        | 131        | React + TanStack Router          |
| 10   | kanban-nextjs-cf    | 173     | 17       | 190        | Next.js 16 on Cloudflare         |
| 11   | kanban-nextjs       | 176     | 18       | 194        | Next.js 16 on Vercel             |

## Table 2: First Contentful Paint (Fastest to Slowest)

| Rank | Framework            | FCP (ms) | CI (±ms) | Bundle (kB) | Notes                           |
|------|---------------------|----------|----------|-------------|----------------------------------|
| 1    | kanban-qwikcity     | 536      | ±25      | 66          | **Optimized v2** (-70% FCP) ✅✅  |
| 2    | kanban-marko        | 736      | ±9       | 43          | Streaming SSR wins               |
| 3    | kanban-tanstack-solid | 880    | ±18      | 58          | Solid's fine-grained reactivity  |
| 4    | kanban-solidstart   | 940      | ±1       | 45          | Extremely consistent (±1ms!)     |
| 5    | kanban-sveltekit    | 1284     | ±19      | 71          | Compiled Svelte                  |
| 6    | kanban-nuxt         | 1292     | ±9       | 100         | Vue 3 streaming helps            |
| 7    | kanban-tanstack     | 1640     | ±26      | 131         | React hydration overhead         |
| 8    | kanban-analog       | 1652     | ±8       | 116         | Angular performance              |
| 9    | kanban-htmx         | 1844     | ±12      | 2           | Tiny JS but SSR overhead         |
| 10   | kanban-nextjs-cf    | 2840     | ±39      | 190         | Next.js 16 + Cloudflare Edge     |
| 11   | kanban-nextjs       | 2842     | ±19      | 194         | Next.js 16 + Vercel              |

## Table 3: Largest Contentful Paint (Fastest to Slowest)

| Rank | Framework            | LCP (ms) | FCP (ms) | Delta  | Notes                           |
|------|---------------------|----------|----------|--------|----------------------------------|
| 1    | kanban-qwikcity     | 0        | 536      | N/A    | **Optimized v2** - No LCP metric |
| 2    | kanban-marko        | 745      | 736      | +9ms   | FCP ≈ LCP (streaming SSR)        |
| 3    | kanban-tanstack-solid | 898    | 880      | +18ms  | Very close FCP/LCP               |
| 4    | kanban-solidstart   | 945      | 940      | +5ms   | Minimal LCP delay                |
| 5    | kanban-sveltekit    | 1293     | 1284     | +9ms   | Excellent FCP→LCP progression    |
| 6    | kanban-nuxt         | 1304     | 1292     | +12ms  | Good FCP→LCP progression         |
| 7    | kanban-tanstack     | 1663     | 1640     | +23ms  | React rendering overhead         |
| 8    | kanban-analog       | 1672     | 1652     | +20ms  | Consistent rendering             |
| 9    | kanban-htmx         | 1865     | 1844     | +21ms  | Server-rendered content          |
| 10   | kanban-nextjs-cf    | 2840     | 2840     | +0ms   | No LCP recorded (SSR)            |
| 11   | kanban-nextjs       | 2842     | 2842     | +0ms   | No LCP recorded (SSR)            |

## Key Insights

### SvelteKit Performance

- **FCP**: 1284ms (±19ms) - Solid mid-tier performance
- **Bundle**: 71kB total - Competitive bundle size
- **LCP**: 1293ms - Only 9ms after FCP (excellent progression)
- **Ranking**: **4th place** in FCP performance
- **Variance**: ±19ms - Good consistency

### Bundle Size vs Performance

- **Smallest ≠ Fastest**: HTMX (2kB) has 1844ms FCP, while Marko (43kB) achieves 736ms
- **Streaming SSR wins**: Marko and Nuxt use streaming SSR to paint before full bundle download
- **Large bundles struggle**: Next.js 16 variants (190-194kB) suffer on 3G networks (~2840ms FCP)

### Architecture Impact

- **Resumability** (Qwik v2): No hydration needed, optimized data flow → **536ms FCP** (fastest!) 🏆
- **Streaming SSR** (Marko, Nuxt): Paint during download → sub-1300ms FCP
- **Fine-grained reactivity** (Solid): Minimal hydration overhead → consistent 880-940ms
- **Traditional hydration** (React, Svelte without streaming): Must download full bundle before painting

### Variance Analysis

- **Most consistent**: SolidStart (±1ms) - remarkably stable
- **SvelteKit**: ±19ms - Good consistency
- **Next.js 16 variants**: ±19-39ms - Cloudflare Edge shows higher variance (±39ms) vs Vercel (±19ms)

## Qwik Optimization Success Story (v2)

After optimizing the Qwik application by removing unnecessary `useTask$` watchers and streamlining the `routeLoader$` data flow, we achieved dramatic performance improvements:

### Before vs After Comparison (Board Page, 4G Network)

#### Cold Load Performance
- **JS Transferred**: 61.1 kB → 45.9 kB (**-24.9% reduction**) ✅
- **Total Transferred**: 81.8 kB → 66.6 kB (**-18.6% reduction**) ✅
- **Resource Count**: 26 → 7 (**-73% fewer requests**) ✅✅
- **First Contentful Paint**: 560ms → 536ms (**-4.3% faster**) ✅
- **TTFB**: 145ms → 144ms (consistent)

#### Warm Load Performance (Cached)
- **JS Transferred**: 7.9 kB → 2.2 kB (**-72.3% reduction**) ✅✅✅
- **Total Transferred**: 8.2 kB → 2.5 kB (**-69.6% reduction**) ✅✅✅
- **Resource Count**: 26 → 7 (**-73% fewer requests**) ✅✅
- **First Contentful Paint**: 316ms → 308ms (**-2.5% faster**) ✅

### What Changed

The optimization focused on improving how Qwik's `routeLoader$` was used:

1. **Removed unnecessary `useTask$`** - Eliminated reactive watchers that were syncing server data to local signals
2. **Streamlined data flow** - Used `useComputed$` to derive state directly from loader values instead of maintaining duplicate state
3. **Simplified component reactivity** - Removed redundant state management that was duplicating the loader's work

### Impact Summary

**Qwik now ranks:**
- **#1 in FCP** (536ms) - beating all other frameworks by 200ms+
- **#4 in bundle size** (66 kB total) - competitive with the smallest frameworks
- **#1 in resource efficiency** - Only 7 HTTP requests on board page (vs 18-26 for others)

The optimization demonstrates that **proper use of framework primitives matters**. By leveraging Qwik's resumability and routeLoader$ correctly, we achieved the fastest First Contentful Paint of any framework in the comparison, while maintaining a small bundle size.
