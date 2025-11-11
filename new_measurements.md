# Framework Comparison - CORRECTED Measurements

**Measurement Date**: November 10, 2025
**Test Conditions**: Board Page, Cold Cache, 3G Network (400 Kbps, 100ms latency)
**Sample Size**: 50 runs per framework
**Key Fix**: PerformanceObserver injected BEFORE navigation for accurate FCP/LCP timing

---

**Note**: Choosing a framework based on these metrics will not guarentee you have a fast and lightweight application. On top of choosing a great framework, you always need to optimize your code, your app's configuration, and data loading (which may be slow if you are fetching data from slow APIs).

## 🚨 CRITICAL FINDING: LCP Delays

**LCP (Largest Contentful Paint) is the most important UX metric** - it represents when the largest visible content element is rendered on the page.

| Framework        | FCP    | LCP        | LCP Delay   | Status      |
| ---------------- | ------ | ---------- | ----------- | ----------- |
| **SvelteKit**    | 1372ms | **2900ms** | **+1528ms** | ⚠️ CRITICAL |
| **SolidStart**   | 944ms  | **1596ms** | **+652ms**  | ⚠️ WARNING  |
| **Next.js**      | 2952ms | **3316ms** | **+364ms**  | ⚠️ WARNING  |
| **Next.js CF**   | 2836ms | **3196ms** | **+360ms**  | ⚠️ WARNING  |
| All Others       | varies | = FCP      | 0ms         | ✅ Good     |

**What this means**:

- **SvelteKit**: Largest content renders at 2.9 seconds (1.5s after first paint)
- **SolidStart**: Largest content renders at 1.6 seconds (652ms after first paint)
- **Next.js (Vercel)**: Largest content renders at 3.3 seconds (364ms after first paint)
- **Next.js CF (Cloudflare Pages)**: Largest content renders at 3.2 seconds (360ms after first paint)
- **All other frameworks**: Largest content renders immediately when first paint occurs (LCP = FCP)

---

## Table 1: Complete Performance Rankings (3G Network)

Sorted by **LCP** (the metric that matters most for UX):

| Rank | Framework             | FCP    | LCP        | LCP-FCP     | Bundle JS   | Bundle CSS  | Total       |
| ---- | --------------------- | ------ | ---------- | ----------- | ----------- | ----------- | ----------- |
| 1    | kanban-marko          | 744ms  | 744ms      | 0ms         | 43kB        | 0kB         | 43kB        |
| 2    | kanban-tanstack-solid | 876ms  | 876ms      | 0ms         | 58kB        | 0kB         | 58kB        |
| 3    | kanban-nuxt           | 1308ms | 1308ms     | 0ms         | 100kB       | 0kB         | 100kB       |
| 4    | kanban-solidstart     | 944ms  | **1596ms** | **+652ms**  | 45kB        | 0kB         | 45kB        |
| 5    | kanban-tanstack       | 1604ms | 1604ms     | 0ms         | 131kB       | 0kB         | 131kB       |
| 6    | kanban-analog         | 1620ms | 1620ms     | 0ms         | 118kB       | 0kB         | 118kB       |
| 7    | kanban-qwikcity       | 1676ms | 1676ms     | 0ms         | 45kB        | 21kB        | 66kB        |
| 8    | kanban-htmx           | 1778ms | 1778ms     | 0ms         | 2kB         | 0kB         | 2kB         |
| 9    | kanban-sveltekit      | 1372ms | **2900ms** | **+1528ms** | 71kB        | 0.3kB       | 71kB        |
| 10   | kanban-nextjs-cf      | 2836ms | 3196ms     | **+360ms**  | 173kB       | 17kB        | 190kB       |
| 11   | kanban-nextjs         | 2952ms | 3316ms     | **+364ms**  | 176kB       | 18kB        | 194kB       |

---

## Table 1B: Complete Performance Rankings (4G Network)

Sorted by **LCP** (the metric that matters most for UX):

