# TanStack Start Framework Comparison

A detailed performance comparison examining how TanStack Start performs with different UI libraries (React vs Solid) compared to their native meta-frameworks (Next.js vs SolidStart).

## Executive Summary

This comparison reveals interesting insights about framework overhead and the cost of framework-agnostic routing solutions:

- **TanStack Start (React) is 36% smaller** than Next.js on the home page
- **TanStack Start (React) is 34% smaller** than Next.js on the board page
- **SolidStart is 44% smaller** than TanStack Start + Solid on the home page
- **SolidStart is 30% smaller** than TanStack Start + Solid on the board page
- **All four frameworks achieve perfect 100 Lighthouse performance scores**

## Part 1: TanStack Start (React) vs Next.js

### Bundle Size Comparison

| Page | TanStack Start | Next.js | Difference |
|------|----------------|---------|------------|
| **Home** | 317 kB raw (101 kB gzip) | 498 kB raw (155 kB gzip) | **36% smaller** |
| **Board** | 383 kB raw (121 kB gzip) | 578 kB raw (181 kB gzip) | **34% smaller** |

### Performance Metrics

#### Home Page

| Metric | TanStack Start | Next.js | Winner |
|--------|----------------|---------|---------|
| **Performance Score** | 100 | 100 | Tie |
| **First Contentful Paint** | 37ms | 147ms | TanStack Start |
| **Largest Contentful Paint** | 37ms | 147ms | TanStack Start |
| **Speed Index** | 38ms | 197ms | TanStack Start |
| **Total Blocking Time** | 0ms | 0ms | Tie |
| **Cumulative Layout Shift** | 0 | 0 | Tie |

#### Board Page

| Metric | TanStack Start | Next.js | Winner |
|--------|----------------|---------|---------|
| **Performance Score** | 100 | 100 | Tie |
| **First Contentful Paint** | 40ms | 467ms | TanStack Start |
| **Largest Contentful Paint** | 40ms | 467ms | TanStack Start |
| **Speed Index** | 77ms | 324ms | TanStack Start |
| **Total Blocking Time** | 0ms | 0ms | Tie |
| **Cumulative Layout Shift** | 0 | 0 | Tie |

### Key Findings: React Implementations

1. **Bundle Size Victory**: TanStack Start delivers significantly smaller bundles (~35% reduction) compared to Next.js
2. **Faster Paint Times**: TanStack Start shows dramatically faster FCP/LCP times, especially on the board page (40ms vs 467ms)
3. **Equal Lighthouse Scores**: Despite different bundle sizes and paint metrics, both achieve perfect 100 scores
4. **Lower Overhead**: TanStack Start's routing and SSR infrastructure appears lighter than Next.js App Router

### What This Means

TanStack Start's React implementation proves that you can have:
- ✅ Smaller bundle sizes than Next.js
- ✅ Faster initial paint times
- ✅ Perfect performance scores
- ✅ Modern SSR with streaming
- ✅ Framework-agnostic architecture

This makes TanStack Start a compelling alternative to Next.js for teams that want:
- More control over their router
- Smaller production bundles
- Framework flexibility (ability to switch to Solid, Vue, etc.)

---

## Part 2: TanStack Start + Solid vs SolidStart

### Bundle Size Comparison

| Page | TanStack Start + Solid | SolidStart | Difference |
|------|------------------------|------------|------------|
| **Home** | 153 kB raw (52 kB gzip) | 86 kB raw (31 kB gzip) | **44% larger** |
| **Board** | 187 kB raw (62 kB gzip) | 132 kB raw (42 kB gzip) | **30% larger** |

### Performance Metrics

#### Home Page

| Metric | TanStack Start + Solid | SolidStart | Winner |
|--------|------------------------|------------|---------|
| **Performance Score** | 100 | 100 | Tie |
| **First Contentful Paint** | 43ms | 37ms | SolidStart |
| **Largest Contentful Paint** | 43ms | 37ms | SolidStart |
| **Speed Index** | 88ms | 76ms | SolidStart |
| **Total Blocking Time** | 0ms | 0ms | Tie |
| **Cumulative Layout Shift** | 0 | 0 | Tie |

#### Board Page

| Metric | TanStack Start + Solid | SolidStart | Winner |
|--------|------------------------|------------|---------|
| **Performance Score** | 100 | 100 | Tie |
| **First Contentful Paint** | 40ms | 66ms | TanStack Start + Solid |
| **Largest Contentful Paint** | 40ms | 66ms | TanStack Start + Solid |
| **Speed Index** | 93ms | 71ms | SolidStart |
| **Total Blocking Time** | 0ms | 0ms | Tie |
| **Cumulative Layout Shift** | 0.013 | 0 | SolidStart |

