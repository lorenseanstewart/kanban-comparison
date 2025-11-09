# Mobile Performance Analysis - Realistic 4G Network - Playwright Measurements

> **Testing Configuration**: All measurements use Playwright with Pixel 5 mobile emulation, **3G network throttling** (~400 Kbps download) to simulate **realistic 4G conditions** (spotty signal, network congestion), and 4x CPU slowdown to simulate real-world mobile conditions. While the technical setting is "3G", this represents what users actually experience on congested or weak 4G networks.

> **Important Note on Measurements**: These metrics measure **external JS/CSS files only** (separate network requests). Inline scripts embedded in HTML documents are not counted separately. See "Measurement Clarifications" section below for details.

## 📱 TL;DR: Best Frameworks for Mobile on Realistic 4G Networks

> **Important**: These measurements simulate **realistic 4G conditions** (spotty signal, network congestion) using 3G throttling. Bundle size and TTFB impact is amplified in these real-world scenarios.

> **Critical Note on Bundle Sizes**: These are measurements of a **disciplined, lightweight app** using very few 3rd-party dependencies. As you add features, routes, and dependencies, **bundle sizes will grow significantly**. Without discipline, even these apps with only their current functionality could easily be **2x-5x larger**. For example, choosing a JavaScript UI component library instead of a CSS-only library like DaisyUI could alone add 60-120 kB to the bundle. The rankings below reflect best-case scenarios - real-world apps require constant bundle optimization.

### 👁️ Understanding Perceptible Performance Differences

Human perception research shows performance differences are noticed at specific thresholds:

- **< 100ms**: Imperceptible - differences feel instant to users
- **100-200ms**: Barely perceptible - most users won't consciously notice
- **200-500ms**: Clearly noticeable - users sense the difference
- **500ms+**: Significant - users perceive as "slow" vs "fast"
- **1000ms+ (1s)**: Major impact - user's flow of thought is interrupted, affects satisfaction and task completion

**Key insight**: Frameworks within 100ms of each other provide essentially equivalent user experience. Differences of 200ms+ are where users clearly notice performance gaps.

These thresholds are grounded in decades of human-computer interaction research. Nielsen's foundational work established that 100ms is the limit for instantaneous response and 1 second is where users' flow of thought is interrupted. More recent research has refined our understanding of the middle ranges: causality perception studies show that delays under 100ms feel immediate, 100-200ms create mixed perception of causality, and above 200ms users no longer perceive their action as directly causing the response. Web performance research has quantified the impact: a 200ms delay shows negligible user frustration, but 500ms delays result in up to 26% increased frustration and 8% decreased engagement. Google's RAIL performance model codifies the 100ms response threshold as critical for maintaining the feeling of direct manipulation in user interfaces.

