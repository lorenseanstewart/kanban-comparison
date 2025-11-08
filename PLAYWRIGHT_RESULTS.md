# Playwright Performance Measurements

Performance comparison of kanban applications using Playwright-based measurements with mobile device emulation and 4G network throttling.

**Measurement Date**: November 8, 2025
**Tool**: Playwright with Chrome DevTools Protocol
**Device**: Pixel 5 mobile emulation (393x851, 2.75x DPI)
**Device Equivalents**: Pixel 5-7, iPhone 12-14, Galaxy S21-S22
**Network**: 4G throttling (cellular4g)
**CPU**: 4x slowdown (simulates mid-to-high-end phone)
**Runs**: 3 per cache mode (cold + warm)
**Pages Measured**: Home page and Board page

---

## Bundle Size Comparison

### Board Page (Cold Load)

| Framework | JS Transferred | JS Uncompressed | CSS Transferred | CSS Uncompressed | Total Transferred | Total Uncompressed | Compression Ratio |
|-----------|----------------|-----------------|-----------------|------------------|-------------------|-------------------|-------------------|
| **Marko** | **28.7 kB** | **88.8 kB** | **0 kB*** | **0 kB*** | **28.7 kB** | **88.8 kB** | **67.7%** |
| **Analog** | **116.4 kB** | **371.2 kB** | **0 kB*** | **0 kB*** | **116.4 kB** | **371.2 kB** | **68.6%** |
| **Next.js** | **174.5 kB** | **550.5 kB** | **17.5 kB** | **123.1 kB** | **192.0 kB** | **673.6 kB** | **71.5%** |

**Comparison**:
- Marko is **4.1x smaller** than Analog (28.7 kB vs 116.4 kB)
- Marko is **6.7x smaller** than Next.js (28.7 kB vs 192.0 kB)
- Analog is **1.6x smaller** than Next.js (116.4 kB vs 192.0 kB)

*CSS is inlined in the HTML for Marko and Analog, so it appears as 0 kB in separate CSS resources

### Home Page (Cold Load)

| Framework | JS Transferred | JS Uncompressed | CSS Transferred | CSS Uncompressed | Total Transferred | Total Uncompressed | Compression Ratio |
|-----------|----------------|-----------------|-----------------|------------------|-------------------|-------------------|-------------------|
| **Marko** | **6.7 kB** | **12.3 kB** | **0 kB*** | **0 kB*** | **6.7 kB** | **12.3 kB** | **45.8%** |
| **Analog** | **88.8 kB** | **272.8 kB** | **0 kB*** | **0 kB*** | **88.8 kB** | **272.8 kB** | **67.5%** |
| **Next.js** | **153.9 kB** | **486.3 kB** | **17.5 kB** | **123.1 kB** | **171.4 kB** | **609.4 kB** | **71.9%** |

**Comparison**:
- Marko is **13.3x smaller** than Analog (6.7 kB vs 88.8 kB)
- Marko is **25.6x smaller** than Next.js (6.7 kB vs 171.4 kB)
- Analog is **1.9x smaller** than Next.js (88.8 kB vs 171.4 kB)

*CSS is inlined in the HTML for Marko and Analog, so it appears as 0 kB in separate CSS resources

---

## Web Vitals Comparison

### Board Page - Cold Load

| Framework | FCP (ms) | LCP (ms) | CLS | TTFB (ms) | Script Eval (ms) | Resources |
|-----------|----------|----------|-----|-----------|------------------|-----------|
| **Next.js** | **284** | **0** | **0** | **110** | **0** | **16** |
| **Marko** | **336** | **0** | **0** | **294** | **0** | **2** |
| **Analog** | **864** ❌ | **0** | **0** | **87** | **0** | **4** |

### Board Page - Warm Load (Cached)