| Rank | Framework             | FCP   | LCP        | LCP-FCP    | Bundle JS   | Bundle CSS  | Total       |
| ---- | --------------------- | ----- | ---------- | ---------- | ----------- | ----------- | ----------- |
| 1    | kanban-tanstack-solid | 152ms | 152ms      | 0ms        | 58kB        | 0kB         | 58kB        |
| 2    | kanban-tanstack       | 152ms | 152ms      | 0ms        | 131kB       | 0kB         | 131kB       |
| 3    | kanban-qwikcity       | 560ms | 560ms      | 0ms        | 45kB        | 21kB        | 66kB        |
| 4    | kanban-solidstart     | 688ms | 688ms      | 0ms        | 45kB        | 0kB         | 45kB        |
| 5    | kanban-nextjs         | 504ms | **892ms**  | **+388ms** | 176kB       | 18kB        | 194kB       |
| 6    | kanban-analog         | 928ms | 928ms      | 0ms        | 118kB       | 0kB         | 118kB       |
| 7    | kanban-sveltekit      | 412ms | **1120ms** | **+708ms** | 71kB        | 0.3kB       | 71kB        |
| -    | kanban-marko          | -     | -          | -          | 43kB        | 0kB         | 43kB        |
| -    | kanban-nuxt           | -     | -          | -          | 100kB       | 0kB         | 100kB       |
| -    | kanban-htmx           | -     | -          | -          | 2kB         | 0kB         | 2kB         |
| -    | kanban-nextjs-cf      | -     | -          | -          | 173kB       | 17kB        | 190kB       |

**Note**: Next.js Vercel shows an LCP delay of +388ms on 4G. SvelteKit still shows an LCP delay of +708ms even on 4G, though significantly reduced from the +1528ms delay on 3G. Four frameworks (Marko, Nuxt, HTMX, Next.js CF) don't have 4G measurements yet.

---

## Table 2: 3G vs 4G Performance (LCP Focus)

| Framework             | 3G LCP | 4G LCP | Improvement | % Faster |
| --------------------- | ------ | ------ | ----------- | -------- |
| kanban-tanstack-solid | 876ms  | 152ms  | -724ms      | 82.7%    |
| kanban-tanstack       | 1604ms | 152ms  | -1452ms     | 90.5%    |
| kanban-qwikcity       | 1676ms | 560ms  | -1116ms     | 66.6%    |
| kanban-solidstart     | 1596ms | 688ms  | -908ms      | 56.9%    |
| kanban-analog         | 1620ms | 928ms  | -692ms      | 42.7%    |
| kanban-sveltekit      | 2900ms | 1120ms | -1780ms     | 61.4%    |
| kanban-nextjs         | 3316ms | 892ms  | -2424ms     | 73.1%    |

**Key Insight**: All frameworks show significant improvement on 4G. SvelteKit still has the slowest LCP at 1120ms on 4G (vs 2900ms on 3G). Next.js (Vercel) shows the largest absolute improvement (-2424ms) due to its high 3G baseline, but still maintains an LCP delay of +388ms even on 4G.

**Note**: Four frameworks (Marko, Nuxt, HTMX, Next.js CF) don't have 4G measurements yet, so they cannot be included in this comparison.

---

## Bundle Size Data (Complete)

**Solution Implemented**: CDP (Chrome DevTools Protocol) Network domain now captures accurate transfer sizes regardless of Timing-Allow-Origin headers.

**Complete bundle data** (3G Board Page):

- Marko: 43kB JS
- SolidStart: 45kB JS
- TanStack Start (Solid): 58kB JS
- Qwik: 66kB (45kB JS + 21kB CSS)
- SvelteKit: 71kB JS
- Nuxt: 100kB JS
- Analog: 118kB JS
- TanStack Start (React): 131kB JS
- Next.js CF (Cloudflare Pages): 190kB (173kB JS + 17kB CSS)
- Next.js (Vercel): 194kB (176kB JS + 18kB CSS)