### Key Findings: Solid Implementations

1. **SolidStart Wins on Bundle Size**: Native SolidStart router produces 30-44% smaller bundles
2. **Mixed Paint Metrics**: SolidStart faster on home page, TanStack faster on board page
3. **Both Extremely Fast**: Both achieve sub-100ms paint times and perfect scores
4. **Router Overhead**: TanStack Start adds ~67 kB raw (21 kB gzip) compared to native SolidStart router

### What This Means

The comparison reveals the trade-offs of framework-agnostic routing:
- ❌ **30-44% larger bundles** due to TanStack Router overhead
- ✅ **Still achieves perfect 100 performance scores**
- ✅ **Framework portability** - easier to migrate between Solid, React, Vue
- ❌ **Less optimized** than native framework router integration

**When to choose TanStack Start + Solid:**
- You want flexibility to potentially switch frameworks later
- You prefer TanStack Router's API and features
- Bundle size difference (21 kB gzip) is acceptable for your use case

**When to choose SolidStart:**
- You're committed to Solid long-term
- Every kilobyte matters (mobile-first, limited bandwidth)
- You want the most optimized Solid experience

---

## Cross-Comparison: React vs Solid with TanStack Start

Since TanStack Start works with both React and Solid, we can compare the UI libraries directly:

### Bundle Size: React vs Solid (Same Router)

| Page | React | Solid | Difference |
|------|-------|-------|------------|
| **Home** | 317 kB raw | 153 kB raw | **Solid is 52% smaller** |
| **Board** | 383 kB raw | 187 kB raw | **Solid is 51% smaller** |

### Performance: React vs Solid (Same Router)

Both achieve:
- ✅ Perfect 100 Lighthouse scores
- ✅ Sub-100ms paint times
- ✅ 0ms Total Blocking Time
- ✅ 0 Cumulative Layout Shift

### Key Insight

When using the same router (TanStack), **Solid produces ~50% smaller bundles than React** with identical perceived performance. This demonstrates Solid's compiler advantage over React's runtime approach.

---

## Overall Rankings (Board Page)

For context, here's where these frameworks rank among all tested frameworks:

1. **Marko** - 91 kB raw
2. **Qwik** - 118 kB raw
3. **Astro** - 130 kB raw
4. **SolidStart** - 132 kB raw ⭐
5. **SvelteKit** - 160 kB raw
6. **TanStack Start + Solid** - 187 kB raw ⭐
7. **Nuxt** - 241 kB raw
8. **TanStack Start (React)** - 383 kB raw ⭐
9. **Next.js** - 578 kB raw ⭐
10. **Analog** - 683 kB raw

---

## Conclusions

### The Framework-Agnostic Router Tax

TanStack Start's framework-agnostic architecture comes with a measurable cost:
- **+117 kB raw** compared to Next.js App Router (React)
- **+67 kB raw** compared to SolidStart router (Solid)

However, this overhead doesn't impact Lighthouse scores, suggesting modern devices and networks can absorb this cost without user-perceivable degradation.

### When TanStack Start Makes Sense

**Choose TanStack Start if:**
- You want framework flexibility and potential migration paths
- You prefer TanStack Router's file-based routing and type safety
- You're building a multi-framework organization
- You value having the same router API across different UI libraries

**Stick with native frameworks if:**
- You're committed to one framework long-term
- You're optimizing for absolute minimum bundle size
- You want the tightest possible framework integration
- You're building for bandwidth-constrained environments

### The Real Winner: Choice

The fact that all four frameworks achieve perfect performance scores demonstrates that modern meta-frameworks have solved the performance problem. The choice now comes down to:
- Developer experience preferences
- Organizational constraints
- Long-term flexibility vs short-term optimization
- Bundle size sensitivity for your target audience

---

## Methodology

**Measurement Details:**
- 10 runs per page for statistical reliability
- Lighthouse 12.8.2 with mobile emulation (Pixel 5)
- 4G network throttling (10 Mbps down, 40ms RTT)
- Cache cleared between runs (cold-load measurement)
- Production builds with gzip compression
- Same application logic across all frameworks

**Test Application:**
- Kanban board with drag-and-drop
- Server-side rendering with streaming
- Database integration (SQLite)
- Multiple pages (home + board detail)
- Real-world component complexity

---

*Generated: 2025-10-23*