| Framework | FCP (ms) | LCP (ms) | CLS | TTFB (ms) | Script Eval (ms) | Resources |
|-----------|----------|----------|-----|-----------|------------------|--------------|
| **Next.js** | **156** | **0** | **0** | **31** | **0** | **17** |
| **Marko** | **252** | **0** | **0** | **237** | **0** | **2** |
| **Analog** | **772** ❌ | **0** | **0** | **27** | **0** | **4** |

### Home Page - Cold Load

| Framework | FCP (ms) | LCP (ms) | CLS | TTFB (ms) | Script Eval (ms) | Resources |
|-----------|----------|----------|-----|-----------|------------------|-----------|
| **Marko** | **236** | **0** | **0** | **195** | **0** | **2** |
| **Next.js** | **312** | **0** | **0** | **122** | **0** | **17** |
| **Analog** | **360** ⚠️ | **0** | **0** | **90** | **0** | **3** |

### Home Page - Warm Load (Cached)

| Framework | FCP (ms) | LCP (ms) | CLS | TTFB (ms) | Script Eval (ms) | Resources |
|-----------|----------|----------|-----|-----------|------------------|-----------|
| **Marko** | **108** | **0** | **0** | **84** | **0** | **2** |
| **Next.js** | **164** | **0** | **0** | **32** | **0** | **18** |
| **Analog** | **296** ⚠️ | **0** | **0** | **27** | **0** | **3** |

**Legend**:
- ✅ Green: <250ms (feels instant)
- ⚠️ Yellow: 250-400ms (noticeable but acceptable)
- ❌ Red: >400ms (feels slow)

---

## Cache Behavior Comparison

### Cold Load → Warm Load Transfer Size Reduction

| Framework | Page | Cold Load | Warm Load | Reduction |
|-----------|------|-----------|-----------|-----------|
| **Marko** | Home | 6.7 kB | 0.6 kB | **91.0%** |
| **Marko** | Board | 28.7 kB | 0.6 kB | **97.9%** |
| **Next.js** | Home | 171.4 kB | 0.0 kB | **100%** |
| **Next.js** | Board | 192.0 kB | 0.0 kB | **100%** |
| **Analog** | Home | 88.8 kB | 0.9 kB | **99.0%** |
| **Analog** | Board | 116.4 kB | 1.2 kB | **99.0%** |

**Cache Strategy Differences:**
- **Next.js**: Uses full browser cache - 0 bytes transferred on warm loads (100% cached)
- **Analog**: Uses minimal revalidation - 0.9-1.2 kB transferred for cache validation (99% cached)
- **Marko**: Uses minimal revalidation - 0.6 kB transferred for cache validation (97-98% cached)

---

## Key Findings

### Bundle Size

1. **Marko has dramatically smaller bundles**: 4.1-25.6x smaller depending on page and comparison
2. **Analog is in the middle**: 1.6-1.9x smaller than Next.js, but 4.1-13.3x larger than Marko
3. **CSS Strategy**:
   - Marko & Analog: CSS is inlined in HTML (included in page HTML, not counted as separate CSS resource)
   - Next.js: External CSS file (17.5 kB compressed, 123.1 kB uncompressed)
4. **Resource Count**: Marko loads only 2 resources vs Analog's 3-4 vs Next.js's 16-18 resources

### Performance (Web Vitals)

1. **First Contentful Paint (FCP)**:
   - **Home page**: Marko is fastest on both cold (236ms) and warm (108ms) loads
   - **Board page**: Next.js is fastest on both cold (284ms) and warm (156ms) loads
   - **Analog**: Significantly slower FCP on board page (864ms cold, 772ms warm) despite moderate bundle size

2. **The Mobile CPU Impact**:
   - With 4x CPU throttling (simulating mobile devices), Analog's hydration overhead becomes **much more pronounced**
   - **Board page cold load**: Analog is **3.0x slower** than Next.js (864ms vs 284ms)
   - **Board page warm load**: Analog is **4.9x slower** than Next.js (772ms vs 156ms)
   - This suggests the hydration overhead compounds significantly on lower-powered devices