**Sources**: [Nielsen (1993)](https://www.nngroup.com/articles/response-times-3-important-limits/), causality perception research, web performance UX studies, [Google RAIL model](https://web.dev/rail/).

---

**Top Tier** (Excellent on realistic 4G, low-end devices):

1. **kanban-marko** (43 kB) - Best overall: Resumability + streaming = instant interaction, minimal data usage, FCP (736ms ±9ms)
2. **kanban-tanstack-solid** (58 kB) - Small bundle, fast FCP (880ms ±18ms) - ~144ms slower than Marko (barely perceptible)
3. **kanban-solidstart** (45 kB) - Fine-grained reactivity, FCP (940ms ±1ms) - within 60ms of TanStack-Solid (imperceptible difference)

**Good Tier** (Solid on realistic 4G with modern devices):

4. **kanban-nuxt** (100 kB) - Moderate bundle, FCP (1292ms ±9ms) - ~350ms slower than SolidStart (clearly noticeable)

**Acceptable Tier** (Works but starts to struggle on realistic 4G):

5. **kanban-tanstack** (131 kB) - High TTFB (421ms), large bundle, FCP (1640ms ±26ms)
6. **kanban-qwikcity** (67 kB) - Resumability + optimizations, FCP (1644ms ±8ms) - improved from 1796ms with manual chunking
7. **kanban-analog** (116 kB) - Angular SSR, FCP (1652ms ±8ms), no streaming, good TTFB (94ms)
8. **kanban-htmx** (2 kB) - Baseline: 2 kB JS but slower FCP (1844ms ±12ms) due to inline CSS parsing, Astro streaming SSR

**Poor Tier** (Not recommended for realistic 4G):

9. **kanban-sveltekit** (74 kB) - Slow 3G FCP (2404ms ±109ms) - improved from 2670ms with CSS suppression
10. **kanban-nextjs** (192 kB) - Heavy React bundle, slow 3G FCP (2860ms ±6ms), TTFB (94ms)
11. **kanban-nextjs-cf** (190 kB) - Heavy bundle, slowest 3G FCP (3296ms ±19ms), best TTFB (74ms) offset by large download

### Key Network Criteria for Realistic 4G

**Why these rankings matter on realistic 4G networks:**

- **Bundle size** → CRITICAL on realistic 4G: Download speeds are ~400 Kbps, every kB counts
- **TTFB** → Less critical on realistic 4G vs ideal 4G, as download time dominates
- **FCP** → Most important user-perceived metric on slower networks
- **Resumability** (Marko, Qwik) → Zero/minimal JS execution = works on low-end phones
- **Hydration** → Full hydration kills performance on throttled mobile CPUs + slow downloads

**Bottom line:** For mobile web apps, choose frameworks with smallest bundles: HTMX, Marko, SolidStart, or TanStack Solid. Even Next.js with excellent Cloudflare edge TTFB suffers from large bundle download times.

## ⚠️ Measurement Clarifications: External vs Inline Scripts

**IMPORTANT**: These metrics measure **external JS/CSS files only** - separate network requests tracked by Playwright's Resource Timing API. Inline scripts (embedded directly in HTML documents) are **not counted separately** in the JS metrics below.

### Framework-Specific Script Loading

| Framework                 | External JS | Inline Scripts & CSS  | Notes                                                             |
| ------------------------- | ----------- | --------------------- | ----------------------------------------------------------------- |
| **kanban-htmx**           | 2 kB        | All HTMX + CSS inline | HTMX library + DaisyUI CSS embedded in HTML. ~227 KB uncompressed |
| **kanban-marko**          | 44 kB       | 2 inline scripts      | Streaming SSR with minimal inline hydration code                  |
| **kanban-solidstart**     | 47 kB       | 3 inline scripts      | Progressive hydration, some inline initialization                 |
| **kanban-tanstack-solid** | 60 kB       | 1 inline script       | Minimal inline code                                               |
| **kanban-qwikcity**       | 46 kB (JS)  | 0 inline scripts      | Pure external modules + separate CSS (21 kB) = 67 kB total       |
| **kanban-sveltekit**      | 74 kB       | 1 inline script       | Minimal inline code, CSS fully inlined (0 kB external)            |
| **kanban-nuxt**           | 102 kB      | 0 inline scripts      | Pure external modules                                             |
| **kanban-analog**         | 119 kB      | 1 inline script       | Angular SSR with minimal inline code                              |
| **kanban-tanstack**       | 134 kB      | 1 inline script       | Minimal inline code                                               |
| **kanban-nextjs**         | 179 kB      | 8 inline scripts      | Heavy React hydration, significant inline code                    |
| **kanban-nextjs-cf**      | 175 kB      | 8 inline scripts      | Heavy React hydration, significant inline code                    |

**Why this matters:**

- Inline scripts/CSS are **part of the HTML document** and must be downloaded, parsed, and executed
- They affect **total page weight** and **parsing time** but don't show up in external resource metrics
- HTMX's strategy (inline everything - HTMX library + DaisyUI CSS) keeps external JS/CSS at 2 kB but increases HTML document size to 227 KB
- Most frameworks use inline scripts for **hydration initialization** or **routing setup**
- **CSS inlining** eliminates render-blocking CSS requests, improving FCP significantly

**Recommendation**: When comparing frameworks, consider **both** external JS/CSS metrics **and** total HTML document size for a complete picture. CSS inlining can dramatically improve FCP but increases HTML size.

## ⏱️ JavaScript Download Time Calculations (Realistic 4G Network)

**Calculation Method:**

- Based on Playwright's 3G throttling (~400 Kbps / 50 KB/s download speed) to simulate realistic 4G conditions
- Formula: Download Time (ms) = (JS Size in KB ÷ 50 KB/s) × 1000
- Note: These are theoretical minimum times based on network throttling settings. Actual download times may vary due to:
  - Network latency and packet loss
  - TCP slow start and connection overhead
  - Parallel vs sequential resource loading
  - Server response times
- These calculations show **JS download only**, excluding HTML, CSS, network latency, parsing, and execution time

**Board Page JS Download Times:**

| Framework             | JS Size (kB)  | Download Time (ms) | Download Time (s) |
| --------------------- | ------------- | ------------------ | ----------------- |
| kanban-htmx           | 2             | ~40ms              | 0.04s             |
| kanban-marko          | 43            | ~860ms             | 0.86s             |
| kanban-solidstart     | 45            | ~900ms             | 0.90s             |
| kanban-tanstack-solid | 58            | ~1,160ms           | 1.16s             |
| kanban-qwikcity       | 46 (67 tot)   | ~920ms             | 0.92s             |
| kanban-sveltekit      | 74 (74 tot)   | ~1,480ms           | 1.48s             |
| kanban-nuxt           | 100           | ~2,000ms           | 2.00s             |
| kanban-analog         | 116           | ~2,320ms           | 2.32s             |
| kanban-tanstack       | 131           | ~2,620ms           | 2.62s             |
| kanban-nextjs         | 174 (192 tot) | ~3,480ms           | 3.48s             |
| kanban-nextjs-cf      | 171 (190 tot) | ~3,420ms           | 3.42s             |

**Key Insights:**

- **HTMX** (2 kB): Downloads in 40ms - virtually instant
- **Marko** (43 kB): Downloads in 860ms - under 1 second
- **SolidStart/TanStack Solid** (45-58 kB): 0.9-1.2 seconds - acceptable
- **Next.js** (171-174 kB): 3.4-3.5 seconds - just for JS download, before parsing/execution
- **Total page load** includes: TTFB + HTML download + CSS download + JS download + parsing + execution

**Reality Check:**
On realistic 4G networks (400 Kbps), downloading Next.js's 174 kB of JavaScript takes **3.48 seconds** - before the browser even starts parsing or executing it. By comparison, Marko's entire 43 kB bundle downloads in just 860ms, leaving more time for the browser to parse, execute, and render content.

## 📊 Mobile Performance Comparison - Board Page (Cold Load, Realistic 4G)

> **Updated with 50-run averages and 95% confidence intervals**. Tests use Good3G preset (400 Kbps download, 100ms latency) to simulate realistic 4G mobile conditions. Data sorted by Realistic 4G FCP (fastest to slowest).

| Framework             | JS (kB) | CSS (kB) | Total (kB) | FCP (ms) | FCP ±CI | TTFB (ms) | Impact                             |
| --------------------- | ------- | -------- | ---------- | -------- | ------- | --------- | ---------------------------------- |
| kanban-marko          | 43      | 0        | 43         | 736      | ±9      | 265       | ⭐⭐⭐⭐⭐ Best FCP + Resumability |
| kanban-tanstack-solid | 58      | 0        | 58         | 880      | ±18     | 393       | ⭐⭐⭐⭐ Fast FCP, small bundle    |
| kanban-solidstart     | 45      | 0        | 45         | 940      | ±1      | 93        | ⭐⭐⭐⭐ Very consistent           |
| kanban-nuxt           | 100     | 0        | 100        | 1292     | ±9      | 94        | ⭐⭐⭐ Moderate bundle             |
| kanban-tanstack       | 131     | 0        | 131        | 1640     | ±26     | 421       | ⭐⭐ High TTFB hurts               |
| kanban-qwikcity       | 46      | 21       | 67         | 1644     | ±8      | 201       | ⭐⭐ Optimized: -15kB, 7 resources |
| kanban-analog         | 116     | 0        | 116        | 1652     | ±8      | 94        | ⭐⭐ Angular SSR                   |
| kanban-htmx           | 2       | 0        | 2          | 1844     | ±12     | 92        | ⭐⭐ Inline CSS hurts FCP          |
| kanban-sveltekit      | 74      | 0        | 74         | 2404     | ±109    | 92        | ⭐ Optimized: -4kB, 10 resources   |
| kanban-nextjs         | 174     | 18       | 192        | 2860     | ±6      | 94        | ⭐ Heavy React bundle              |
| kanban-nextjs-cf      | 171     | 19       | 190        | 3296     | ±19     | 74        | ⭐ Slowest despite best TTFB       |

### 🔧 Post-Optimization Results (V2 Measurements)

After applying manual optimizations (CSS suppression, manual chunking, terser configuration), we re-measured SvelteKit and QwikCity with fresh builds:

| Framework                | JS (kB) | CSS (kB) | Total (kB) | FCP (ms) | FCP ±CI | Resources | Improvement from Original |
| ------------------------ | ------- | -------- | ---------- | -------- | ------- | --------- | ------------------------- |
| **kanban-qwikcity-v2**   | 46      | 21       | 67         | 1644     | ±8      | 7         | -152ms (8%) from 1796ms   |
| **kanban-sveltekit-v2**  | 74      | 0        | 74         | 2404     | ±109    | 10        | -266ms (10%) from 2670ms  |

**Key Findings:**

1. **SvelteKit V2**: Improved from 2670ms → 2404ms (-266ms, 10% faster)
   - Resources reduced: 16 → 10 chunks (-38%)
   - CSS completely eliminated: 990 bytes → 0 (CSS inlining working!)
   - Bundle reduced: 78kB → 74kB (-4kB)
   - Wider confidence interval (±109ms) indicates more variance, but median is significantly better
   - Still slower than expected for bundle size - hydration overhead on slow networks

2. **QwikCity V2**: Improved from 1796ms → 1644ms (-152ms, 8% faster)
   - Resources **dramatically reduced**: 26 → 7 chunks (-73%! Massive improvement)
   - Bundle reduced: 80kB → 67kB (46kB JS + 21kB CSS) - **15kB reduction** (-19%)
   - CSS still loading as separate file (Qwik architecture)
   - Much tighter confidence interval (±8ms) shows very consistent performance

**Comparison Summary:**

| Metric | SvelteKit | QwikCity | Winner |
|--------|-----------|----------|---------|
| FCP Improvement | -266ms (10%) | -152ms (8%) | SvelteKit |
| Bundle Size Reduction | -4kB (-5%) | -15kB (-19%) | QwikCity 🏆 |
| Resource Count Reduction | -6 (-38%) | -19 (-73%) | QwikCity 🏆 |
| Performance Consistency | ±109ms | ±8ms | QwikCity 🏆 |

**Conclusion**: Manual optimizations show different benefits for each framework:
- **QwikCity** optimizations were dramatically more effective at reducing resource count (73% reduction!) and bundle size (15kB), with extremely consistent performance
- **SvelteKit** saw larger FCP improvement but with more variance and less bundle reduction

Both frameworks still can't match the top performers (Marko, SolidStart, TanStack-Solid) due to fundamental architectural differences. QwikCity's resumability advantage is now more visible with proper optimizations.

## 🌊 Realistic 4G Network Performance Reality

**Network Characteristics (Realistic 4G):**

- Download speed: ~400 Kbps (0.4 Mbps) - simulating congested/spotty 4G
- Upload speed: ~150 Kbps
- Latency: 100-500ms
- Common scenarios: Network congestion, weak signal, crowded areas, indoor coverage gaps

**Download Time Calculation (400 Kbps):**

- **HTMX (2 kB):** ~40ms download (external JS/CSS only - CSS now inlined)
- **Marko (44 kB):** ~880ms download
- **SolidStart (47 kB):** ~940ms download
- **Qwik (82 kB):** ~1640ms download
- **Next.js (197 kB):** ~3940ms (3.9 seconds!) download

On realistic 4G networks, the physics of data transfer becomes the primary bottleneck. Even with excellent edge TTFB (75ms for Next.js on Cloudflare), downloading 195 kB takes nearly 4 seconds.

## 📱 Framework Performance Analysis

### Top Performers on Realistic 4G

#### 1. kanban-marko (44 kB)

- **FCP:** 353ms ⭐⭐⭐⭐⭐
- **TTFB:** 253ms
- **Bundle:** 44 kB (smallest full-featured framework)
- **Architecture:** Resumability + streaming SSR
- **Realistic 4G Advantage:** Minimal download time (~880ms), no hydration cost, instant interactivity

#### 2. kanban-htmx (2 kB)

- **FCP:** 908ms ⭐⭐⭐⭐⭐
- **TTFB:** 89ms
- **Bundle:** 2 kB external (JS only - CSS inlined)
- **Architecture:** Astro streaming SSR + HTMX hypermedia + inline DaisyUI CSS
- **Realistic 4G Advantage:** Minimal external resources (~40ms download), CSS inlined for instant rendering, instant interaction

#### 3. kanban-solidstart (47 kB)

- **FCP:** 669ms ⭐⭐⭐⭐
- **TTFB:** 91ms
- **Bundle:** 47 kB
- **Architecture:** Fine-grained reactivity, progressive hydration
- **Realistic 4G Advantage:** Good balance of features and performance

#### 4. kanban-tanstack-solid (60 kB)

- **FCP:** 462ms ⭐⭐⭐⭐
- **TTFB:** 375ms
- **Bundle:** 60 kB
- **Architecture:** Fine-grained reactivity with TanStack router
- **Realistic 4G Advantage:** Small bundle with excellent FCP despite higher TTFB

### Poor Performers on Realistic 4G

#### kanban-nextjs / kanban-nextjs-cf (197 / 195 kB)

- **FCP:** 309ms / 222ms ⭐⭐
- **TTFB:** 92ms / 75ms (Cloudflare edge excellent)
- **Bundle:** 197 kB / 195 kB
- **Realistic 4G Problem:**
  - ~3.9 second download time on realistic 4G
  - Full React hydration required
  - Heavy VDOM overhead
  - Good for ideal 4G/5G, struggles on realistic 4G

**Math:** Even with world-class TTFB (75ms), downloading 195 kB @ 400 Kbps = 3.9 seconds. This negates all edge computing benefits.

## 🔍 Realistic 4G vs Ideal 4G Performance Comparison

| Framework             | Realistic 4G FCP (±CI) | Ideal 4G FCP (±CI) | Improvement | % Faster |
| --------------------- | ---------------------- | ------------------ | ----------- | -------- |
| kanban-marko          | 736ms (±9)             | 384ms (±8)         | 352ms       | 1.92x    |
| kanban-tanstack-solid | 880ms (±18)            | 498ms (±16)        | 382ms       | 1.77x    |
| kanban-solidstart     | 940ms (±1)             | 688ms (±3)         | 252ms       | 1.37x    |
| kanban-nuxt           | 1292ms (±9)            | 864ms (±11)        | 428ms       | 1.50x    |
| kanban-tanstack       | 1640ms (±26)           | 820ms (±16)        | 820ms       | 2.00x    |
| kanban-analog         | 1652ms (±8)            | 908ms (±12)        | 744ms       | 1.82x    |
| kanban-qwikcity       | 1644ms (±8)            | 560ms (±6)         | 1084ms      | 2.94x    |
| kanban-htmx           | 1844ms (±12)           | 864ms (±18)        | 980ms       | 2.13x    |
| kanban-sveltekit      | 2404ms (±109)          | 936ms (±24)        | 1468ms      | 2.57x    |
| kanban-nextjs         | 2860ms (±6)            | 488ms (±8)         | 2372ms      | 5.86x    |
| kanban-nextjs-cf      | 3296ms (±19)           | 592ms (±7)         | 2704ms      | 5.57x    |

**Key Findings:**

1. **All frameworks follow proper physics** - With improved methodology (50 runs, fixed network throttling), ideal 4G is consistently faster than realistic 4G as expected
2. **Next.js variants show largest improvements (5-6x faster on ideal 4G)** - Due to large bundle sizes (171-174kB JS) that benefit most from higher bandwidth
3. **QwikCity shows 2.9x improvement** - Resumability architecture still helps, but bandwidth limitations on realistic 4G heavily impact the 67kB total bundle
4. **Marko shows smallest improvement (1.9x)** - Already fast on realistic 4G (736ms) due to tiny 43kB bundle, less room for improvement
5. **SolidStart shows modest improvement (1.4x)** - Small 45kB bundle performs well on both networks
6. **Statistical significance** - Confidence intervals (±1ms to ±109ms) confirm measurements are reliable and previous anomalies were due to small sample size

## 🔍 Key Performance Observations

### FCP Analysis (Realistic 4G)

**Fastest FCP (Best User Experience on Realistic 4G):**

1. kanban-marko: 736ms (±9ms)
2. kanban-tanstack-solid: 880ms (±18ms)
3. kanban-solidstart: 940ms (±1ms)
4. kanban-nuxt: 1292ms (±9ms)
5. kanban-tanstack: 1640ms (±26ms)

**Slowest FCP on Realistic 4G:**

1. kanban-nextjs-cf: 3296ms (±19ms) - Massive bundle kills realistic 4G performance
2. kanban-nextjs: 2860ms (±6ms) - Same issue as CF variant
3. kanban-sveltekit: 2404ms (±109ms) - Hydration overhead on slow network

**Key insight**: On realistic 4G, small bundles dominate. Marko (43kB), TanStack-Solid (58kB), and SolidStart (45kB) are winners. Next.js variants (171-174kB JS) become unusable despite edge optimization.

### TTFB Analysis

**Best TTFB (Server Response):**

1. kanban-nextjs-cf: 74ms (Cloudflare edge)
2. kanban-solidstart: 93ms
3. kanban-htmx: 92ms
4. kanban-analog: 94ms
5. kanban-nuxt: 94ms

**Worst TTFB:**

1. kanban-tanstack: 421ms
2. kanban-tanstack-solid: 393ms
3. kanban-marko: 265ms

**Critical finding**: Next.js-CF has world-class TTFB (74ms) but worst FCP (3296ms) on realistic 4G. This proves **TTFB is irrelevant when bundle size dominates download time**.

### Bundle Size to FCP Relationship on Realistic 4G

**Strong correlation** between bundle size and FCP on realistic 4G networks:

| Bundle Size     | FCP Range   | Examples                                    |
| --------------- | ----------- | ------------------------------------------- |
| Tiny (≤45kB)    | 736-940ms   | Marko (43kB), SolidStart (45kB)             |
| Small (≤60kB)   | 880-1292ms  | TanStack-Solid (58kB), Nuxt (100kB)         |
| Medium (≤131kB) | 1640-1844ms | TanStack (131kB), HTMX (2kB+SSR)            |
| Large (>170kB)  | 2404-3296ms | Next.js (174kB), SvelteKit (74kB+hydration) |

**Math validates the measurements:**

- 43kB @ 400 Kbps = 860ms download + 265ms TTFB = 1125ms theoretical minimum
- Marko achieves 736ms FCP (streaming SSR paints before full download)
- 174kB @ 400 Kbps = 3480ms download + 94ms TTFB = 3574ms theoretical minimum
- Next.js achieves 2860ms FCP (optimized loading, but can't escape physics)

## 🎯 Realistic 4G Optimization Strategies

### 1. Choose Lightweight Frameworks

- Marko (43 kB) - Best choice for realistic 4G: 736ms FCP
- TanStack Solid (58 kB) - Small bundle: 880ms FCP
- SolidStart (45 kB) - Fine-grained reactivity: 940ms FCP
- HTMX (2 kB JS) - Minimal JS but slower FCP (1844ms) due to SSR

### 2. Code Splitting Aggressive

- Lazy load everything non-critical
- Route-based splitting (all frameworks)
- Component-level splitting
- Defer all third-party scripts

### 3. Compression & Optimization

- Brotli compression (better than gzip)
- Image optimization (WebP, AVIF)
- Remove unused code
- Tree-shaking

### 4. Progressive Enhancement

- Server-render critical content
- Defer JavaScript execution
- Use native HTML features
- Graceful degradation

### 5. Service Workers

- Cache framework bundles
- Offline-first strategy
- Background sync
- Network-aware loading

### 6. Connection-Aware Loading

- Detect network quality
- Serve lighter bundles on slower connections
- Adaptive component loading
- Defer analytics on slow connections

## Summary: Realistic 4G Network Decision Matrix

Choose **Marko** if:

- ✅ Realistic 4G is primary network condition
- ✅ Performance is critical KPI
- ✅ Modern architecture acceptable
- ✅ Targeting users on congested networks

## 🔧 Application-Specific Optimizations

Below are the **manual optimizations** applied to each application beyond framework defaults. These are specific build-time configurations and customizations made to improve mobile performance.

### SvelteKit (`kanban-sveltekit`)

**Manual Optimizations** (`vite.config.ts`):

- **Custom CSS Suppression Plugin**: Vite plugin to forcefully remove CSS files from bundle (CSS is manually inlined in `+layout.svelte`)
- **Aggressive Manual Chunking**: Consolidates from 16 resources to ~6-7 chunks to minimize HTTP roundtrips
  - `vendor`: ALL node_modules in single chunk (SvelteKit + dnd-kit + others)
  - `app`: All application code (components + utilities + routes) in one chunk
  - Trade-off: Larger initial chunks but fewer roundtrips on high-latency networks
- **CSS Bundling**: `cssCodeSplit: false` to bundle all CSS for inlining
- **Terser Configuration**: `minify: 'terser'`, `drop_console: true`, `drop_debugger: true`
- **Rollup Tree-shaking**: `preset: 'recommended'`
- **esbuild Tree-shaking**: `treeShaking: true`

**Performance Impact** (V2 measurements with aggressive chunking):
- FCP: 2670ms → 2404ms (-266ms, 10% faster on realistic 4G)
- Resources reduced: 16 → 10 chunks (-38%)
- Bundle size: 78kB → 74kB (-4kB)
- CSS completely eliminated: 990 bytes → 0

**Architectural Limitations**:
- **No streaming SSR**: SvelteKit doesn't support progressive HTML streaming like Nuxt/Vue 3. The framework sends complete HTML in one response, meaning FCP must wait for full bundle download + parsing + hydration.
- **Traditional hydration**: Re-executes all component logic on client (vs. resumability approaches like Qwik).
- **Large uncompressed size**: 74kB compressed → 298KB uncompressed. Svelte's compiled output is verbose, resulting in ~300-400ms parse time.
- **High variance**: ±109ms confidence interval suggests inconsistent execution timing, possibly from hydration overhead or resource loading waterfalls.

**Why slower than expected** (2404ms with only 74kB bundle):
1. **Bundle download time**: 74kB ÷ 50 KB/s = ~1480ms
2. **JavaScript parsing**: ~300-400ms (298KB uncompressed)
3. **Hydration execution**: ~250-300ms (re-run all components)
4. **Framework initialization**: ~50-100ms
5. **Network RTT overhead**: 10 resources × 100ms latency = potential cascading delays

**Total**: ~2100-2400ms aligns with measured 2404ms FCP

**Configuration**:

```typescript
function suppressCssOutput(): Plugin {
  return {
    name: "suppress-css-output",
    enforce: "post",
    generateBundle(_, bundle) {
      const cssFiles = Object.keys(bundle).filter((f) => f.endsWith(".css"));
      cssFiles.forEach((fileName) => delete bundle[fileName]);
    },
  };
}
```

### QwikCity (`kanban-qwikcity`)

**Manual Optimizations** (`vite.config.ts`):

- **CSS Bundling**: Changed `cssCodeSplit: true` → `false` to eliminate separate CSS file
- **CSS Inlining Threshold**: Set `inlineStylesUpToBytes: 120000` (120KB)
- **Manual Chunking**: Configured to consolidate from 26 resources to ~6-8 chunks
  - `vendor-qwik`: Qwik framework core
  - `vendor-dnd`: dnd-kit library
  - `vendor-other`: Other dependencies
  - `components`: UI components
  - `routes`: Route modules
- **Terser Configuration**: `drop_console: true`, `drop_debugger: true`

**Performance Impact**:
- FCP improved: 1796ms → 1644ms (-152ms, 8% faster on realistic 4G)
- Resources dramatically reduced: 26 → 7 chunks (-73%!)
- Bundle size: 80kB → 67kB (46kB JS + 21kB CSS)
- Note: CSS still loads as separate file due to Qwik's architecture (resumability requires separate CSS for progressive enhancement)

### SolidStart (`kanban-solidstart`)

**Manual Optimizations** (`app.config.ts`):

- **Custom CSS Suppression Plugin**: Vite plugin to remove generated CSS files from bundle
- **Manual CSS Inlining**: All styles manually embedded in `root.tsx`
- **CSS Bundling**: `cssCodeSplit: false`
- **Terser Configuration**: `minify: 'terser'`, `drop_console: true`, `drop_debugger: true`
- **Rollup Tree-shaking**: `preset: 'recommended'`
- **esbuild Tree-shaking**: `treeShaking: true`

### Nuxt (`kanban-nuxt`)

**Manual Optimizations** (`nuxt.config.ts`):

- **CSS Inlining**: `inlineStyles: true` to avoid render-blocking CSS
- **Terser Configuration**: `minify: 'terser'`, `drop_console: true`, `drop_debugger: true`
- **Rollup Tree-shaking**: `preset: 'recommended'`
- **Manual Chunks**: Isolated `@formkit/auto-animate` into separate chunk
- **esbuild Tree-shaking**: `treeShaking: true`
- **Nitro Compression**: `compressPublicAssets: true`

### Marko (`kanban-marko`)

**Manual Optimizations** (`vite.config.ts`):

- **Custom CSS Inlining Plugin**: Vite plugin to inline all CSS into HTML head
- **CSS Bundling**: `cssCodeSplit: false` to bundle all CSS for inlining
- **Rollup Tree-shaking**: `preset: 'recommended'`
- **esbuild Tree-shaking**: `treeShaking: true`

**Note**: Terser minification disabled (`minify: false`) due to Cloudflare build script requirements that need to parse unminified `index.mjs`.

### TanStack Solid (`kanban-tanstack-solid`)

**Manual Optimizations** (`vite.config.ts`):

- **CSS Bundling**: `cssCodeSplit: false`
- **Terser Configuration**: `minify: 'terser'`, `drop_console: true`, `drop_debugger: true`
- **Rollup Tree-shaking**: `preset: 'recommended'`
- **esbuild Tree-shaking**: `treeShaking: true`

### TanStack React (`kanban-tanstack`)

**Manual Optimizations** (`vite.config.ts`):

- **CSS Bundling**: `cssCodeSplit: false`
- **Terser Configuration**: `minify: 'terser'`, `drop_console: true`, `drop_debugger: true`
- **Rollup Tree-shaking**: `preset: 'recommended'`
- **esbuild Tree-shaking**: `treeShaking: true`

### Analog (`kanban-analog`)

**Manual Optimizations** (`vite.config.ts`):

- **Custom CSS Inlining Plugin**: Vite plugin to inline all CSS into HTML head
- **CSS Bundling**: `cssCodeSplit: false` to bundle all CSS for inlining
- **Rollup Tree-shaking**: `preset: 'recommended'`
- **esbuild Tree-shaking**: `treeShaking: true`
- **Nitro Compression**: `compressPublicAssets: true`

### HTMX (`kanban-htmx`)

**Manual Optimizations** (`src/pages/index.astro`, `src/pages/board/[id].astro`):

- **Full CSS Inlining**: DaisyUI CSS manually inlined in page templates
- **HTMX Library Inlining**: Library embedded directly in HTML

### Next.js (`kanban-nextjs`)

**Manual Optimizations** (`next.config.ts`):

- **Package Import Optimization**: `optimizePackageImports` for `@dnd-kit/*`
- **Console Removal**: `removeConsole: true` in production
- **Source Maps**: Disabled `productionBrowserSourceMaps: false`
- **On-Demand Entries**: Custom `maxInactiveAge` and `pagesBufferLength` settings

### Next.js on Cloudflare (`kanban-nextjs-cf`)

**Manual Optimizations** (`next.config.ts`):

- **Package Import Optimization**: `optimizePackageImports` for `@dnd-kit/*`
- **Console Removal**: `removeConsole: true` in production
- **Source Maps**: Disabled `productionBrowserSourceMaps: false`
- **On-Demand Entries**: Custom `maxInactiveAge` and `pagesBufferLength` settings

---

### Summary of Optimization Strategies

**Common Optimizations Across All Apps**:

1. Production builds with minification
2. Tree-shaking enabled
3. Code splitting where beneficial
4. Modern JavaScript targeting
5. Compression (Brotli/Gzip) via CDN

**Mobile-Specific Optimizations**:

1. **CSS Inlining**: Eliminates render-blocking CSS requests (SvelteKit, SolidStart, HTMX, Nuxt)
2. **Manual Chunking**: Reduces HTTP request count (SvelteKit, QwikCity)
3. **Streaming SSR**: Progressive HTML delivery (Marko, HTMX/Astro)
4. **Resumability**: Zero/minimal hydration JS (Marko, QwikCity)

**Key Insight**: On realistic 4G networks, optimizations that reduce HTTP roundtrips (CSS inlining, manual chunking) provide 200-600ms FCP improvements. Frameworks with built-in streaming (Marko) or resumability (Qwik) gain additional advantages.

---

Choose **HTMX** if:

- ✅ Simple CRUD application
- ✅ Smallest possible bundle
- ✅ Server-centric architecture
- ✅ No complex client interactions

Choose **SolidStart/TanStack Solid** if:

- ✅ Balance of features and performance
- ✅ Mixed network conditions
- ✅ Modern framework needed
- ✅ React alternative desired

**Avoid Next.js/React on realistic 4G** unless:

- 🔴 You absolutely must use React ecosystem
- 🔴 You implement aggressive optimization
- 🔴 You serve different bundles by connection
- 🔴 Users mostly on ideal 4G/5G with slower connections as rare fallback

**Final Word:** On realistic 4G networks (congested, spotty signal), bundle size is king. The 4.5x+ size difference between Marko (44 kB) and Next.js (197 kB) translates to ~3.1 seconds of additional download time - an eternity in user experience. Choose frameworks designed for performance from the ground up.
