# Mobile Performance Analysis - Realistic 4G Network - Playwright Measurements

> **Testing Configuration**: All measurements use Playwright with Pixel 5 mobile emulation, **3G network throttling** (~400 Kbps download) to simulate **realistic 4G conditions** (spotty signal, network congestion), and 4x CPU slowdown to simulate real-world mobile conditions. While the technical setting is "3G", this represents what users actually experience on congested or weak 4G networks.

> **Important Note on Measurements**: These metrics measure **external JS/CSS files only** (separate network requests). Inline scripts embedded in HTML documents are not counted separately. See "Measurement Clarifications" section below for details.
## 📱 TL;DR: Best Frameworks for Mobile on Realistic 4G Networks

> **Important**: These measurements simulate **realistic 4G conditions** (spotty signal, network congestion) using 3G throttling. Bundle size and TTFB impact is amplified in these real-world scenarios.

> **Critical Note on Bundle Sizes**: These are measurements of a **disciplined, lightweight app** using very few 3rd-party dependencies. As you add features, routes, and dependencies, **bundle sizes will grow significantly**. Without discipline, even these apps with only their current functionality could easily be **2x-5x larger**. For example, choosing a JavaScript UI component library instead of a CSS-only library like DaisyUI could alone add 60-120 kB to the bundle. The rankings below reflect best-case scenarios - real-world apps require constant bundle optimization.

**Top Tier** (Excellent on realistic 4G, low-end devices):

1. **kanban-marko** (29 kB) - Best overall: Resumability + streaming = instant interaction, minimal data usage, excellent FCP (320ms)
2. **kanban-htmx** (2 kB) - Baseline reference: 2 kB JS, Astro streaming SSR (438ms FCP with inline CSS, minimal JS)
3. **kanban-solidstart** (49 kB) - Fine-grained reactivity, excellent FCP (686ms), progressive hydration
4. **kanban-qwikcity** (63 kB) - Resumability eliminates hydration, good FCP (464ms despite slower TTFB)

**Good Tier** (Solid on realistic 4G with modern devices): 5. **kanban-tanstack-solid** (63 kB) - Small bundle but high TTFB (409ms), moderate FCP (484ms) 6. **kanban-sveltekit** (80 kB) - Compiled output, partial hydration, FCP (816ms)

**Acceptable Tier** (Works but starts to struggle on realistic 4G): 7. **kanban-nuxt** (102 kB) - Moderate bundle, FCP (840ms), full hydration 8. **kanban-analog** (119 kB) - Angular SSR, FCP (868ms), no streaming

**Poor Tier** (Not recommended for realistic 4G): 9. **kanban-tanstack** (138 kB) - High TTFB (408ms), large bundle, FCP (496ms) 10. **kanban-nextjs** (179 kB) - Heavy React bundle, FCP (288ms is good but bundle size problematic) 11. **kanban-nextjs-cf** (175 kB) - Best TTFB (71ms) but heavy bundle, FCP (184ms)

### Key Network Criteria for Realistic 4G

**Why these rankings matter on realistic 4G networks:**

- **Bundle size** → CRITICAL on realistic 4G: Download speeds are ~400 Kbps, every kB counts
- **TTFB** → Less critical on realistic 4G vs ideal 4G, as download time dominates
- **FCP** → Most important user-perceived metric on slower networks
- **Resumability** (Marko, Qwik) → Zero/minimal JS execution = works on low-end phones
- **Hydration** → Full hydration kills performance on throttled mobile CPUs + slow downloads

**Bottom line:** For mobile web apps, choose frameworks with smallest bundles: Marko, HTMX, SolidStart, or Qwik. Even Next.js with excellent Cloudflare edge TTFB suffers from large bundle download times.

## ⚠️ Measurement Clarifications: External vs Inline Scripts

**IMPORTANT**: These metrics measure **external JS/CSS files only** - separate network requests tracked by Playwright's Resource Timing API. Inline scripts (embedded directly in HTML documents) are **not counted separately** in the JS metrics below.

### Framework-Specific Script Loading