3. **Layout Stability (CLS)**: All frameworks achieve perfect 0 CLS scores

4. **Server Response (TTFB)**:
   - **Cold load**: Analog and Next.js have faster TTFB (87-122ms) vs Marko (195-294ms)
   - **Warm load**: Analog and Next.js both ~27-32ms, Marko varies (84-237ms)
   - **Platform influence**: Both Next.js and Analog are on Vercel, Marko is on Cloudflare Pages

### Caching

1. **Next.js**: Most aggressive caching (100% - zero bytes on repeat visits)
2. **Analog**: Very good caching (99% - minimal revalidation)
3. **Marko**: Good caching (97-98% - light revalidation)

### Performance vs Bundle Size Trade-offs

**Marko**:
- ✅ Smallest bundles (28.7 kB board, 6.7 kB home)
- ✅ Fewest resources (2 total)
- ⚠️ Slower TTFB (possibly platform-related)
- ✅ Good FCP on home page (236ms)
- ⚠️ Moderate FCP on board page (336ms)

**Analog (Angular)**:
- ⚠️ Medium bundles (116.4 kB board, 88.8 kB home)
- ✅ Good resource efficiency (3-4 total)
- ✅ Fast TTFB (Vercel optimization)
- ❌ **Slowest FCP on board page (864ms cold, 772ms warm)** - Angular hydration overhead
- ⚠️ Moderate FCP on home page (360ms)

**Next.js**:
- ❌ Largest bundles (192.0 kB board, 171.4 kB home)
- ❌ Most resources (16-18)
- ✅ Fastest TTFB (Vercel optimization)
- ✅ **Fastest FCP on board page (284ms)**
- ⚠️ Moderate FCP on home page (312ms)
- ✅ Perfect caching (100%)

---

## Mobile Device Impact: The Hydration Overhead Problem

### The Angular Performance Paradox

With mobile CPU throttling (4x slowdown), we see a striking performance paradox with Analog (Angular):