**Note**: Some frameworks show 0kB on home page because they use pure SSR with no client-side JavaScript until navigation.

---

## Key Performance Insights

### 1. LCP is King for UX

**FCP measures first paint, but LCP measures when users can see the main content.**

SvelteKit's problem:

- Fast initial paint (1372ms FCP)
- But main content doesn't load until 2900ms (LCP)
- Users see a shell for 1.5 seconds before it becomes useful

This is why **LCP, not FCP, should be the primary metric**.

### 2. Fastest Frameworks (744-876ms LCP)

The fastest frameworks with complete 50-run measurements:

- **Marko**: 744ms (LCP = FCP)
- **TanStack Start + Solid**: 876ms (LCP = FCP)

Both achieve LCP = FCP with small bundles, meaning the largest content element renders as soon as first paint occurs.

### 3. Traditional SSR Performance

- **Nuxt**: 1308ms LCP (good, LCP = FCP)
- **TanStack Start (React)**: 1604ms LCP (LCP = FCP)
- **SolidStart**: 1596ms LCP (**+652ms delay after FCP**)
- **SvelteKit**: 2900ms LCP (**+1528ms delay after FCP**)
- **Next.js CF**: 3196ms LCP (**+360ms delay after FCP**)

The LCP delays in SolidStart, SvelteKit, and Next.js CF suggest lazy-loaded content or heavy hydration overhead.

### 4. MPA Approaches (1620-1778ms LCP)

- **Analog**: 1620ms (LCP = FCP, consistent)
- **Qwik**: 1676ms (LCP = FCP, resumability working)
- **HTMX**: 1778ms (LCP = FCP, pure server rendering)

Slower overall but no LCP delays - what you see is what you get.

### 5. Bundle Size Paradox

**Smallest bundle ≠ Best UX**:

- HTMX: 2kB bundle, 1778ms LCP
- SvelteKit: 71kB bundle, **2900ms LCP** (worst!)
- TanStack: Unknown bundle, 256ms LCP (best!)

Network latency, server response time, and hydration strategy matter more than bundle size alone.

---

## Recommendations by Use Case

### For Best UX (LCP Priority)

1. **Marko** (744ms LCP, 43kB) ⭐
2. **TanStack Start + Solid** (876ms LCP, 58kB) ⭐

**Best for**: Apps where speed is critical. Both achieve LCP = FCP with minimal bundle sizes.

### For Balanced SSR + Performance

1. **Nuxt** (1308ms LCP, 100kB, LCP = FCP) ⭐
2. **TanStack Start (React)** (1604ms LCP, 131kB, LCP = FCP)
3. **Analog** (1620ms LCP, 118kB, LCP = FCP)
4. **Qwik** (1676ms LCP, 66kB, LCP = FCP)
5. **HTMX** (1778ms LCP, 2kB, LCP = FCP)

**Best for**: Content sites, marketing, e-commerce with SEO needs

### ⚠️ NOT RECOMMENDED for Mobile (3G)

1. **SvelteKit** - 2900ms LCP with +1528ms delay is unacceptable for mobile UX
2. **Next.js (both Vercel and Cloudflare)** - 3196-3316ms LCP with +360-364ms delays despite React Server Components
3. **SolidStart** - 1596ms LCP with +652ms delay needs investigation

These frameworks may work on fast connections but show significant LCP delays on realistic mobile networks. Notably, both Next.js deployment platforms (Vercel and Cloudflare Pages) exhibit similar LCP delay issues.

---

## Technical Analysis

### SSR Architecture Comparison

**All frameworks use SSR**, but implementation differs:

1. **Streaming SSR** (TanStack, Marko, Next.js RSC)
   - HTML sent progressively as rendered
   - Fast TTFB, content arrives immediately
   - LCP = FCP (256-266ms)