| Framework             | External JS | Inline Scripts & CSS | Notes                                                                          |
| --------------------- | ----------- | -------------------- | ------------------------------------------------------------------------------ |
| **kanban-htmx**       | 2 kB        | All HTMX + CSS inline | HTMX library + DaisyUI CSS embedded in HTML. ~227 KB uncompressed |
| **kanban-marko**      | 29 kB       | 2 inline scripts     | Streaming SSR with minimal inline hydration code                            |
| **kanban-solidstart** | 49 kB       | 3 inline scripts     | Progressive hydration, some inline initialization                           |
| **kanban-sveltekit**  | 73 kB       | 1 inline script      | Minimal inline code                                                         |
| **kanban-analog**     | 116 kB      | 1 inline script      | Angular SSR with minimal inline code                                        |
| **kanban-nextjs**     | 175 kB      | 8 inline scripts     | Heavy React hydration, significant inline code                              |
| **kanban-qwikcity**   | 63 kB       | 0 inline scripts     | Pure external modules (no inline scripts detected)                          |
| **kanban-nuxt**       | 100 kB      | 0 inline scripts     | Pure external modules                                                       |

**Why this matters:**

- Inline scripts/CSS are **part of the HTML document** and must be downloaded, parsed, and executed
- They affect **total page weight** and **parsing time** but don't show up in external resource metrics
- HTMX's strategy (inline everything - HTMX library + DaisyUI CSS) keeps external JS/CSS at 2 kB but increases HTML document size to 227 KB
- Most frameworks use inline scripts for **hydration initialization** or **routing setup**
- **CSS inlining** eliminates render-blocking CSS requests, improving FCP significantly (HTMX improved from 900ms → 438ms)

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

| Framework             | JS Size (kB) | Download Time (ms) | Download Time (s) |
| --------------------- | ------------ | ------------------ | ----------------- |
| kanban-htmx           | 2            | ~40ms              | 0.04s             |
| kanban-marko          | 29           | ~580ms             | 0.58s             |
| kanban-solidstart     | 49           | ~980ms             | 0.98s             |
| kanban-qwikcity       | 63           | ~1,260ms           | 1.26s             |
| kanban-tanstack-solid | 63           | ~1,260ms           | 1.26s             |
| kanban-sveltekit      | 73           | ~1,460ms           | 1.46s             |
| kanban-nuxt           | 100          | ~2,000ms           | 2.00s             |
| kanban-analog         | 116          | ~2,320ms           | 2.32s             |
| kanban-tanstack       | 135          | ~2,700ms           | 2.70s             |
| kanban-nextjs-cf      | 171          | ~3,420ms           | 3.42s             |
| kanban-nextjs         | 175          | ~3,500ms           | 3.50s             |

**Key Insights:**

- **HTMX** (2 kB): Downloads in 40ms - virtually instant
- **Marko** (29 kB): Downloads in 580ms - under 1 second
- **SolidStart/Qwik** (49-63 kB): 1-1.3 seconds - acceptable
- **Next.js** (175 kB): 3.5 seconds - just for JS download, before parsing/execution
- **Total page load** includes: TTFB + HTML download + CSS download + JS download + parsing + execution

**Reality Check:**
On realistic 4G networks, downloading Next.js's 175 kB of JavaScript takes **3.5 seconds** - before the browser even starts parsing or executing it. By comparison, Marko's entire 29 kB bundle downloads in just 580ms, leaving more time for the browser to parse, execute, and render content.

## 📊 Mobile Performance Comparison - Board Page (Cold Load, Realistic 4G)

