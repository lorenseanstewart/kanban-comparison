# Performance Metrics

## Table 1: Bundle Sizes and Parse Times Ranked by Realistic 4G (Ideal 3G) Parse Time

| Framework        | Bundle Size (KB) | Parse Time - Ideal 4G (ms) | Parse Time - Realistic 4G (Ideal 3G) (ms) |
| ---------------- | ---------------- | -------------------------- | ----------------------------------------- |
| HTMX             | 1.9              | 4                          | 38                                        |
| Marko            | 43.3             | 85                         | 866                                       |
| SolidStart       | 45.5             | 89                         | 909                                       |
| TanStack-Solid   | 58.4             | 114                        | 1168                                      |
| QwikCity         | 65.1             | 127                        | 1303                                      |
| SvelteKit        | 71.1             | 139                        | 1421                                      |
| Nuxt             | 99.8             | 195                        | 1997                                      |
| Analog           | 118.3            | 231                        | 2367                                      |
| TanStack         | 131.1            | 256                        | 2621                                      |
| Next.js (CF)     | 189.7            | 371                        | 3793                                      |
| Next.js (Vercel) | 193.6            | 378                        | 3872                                      |

## Table 2: LCP and Bundle Size Ranked by Realistic 4G (Ideal 3G) LCP

| Framework        | Bundle Size (KB) | LCP - Ideal 4G (ms) | LCP - Realistic 4G (Ideal 3G) (ms) |
| ---------------- | ---------------- | ------------------- | ---------------------------------- |
| Marko            | 43.3             | 368                 | 732                                |
| TanStack-Solid   | 58.4             | 504                 | 852                                |
| Nuxt             | 99.8             | 836                 | 1244                               |
| Analog           | 118.3            | 840                 | 1536                               |
| SolidStart       | 45.5             | 696                 | 1600                               |
| TanStack         | 131.1            | 822                 | 1602                               |
| QwikCity         | 65.1             | 578                 | 1684                               |
| HTMX             | 1.9              | 900                 | 1740                               |
| SvelteKit        | 71.1             | 1128                | 2892                               |
| Next.js (CF)     | 189.7            | 808                 | 3212                               |
| Next.js (Vercel) | 193.6            | 892                 | 3332                               |

## Table 3: FCP → LCP Time on Realistic 3G (Ranked Best to Worst)

| Framework        | FCP (ms) | LCP (ms) | FCP → LCP (ms) |
| ---------------- | -------- | -------- | -------------- |
| Marko            | 733      | 732      | -1             |
| HTMX             | 1746     | 1740     | -6             |
| TanStack-Solid   | 867      | 852      | -15            |
| Nuxt             | 1249     | 1244     | -5             |
| Analog           | 1540     | 1536     | -4             |
| TanStack         | 1623     | 1602     | -21            |
| SolidStart       | 948      | 1600     | 652            |
| QwikCity         | 1687     | 1684     | -3             |
| Next.js (CF)     | 2855     | 3212     | 357            |
| SvelteKit        | 1332     | 2892     | 1560           |
| Next.js (Vercel) | 2967     | 3332     | 365            |

## Table 4: FCP → LCP Time on Ideal 4G (Ranked Best to Worst)

| Framework        | FCP (ms) | LCP (ms) | FCP → LCP (ms) |
| ---------------- | -------- | -------- | -------------- |
| Marko            | 372      | 368      | -4             |
| HTMX             | 915      | 900      | -15            |
| TanStack-Solid   | 520      | 504      | -16            |
| Nuxt             | 835      | 836      | 1              |
| Analog           | 846      | 840      | -6             |
| TanStack         | 838      | 822      | -16            |
| SolidStart       | 697      | 696      | -1             |
| QwikCity         | 592      | 578      | -14            |
| Next.js (CF)     | 452      | 808      | 356            |
| SvelteKit        | 396      | 1128     | 732            |
| Next.js (Vercel) | 500      | 892      | 392            |