2. **Traditional SSR** (Nuxt, Analog, Qwik, HTMX)
   - Complete HTML rendered before sending
   - Slower TTFB but simpler architecture
   - LCP = FCP (1308-1778ms)

3. **SSR with Issues** (SolidStart, SvelteKit)
   - SSR with delayed LCP
   - Hydration or code-splitting problems
   - LCP > FCP (delays of 652-1528ms)

### Why SvelteKit Has LCP Issues

Possible causes for the 1528ms LCP delay:

1. **Lazy-loaded critical chunks** - Code split with chunks loading after FCP
2. **Heavy hydration** - Client-side JavaScript takes 1.5s to make content interactive
3. **Delayed component mounting** - Svelte components not mounting until hydration complete
4. **Image loading strategy** - Largest content element (image) loads after initial render

**Needs investigation**: Profile SvelteKit's waterfall to identify the bottleneck.

### Why Streaming SSR Wins on LCP

Streaming SSR frameworks (TanStack, Marko, Next.js RSC) achieve LCP = FCP because:

1. **HTML streams progressively** - content sent as soon as it's ready
2. **Fast TTFB** - server responds quickly with initial HTML chunk
3. **Lightweight hydration** - minimal JavaScript needed to make content interactive
4. **Optimized critical path** - largest content sent in first chunk

### Why Non-Streaming SSR Struggles

Traditional SSR frameworks render complete HTML before sending:

1. **Wait for full page render** - server must finish entire HTML before sending
2. **Slower TTFB** - client waits for complete server render
3. **Heavy hydration** - large JavaScript bundles must execute before interactive
4. **Lazy-loaded chunks** - code splitting can delay LCP if critical content needs lazy-loaded JS

---

## Action Items

### High Priority

1. **Fix bundle size measurement** - Implement CDP Network domain
2. **Investigate SvelteKit LCP delay** - Profile to find 1.5s bottleneck
3. **Investigate SolidStart LCP delay** - 652ms gap needs explanation
4. **Complete 4G measurements** for missing frameworks

### Medium Priority

1. **Add TTI (Time to Interactive)** measurements
2. **Test on real devices** to validate emulation
3. **Measure warm cache** performance with `--include-warm`
4. **Add INP (Interaction to Next Paint)** for responsiveness

### Low Priority

1. **Document LCP measurement methodology** in README
2. **Create LCP waterfall visualizations** for debugging
3. **Test subsequent navigations** for MPA benefits

---

## Measurement Quality

### ✅ Working Correctly

1. **FCP/LCP Timing**: PerformanceObserver injected before navigation
2. **Cold Cache Only**: Default behavior, warm cache optional
3. **Consistent Warmup**: Single warmup primes server/CDN
4. **Statistical Rigor**: 50 runs with 95% confidence intervals
5. **LCP Detection**: Correctly showing delays for SvelteKit/SolidStart

### ⚠️ Needs Fix

1. **Bundle Size Measurement**: Resource Timing API returns 0 for 4 frameworks
2. **Missing 4G Data**: Some measurements incomplete

---

## Optimization Experiment: Single-Bundle Configuration

**Hypothesis**: The LCP delays in SvelteKit and SolidStart were caused by code-splitting, where critical content waits for additional JavaScript chunks to download. Bundling everything into a single file should eliminate this delay.

**Test Date**: November 10, 2025

### Optimizations Applied

**SvelteKit Optimized** (`kanban-sveltekit-optimized`):
- Added `modulePreload.polyfill: true` in vite.config.ts
- Set `manualChunks: undefined` to disable code splitting
- Deployed to: https://kanban-sveltekit-optimized.vercel.app/

**SolidStart Optimized** (`kanban-solidstart-optimized`):
- Added `modulePreload.polyfill: true` in app.config.ts
- Set `manualChunks: undefined` to bundle all JS into one file
- Deployed to: https://kanban-solidstart-optimized.vercel.app/

### Results: Both Optimizations FAILED