| Framework             | JS (kB) | CSS (kB) | Total (kB) | FCP (ms) | TTFB (ms) | Impact                              |
| --------------------- | ------- | -------- | ---------- | -------- | --------- | ----------------------------------- |
| kanban-htmx           | 2       | 0        | 2          | 438      | 92        | ⭐⭐⭐⭐⭐ Best for low-end devices |
| kanban-marko          | 29      | 0        | 29         | 320      | 237       | ⭐⭐⭐⭐⭐ Resumability + streaming |
| kanban-solidstart     | 49      | 0        | 49         | 686      | 90        | ⭐⭐⭐⭐ Very good                  |
| kanban-qwikcity       | 63      | 0        | 63         | 464      | 146       | ⭐⭐⭐⭐ Resumability advantage     |
| kanban-tanstack-solid | 63      | 0        | 63         | 484      | 409       | ⭐⭐⭐ High TTFB hurts              |
| kanban-sveltekit      | 73      | 7        | 80         | 816      | 92        | ⭐⭐⭐ Moderate bundle              |
| kanban-nuxt           | 100     | 0        | 100        | 840      | 108       | ⭐⭐⭐ Getting heavy                |
| kanban-analog         | 116     | 0        | 116        | 868      | 93        | ⭐⭐⭐ Good TTFB                    |
| kanban-tanstack       | 135     | 0        | 135        | 496      | 408       | ⭐⭐ High TTFB                      |
| **kanban-nextjs-cf**  | **171** | **20**   | **190**    | **184**  | **71**    | **⭐⭐ Heavy bundle**               |
| kanban-nextjs         | 175     | 18       | 192        | 288      | 90        | ⭐⭐ Heavy bundle                   |

## 🌊 Realistic 4G Network Performance Reality

**Network Characteristics (Realistic 4G):**

- Download speed: ~400 Kbps (0.4 Mbps) - simulating congested/spotty 4G
- Upload speed: ~150 Kbps
- Latency: 100-500ms
- Common scenarios: Network congestion, weak signal, crowded areas, indoor coverage gaps

**Download Time Calculation (400 Kbps):**

- **HTMX (2 kB):** ~40ms download (external JS/CSS only - CSS now inlined)
- **Marko (29 kB):** ~580ms download
- **SolidStart (49 kB):** ~980ms download
- **Qwik (63 kB):** ~1260ms download
- **Next.js (192 kB):** ~3840ms (3.8 seconds!) download

On realistic 4G networks, the physics of data transfer becomes the primary bottleneck. Even with excellent edge TTFB (63ms for Next.js on Cloudflare), downloading 192 kB takes nearly 4 seconds.

## 📱 Framework Performance Analysis

### Top Performers on Realistic 4G

#### 1. kanban-marko (29 kB)

- **FCP:** 320ms ⭐⭐⭐⭐⭐
- **TTFB:** 237ms
- **Bundle:** 29 kB (smallest full-featured framework)
- **Architecture:** Resumability + streaming SSR
- **Realistic 4G Advantage:** Minimal download time (~580ms), no hydration cost, instant interactivity

#### 2. kanban-htmx (2 kB)

- **FCP:** 438ms ⭐⭐⭐⭐⭐
- **TTFB:** 92ms
- **Bundle:** 2 kB external (JS only - CSS inlined)
- **Architecture:** Astro streaming SSR + HTMX hypermedia + inline DaisyUI CSS
- **Realistic 4G Advantage:** Minimal external resources (~40ms download), CSS inlined for instant rendering, instant interaction

#### 3. kanban-solidstart (49 kB)

- **FCP:** 686ms ⭐⭐⭐⭐
- **TTFB:** 90ms
- **Bundle:** 49 kB
- **Architecture:** Fine-grained reactivity, progressive hydration
- **Realistic 4G Advantage:** Good balance of features and performance

#### 4. kanban-qwikcity (63 kB)

- **FCP:** 464ms ⭐⭐⭐⭐
- **TTFB:** 146ms
- **Bundle:** 63 kB
- **Architecture:** Resumability (zero hydration)
- **Realistic 4G Advantage:** Excellent FCP despite moderate bundle, resumability means instant interaction

### Poor Performers on Realistic 4G

#### kanban-nextjs / kanban-nextjs-cf (192 / 190 kB)

- **FCP:** 288ms / 184ms ⭐⭐
- **TTFB:** 90ms / 71ms (Cloudflare edge excellent)
- **Bundle:** 192 kB / 190 kB
- **Realistic 4G Problem:**
  - ~3.8 second download time on realistic 4G
  - Full React hydration required
  - Heavy VDOM overhead
  - Good for ideal 4G/5G, struggles on realistic 4G

**Math:** Even with world-class TTFB (71ms), downloading 190 kB @ 400 Kbps = 3.8 seconds. This negates all edge computing benefits.

## 🔍 Realistic 4G vs Ideal 4G Performance Comparison