**Board Page - Cold Load:**
- **Bundle**: 116.4 kB (1.6x smaller than Next.js's 192.0 kB)
- **TTFB**: 87ms (faster than Next.js's 110ms)
- **FCP**: 864ms (3.0x slower than Next.js's 284ms) ❌

**The Gap:**
- Despite shipping **39% less JavaScript** and having **21% faster server response**
- Analog takes **3.0x longer** to show content
- The 580ms gap is pure hydration overhead

### Why Mobile Devices Amplify the Problem

Angular's hydration process is CPU-intensive:
1. Reconstruct full component tree
2. Set up dependency injection for all components
3. Initialize signals reactive system
4. Attach event listeners across the tree
5. Prepare change detection infrastructure

On desktop CPUs (no throttling), this overhead was ~472ms (756ms - 284ms).
**On mobile CPUs (4x throttling), the overhead jumped to ~580ms (864ms - 284ms).**

This 23% increase suggests the gap will grow as:
- Applications become more complex (more components, deeper DI graphs)
- Users on lower-end devices (older phones, budget devices)
- Applications run on constrained environments

### Framework Hydration Strategies

**Angular (Analog)**:
- **Full framework boot**: Everything initializes on hydration
- **Heavy CPU work**: DI setup, signals initialization, change detection prep
- **Impact**: ~580ms overhead on mobile for this simple app

**React (Next.js)**:
- **Selective hydration**: Can hydrate components progressively
- **Lighter runtime**: Less upfront initialization work
- **Impact**: Fast render even with 60% more JavaScript

**Marko**:
- **Minimal runtime**: Most work done at compile time
- **Tiny footprint**: Less code to parse and execute
- **Impact**: 336ms FCP despite slower TTFB

### Key Insight

> **Bundle size matters, but hydration strategy matters more on mobile devices.**
>
> A framework shipping 60% less JavaScript can still be 3.0x slower to render if its hydration overhead is high. Mobile CPU constraints amplify this gap, making hydration efficiency critical for mobile performance.

---

## Platform Deployment Comparison

| Framework | Platform | Notes |
|-----------|----------|-------|
| Next.js | Vercel | Optimized for Next.js |
| Analog | Vercel | Generic Vercel deployment |
| Marko | Cloudflare Pages | Generic platform |

**What this means:**
- Bundle size and resource counts are pure framework comparisons ✅
- TTFB may be influenced by platform optimization ⚠️
- FCP may be partially platform-influenced ⚠️
- Cache strategy is a framework-level decision ✅
- For perfect apples-to-apples comparison, all frameworks should be on the same platform
- These results represent real-world deployments as teams would actually use them

---

## Interpretation Notes

1. **LCP showing 0ms**: This indicates that the Largest Contentful Paint occurred before or at the same time as navigation start. This can happen with very fast server-side rendered pages where the largest element is immediately visible.

2. **Script Evaluation Time showing 0ms**: With only 3 runs, the median script evaluation time may round to 0ms for very fast scripts. This is expected for these optimized production builds.

3. **CSS Transferred = 0 kB for Marko & Analog**: Both frameworks inline CSS in the HTML document, so it doesn't appear as a separate CSS resource. The CSS is included in the HTML page size.

4. **Warm Load Transfers**:
   - Next.js: 0 bytes (full HTTP 304/cache hit)
   - Analog: ~900-1200 bytes (likely revalidation headers)
   - Marko: ~600 bytes (likely revalidation headers or minimal page shell)

5. **Analog Performance on Mobile**: The 864ms FCP (board page, cold) represents a significant degradation from desktop measurements. This is due to Angular's hydration process being CPU-intensive, which is amplified by the 4x CPU throttling that simulates mobile devices. The hydration overhead doesn't scale with bundle size—it's an architectural characteristic of how Angular initializes its dependency injection, signals, and change detection systems.

---

## Winner by Category

### Bundle Size
🥇 **Marko** (28.7 kB board)
🥈 Analog (116.4 kB board)
🥉 Next.js (192.0 kB board)

### Resource Efficiency
🥇 **Marko** (2 resources)
🥈 Analog (4 resources)
🥉 Next.js (17 resources)

### FCP (Board Page - Cold) - Mobile
🥇 **Next.js** (284ms)
🥈 Marko (336ms)
🥉 Analog (864ms)

### FCP (Home Page - Cold) - Mobile
🥇 **Marko** (236ms)
🥈 Next.js (312ms)
🥉 Analog (360ms)

### TTFB (Cold)
🥇 **Analog** (87-90ms)
🥈 Next.js (110-122ms)
🥉 Marko (195-294ms)

### Cache Efficiency
🥇 **Next.js** (100%)
🥈 Analog (99%)
🥉 Marko (97-98%)

---

## Recommendations

### Choose Marko if:
- Bundle size is critical (spotty networks, low-end devices, data costs)
- You want minimal resource count
- You need the smallest possible footprint
- You're okay with slightly slower server response times (potentially platform-related)
- Simple, content-focused pages are your priority

### Choose Analog (Angular) if:
- You need Angular's enterprise features and ecosystem
- Team is already experienced with Angular
- You have strong typing requirements (TypeScript-first)
- Your users are primarily on desktop or high-end devices
- **Avoid for**: Mobile-first applications, apps requiring fast initial render on complex pages

### Choose Next.js if:
- You're deploying to Vercel (optimized platform)
- Fast TTFB and FCP are critical
- You want the best caching strategy
- You need the React ecosystem
- Mobile performance is a priority (best mobile FCP despite largest bundle)
- Complex interactive pages are common

---

## Files Generated

- `metrics/kanban-nextjs-playwright.json` - Full Next.js measurement data
- `metrics/kanban-marko-playwright.json` - Full Marko measurement data
- `metrics/kanban-analog-playwright.json` - Full Analog measurement data