| Framework | Original LCP (3G) | Optimized LCP (3G) | Change | Result |
|-----------|-------------------|--------------------| -------|--------|
| **SvelteKit** | 2900ms | **3244ms** | **+344ms (+12%)** | ❌ **WORSE** |
| **SolidStart** | 1596ms | **1692ms** | **+96ms (+6%)** | ❌ **WORSE** |

### Detailed Metrics (3G Board Page)

**SvelteKit Optimized**:
- FCP: 2422ms (vs 1372ms original, +1050ms slower)
- LCP: 3244ms (vs 2900ms original, +344ms slower)
- FCP-LCP Delay: 822ms (vs 1528ms original, -706ms improvement BUT overall worse)
- Bundle: 80.2kB JS (vs 71kB original, +9.2kB larger)

**SolidStart Optimized**:
- FCP: 1056ms (vs 944ms original, +112ms slower)
- LCP: 1692ms (vs 1596ms original, +96ms slower)
- FCP-LCP Delay: 637ms (vs 652ms original, minimal change)
- Bundle: 45.5kB JS (vs 45kB original, +0.5kB larger)

### Why the Optimizations Failed

**1. Bandwidth is the Real Bottleneck on 3G**
- Larger single bundles take longer to download than multiple smaller chunks
- 3G (400 Kbps) throughput means every extra KB costs ~20ms
- Code splitting actually HELPS by allowing parallel downloads

**2. The FCP-LCP Delay Wasn't the Root Problem**
- SvelteKit's delay reduced from 1528ms to 822ms, but FCP got 1050ms SLOWER
- The delay came from rendering/hydration, not waiting for additional JS chunks
- Single bundle forces downloading ALL code before first paint

**3. Browser Optimization Works Better**
- Modern browsers parallelize chunk downloads efficiently
- Preload hints and modulepreload speed up code-split architectures
- Single-bundle defeats browser's smart loading strategies

### 4G Results (for comparison)

**SvelteKit Optimized (4G)**:
- FCP: 438ms
- LCP: 1184ms
- FCP-LCP Delay: 746ms
- Better than 3G but still has delay

**SolidStart Optimized (4G)**:
- FCP: 728ms
- LCP: 728ms
- FCP-LCP Delay: 0ms
- Perfect! LCP = FCP on 4G

### Key Learnings

1. **Don't assume code-splitting causes delays** - The LCP delays in SvelteKit/SolidStart come from hydration/rendering, not waiting for additional JS downloads

2. **Bandwidth matters more than chunk count on 3G** - Larger bundles hurt more than multiple small requests

3. **Browser optimization is sophisticated** - Modern browsers handle code-split architectures well with preloading

4. **Profile before optimizing** - We should have analyzed the waterfall before assuming the cause

### Next Steps

The real optimization should focus on:

1. **Reduce hydration overhead** - Both frameworks need lighter client-side JavaScript execution
2. **Optimize critical rendering path** - Identify what's blocking LCP and defer non-critical work
3. **Improve server response time** - Faster TTFB helps all metrics
4. **Use proper preloading** - Ensure critical resources are preloaded correctly

**Conclusion**: Single-bundle configuration is NOT the solution for SvelteKit/SolidStart's LCP problems. The issues stem from hydration and rendering overhead, not code-splitting delays.

---

## Conclusion

**LCP, not FCP, should drive framework selection for mobile users.**

- **Winners**: Marko (744ms), TanStack Start + Solid (876ms) - both with LCP = FCP
- **Solid choices**: Nuxt, TanStack Start (React), Analog, Qwik, HTMX (1300-1800ms LCP, all with LCP = FCP)
- **Problems**: SvelteKit (2900ms, +1528ms delay), Next.js CF (3196ms, +360ms delay), SolidStart (1596ms, +652ms delay)

The 4.3x difference between fastest (Marko: 744ms) and slowest (Next.js CF: 3196ms) LCP is massive for user experience on mobile networks. Additionally, frameworks with LCP delays provide poor UX even if FCP is fast.