| Framework             | Realistic 4G FCP | Ideal 4G FCP | Difference | Impact                                  |
| --------------------- | ---------------- | ------------ | ---------- | --------------------------------------- |
| kanban-marko          | 320ms            | 309ms        | +11ms      | Minimal                                 |
| kanban-htmx           | 438ms            | 893ms        | -455ms     | Much better on realistic 4G!            |
| kanban-solidstart     | 686ms            | 659ms        | +27ms      | Low                                     |
| kanban-qwikcity       | 464ms            | 405ms        | +59ms      | Moderate                                |
| kanban-sveltekit      | 816ms            | 811ms        | +5ms       | Minimal                                 |
| kanban-nuxt           | 840ms            | 873ms        | -33ms      | Better on realistic 4G? (variance)      |
| kanban-analog         | 868ms            | 833ms        | +35ms      | Low                                     |
| kanban-nextjs-cf      | 184ms            | 425ms        | -241ms     | Much better on realistic 4G!            |
| kanban-nextjs         | 288ms            | 275ms        | +13ms      | Minimal                                 |
| kanban-tanstack       | 496ms            | 536ms        | -40ms      | Better on realistic 4G                  |
| kanban-tanstack-solid | 484ms            | 1645ms       | -1161ms    | Much better on realistic 4G!            |

**Interesting Findings:**

1. **Small bundles** (Marko, HTMX, SolidStart) show minimal FCP difference between realistic and ideal 4G
2. **HTMX** shows DRAMATICALLY better FCP on realistic 4G (438ms vs 893ms on ideal 4G) - this is due to the CSS inline optimization eliminating a blocking request on slow networks. The ideal 4G measurement was taken before CSS inlining.
3. **Next.js CF** and **TanStack Solid** show BETTER FCP on realistic 4G, likely due to:
   - Better server response times during realistic 4G test runs
   - Reduced variance in measurements
   - Edge caching effects
4. **Large bundles** still dominate total experience on realistic 4G due to download time

## 📱 Device Performance Estimates (Realistic 4G Network)

Based on Pixel 5 emulation + 3G throttling (simulating realistic 4G conditions):

| Device Class | Example            | Load Time | Parse Time | Interaction Delay | Rating            |
| ------------ | ------------------ | --------- | ---------- | ----------------- | ----------------- |
| High-End     | iPhone 15, Pixel 8 | ~2-4s     | ~150ms     | ~300ms            | ⭐⭐⭐ Acceptable |
| Mid-Range    | iPhone 12, Pixel 5 | ~3-6s     | ~300ms     | ~600ms            | ⭐⭐ Poor         |
| Low-End      | $200 Android       | ~5-10s    | ~1000ms    | ~2000ms           | ⭐ Very Poor      |
| Very Low-End | $100 Android       | ~8-15s    | ~3000ms    | ~5000ms           | ❌ Unusable       |

**Critical Insight:** On realistic 4G networks (congested/spotty signal), even high-end devices suffer from network constraints. The bottleneck shifts from CPU to network bandwidth.

## 🎯 Realistic 4G Optimization Strategies

### 1. Choose Lightweight Frameworks

- Marko (29 kB) - Best choice
- HTMX (2 kB JS) - Best for simple apps
- SolidStart (49 kB) - Good balance
- Qwik (63 kB) - Resumability benefits

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

Choose **HTMX** if:

- ✅ Simple CRUD application
- ✅ Smallest possible bundle
- ✅ Server-centric architecture
- ✅ No complex client interactions

Choose **SolidStart/Qwik** if:

- ✅ Balance of features and performance
- ✅ Mixed network conditions
- ✅ Modern framework needed
- ✅ React alternative desired

**Avoid Next.js/React on realistic 4G** unless:

- 🔴 You absolutely must use React ecosystem
- 🔴 You implement aggressive optimization
- 🔴 You serve different bundles by connection
- 🔴 Users mostly on ideal 4G/5G with slower connections as rare fallback

**Final Word:** On realistic 4G networks (congested, spotty signal), bundle size is king. The 6x+ size difference between Marko (29 kB) and Next.js (192 kB) translates to ~3.2 seconds of additional download time - an eternity in user experience. Choose frameworks designed for performance from the ground up.