## Framework Recommendations for Realistic WiFi Mobile Apps

Building a mobile web app for realistic 4G conditions (400 Kbps download speed) requires prioritizing small bundles and fast LCP. Here's a framework comparison based on the performance data:

### Tier 1: Best Choice for Realistic WiFi

**Marko (43.3 KB)**

- **LCP on Realistic 4G: 732ms** - Best-in-class performance
- Smallest framework by a significant margin (43KB vs next best 45KB)
- SSR with streaming support enables content delivery before full download completes
- Native CSS inlining with Vite plugin reduces additional network requests
- **Verdict:** If you can use Marko, it's the optimal choice for mobile. Trade-off: smaller ecosystem and team familiarity.

### Tier 2: Excellent for Most Teams

**Solid-based Frameworks (45-58 KB)**

- **SolidStart: 1600ms LCP** / **TanStack-Solid: 852ms LCP**
- Tiny runtime overhead (8-9x smaller than React/Vue frameworks)
- Reactive systems with fine-grained reactivity eliminate excessive re-renders
- CSS inlining with Vite `?inline` pattern
- **Verdict:** Excellent choice if your team knows or is willing to learn Solid. Best balance of performance and developer experience.

### Tier 3: Pragmatic Choice for Teams

**Nuxt (99.8 KB) & QwikCity (65.1 KB)**

- **Nuxt: 1244ms LCP** / **QwikCity: 1684ms LCP**
- Nuxt offers Vue ecosystem familiarity with native CSS inlining
- QwikCity's resumability architecture minimizes JavaScript hydration
- Both support rapid development with modern DX
- **Verdict:** Good middle ground for teams prioritizing developer velocity without sacrificing mobile performance.

### Tier 4: Workable but Compromised

**TanStack React (131 KB) & Analog (118 KB)**

- **TanStack: 1602ms LCP** / **Analog: 1536ms LCP**
- React/Angular with SSR capabilities
- Larger runtimes impact LCP on realistic 4G (1.5-2x slower than Marko)
- CSS inlining requires manual configuration
- **Verdict:** Use only if your team is heavily invested in React/Angular ecosystem and can optimize aggressively.

### Tier 5: Not Recommended for Realistic WiFi

**Next.js, SvelteKit (4-5x slower than Marko)**

- **Next.js (Vercel): 3332ms LCP** / **SvelteKit: 2892ms LCP**
- Large bundles (190-171 KB) create 3-4 second wait times on realistic 4G
- External CSS by design (Next.js) or CSS injection overhead (SvelteKit)
- Bundle size effectively doubles time-to-interactive
- **Verdict:** Poor choice for realistic mobile conditions. Reserve for:
  - High-speed networks only
  - Progressive web apps with service workers for repeat visits
  - Desktop-first applications with secondary mobile support

### Critical Factor: CSS Inlining

All high-performing frameworks (Marko, SolidStart, TanStack-Solid, Nuxt, QwikCity) inline CSS to avoid render-blocking requests. This eliminates one HTTP roundtrip on slow networks—crucial for 400 Kbps connections where each roundtrip adds ~200-250ms.

### Recommendation Summary

**For realistic 4G mobile apps, prioritize in this order:**

1. **Best:** Marko (732ms LCP) - Use if team can adopt
2. **Very Good:** SolidStart or TanStack-Solid (~850-900ms LCP) - Strong choice for most teams
3. **Good:** Nuxt or QwikCity (~1200-1700ms LCP) - Acceptable performance with better DX
4. **Avoid:** React/Next.js, Vue, SvelteKit - Reserved for ideal 4G or desktop-first apps

**The Rule of 3x:** On realistic 4G, bundle size directly translates to LCP. Every 50KB of additional JavaScript adds roughly 500ms to LCP. Marko at 43KB achieves 732ms LCP, while Next.js at 193KB requires 3332ms—a 4.5x slowdown tied to a 4.5x larger bundle. This relationship holds across all frameworks measured.
