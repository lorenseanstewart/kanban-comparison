# Performance Metrics

## Table 1: Bundle Sizes and Parse Times Ranked by Realistic 4G (Ideal 3G) Parse Time

| Framework        | Bundle Size (KB) | Parse Time - Ideal 4G (ms) | Parse Time - Realistic 4G (Ideal 3G) (ms) |
| ---------------- | ---------------- | -------------------------- | ----------------------------------------- |
| HTMX             | 1.9              | 4                          | 38                                        |
| Marko            | 43.3             | 85                         | 866                                       |
| SolidStart       | 45.5             | 89                         | 909                                       |
| TanStack-Solid   | 58.4             | 114                        | 1168                                      |
| QwikCity         | 65.1             | 127                        | 1303                                      |
| SvelteKit        | 65.8             | 129                        | 1316                                      |
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
| SvelteKit        | 65.8             | 1036                | 2424                               |
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
| SvelteKit        | 1392     | 2424     | 1032           |
| Next.js (CF)     | 2855     | 3212     | 357            |
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
| SvelteKit        | 364      | 1036     | 672            |
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

**Next.js, SvelteKit (3.3-4.5x slower than Marko)**

- **Next.js (Vercel): 3332ms LCP** / **SvelteKit: 2424ms LCP**
- Large bundles (190+ KB for Next.js, 66 KB for SvelteKit) create 2.4-3.3 second wait times on realistic 4G
- External CSS by design (Next.js) with additional network requests
- Bundle size and architecture impact time-to-interactive
- **Verdict:** Poor choice for realistic mobile conditions. Reserve for:
  - High-speed networks only
  - Progressive web apps with service workers for repeat visits
  - Desktop-first applications with secondary mobile support

### Critical Factor: CSS Inlining

All high-performing frameworks (Marko, SolidStart, TanStack-Solid, Nuxt, QwikCity) inline CSS to avoid render-blocking requests. This eliminates one HTTP roundtrip on slow networks—crucial for 400 Kbps connections where each roundtrip adds ~200-250ms.

### Recommendation Summary

**For realistic 4G mobile apps, prioritize in this order:**

1. **Best:** Marko (732ms LCP) - Use if team can adopt
2. **Very Good:** SolidStart or TanStack-Solid (~850-1600ms LCP) - Strong choice for most teams
3. **Good:** Nuxt or QwikCity (~1200-1700ms LCP) - Acceptable performance with better DX
4. **Avoid:** SvelteKit, React/Next.js - Reserved for ideal 4G or desktop-first apps

**The Rule of 3x:** On realistic 4G, bundle size directly translates to LCP. Every 50KB of additional JavaScript adds roughly 500ms to LCP. Marko at 43KB achieves 732ms LCP, SvelteKit at 66KB achieves 2424ms LCP, while Next.js at 193KB requires 3332ms—a 4.5x slowdown tied to a 4.5x larger bundle. This relationship holds across all frameworks measured.

---

## Human Perception and Performance: The Psychology of Speed

Understanding how users perceive performance is critical for web development. Performance isn't just about raw speed—it's about whether users can *feel* the difference. Research in human perception and psychophysics provides clear thresholds that guide performance optimization.

### The Three Response Time Limits

Jakob Nielsen's foundational research, based on 40+ years of human factors studies, identifies three critical time thresholds that remain valid today:

**0.1 second (100ms)**: The limit for users to feel the system is reacting instantaneously. No special feedback is necessary—the outcome feels directly caused by the user's action, not the computer. This threshold is essential for direct manipulation interfaces.

**1.0 second**: The limit for users' flow of thought to remain uninterrupted. Users notice the delay but still feel in control of the experience and maintain their mental context.

**10 seconds**: The limit for keeping users' attention focused on the dialogue. Beyond this point, users become distracted and require feedback (like progress indicators) to maintain engagement.

*Source: [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/) - Nielsen Norman Group*

### Perception Time Zones

More nuanced research reveals additional perception zones for web performance:

- **0.1-0.2 seconds**: Maximum for "instantaneous" behavior—users barely notice delays
- **0.5-1 second**: "Immediate" response time matching human conversation; noticeable but tolerated
- **2-5 seconds**: Optimal flow state; users remain concentrated
- **5-10 seconds**: Attention span limit; users become easily distracted

*Source: [Why Performance Matters: The Perception of Time](https://www.smashingmagazine.com/2015/09/why-performance-matters-the-perception-of-time/) - Smashing Magazine*

### The 20% Rule: Just Noticeable Difference

Based on the **Weber-Fechner Law** from psychophysics, users require at least a **20% change in duration** to perceive a difference. This has profound implications for performance optimization:

- Improving load time from 5 seconds to 4.5 seconds (10% improvement) won't be noticed
- Improving from 5 seconds to 4 seconds (20% improvement) becomes perceptible
- **To beat competitors, you must be 20% faster** for users to notice the difference

**Why does it matter?** As the Uptrends research explains: "Faster translates to mean 'better' in the mind of the user." In a Radware study using EEG and eyetracking technologies, two groups of users experienced the same site at different speeds. **A difference of half a second (500ms) was enough to influence the users' opinions of the site**—resulting in a 26% increase in peak frustration and an 8% decrease in engagement. Even more striking, the slower experience damaged brand perception across dimensions unrelated to speed, with users rating the same site as "inelegant," "boring," "childlike," and "tacky" when it loaded just 500ms slower.

**Real-world example**: If a competitor's page loads in 3 seconds and yours loads in 2.9 seconds (3% faster), users won't perceive any difference. You need to reach 2.4 seconds (20% faster) for the improvement to be noticeable—and to shift their emotional response from negative to positive.

*Sources: [The Psychology of Web Performance](https://blog.uptrends.com/web-performance/the-psychology-of-web-performance/) - Uptrends Blog | [Radware Mobile Web Stress Study](https://www.globenewswire.com/en/news-release/2013/12/10/595726/8980/en/Retailers-Beware-Radware-Study-Reveals-Strong-Correlation-Between-Slow-Network-Speed-and-Brand-Perception.html) - GlobeNewswire*

### Google Core Web Vitals Thresholds (2024-2025)

Google's Core Web Vitals provide industry-standard performance thresholds based on real-world user experience data. These metrics directly affect search rankings:

#### Largest Contentful Paint (LCP)
- **Good**: ≤ 2.5 seconds
- **Needs Improvement**: 2.5-4.0 seconds
- **Poor**: > 4.0 seconds

LCP measures how long it takes for the largest content element to become visible—the primary metric for perceived load speed.

#### Interaction to Next Paint (INP)
- **Good**: ≤ 200 milliseconds
- **Needs Improvement**: 200-500 milliseconds
- **Poor**: > 500 milliseconds

INP became a Core Web Vital on March 12, 2024, replacing First Input Delay (FID). It measures overall page responsiveness to user interactions throughout the page lifecycle. While research suggests users expect interactions under 100ms, the 200ms threshold was set as an achievable target across device capabilities.

#### First Contentful Paint (FCP)
- **Good**: ≤ 1.8 seconds

FCP measures when the first content element appears on screen—the first signal to users that the page is loading.

**Important**: Google uses the 75th percentile value across all page views, meaning 75% of visits must meet "good" thresholds for the site to be classified as having good performance.

*Sources: [Core Web Vitals](https://web.dev/articles/vitals/) - web.dev | [Interaction to Next Paint](https://web.dev/inp/) - web.dev*

### Applying Perception Research to Framework Selection

When evaluating the framework metrics in this document against perception thresholds:

**Marko (732ms LCP on 3G)**: Falls within the 0.5-1 second "immediate" zone—fast enough to feel responsive even on slow networks.

**Mid-tier frameworks (852-1740ms LCP on 3G)**: Within the 2-5 second flow state zone when considering full page interaction, but individual paint times remain perceptible.

**Slower frameworks (2424-3332ms LCP on 3G)**: Exceed the 2-5 second optimal flow state, risking user distraction. At 3+ seconds, users perceive significant delays that impact satisfaction.

**The 20% Rule in practice**: The difference between Marko (732ms) and Next.js (3332ms) is 355% slower—far exceeding the 20% perceptibility threshold. Even smaller differences like Marko (732ms) vs. TanStack-Solid (852ms) represent a 16% difference, approaching but not quite reaching the perception threshold. This explains why all top-tier frameworks cluster within 100-200ms of each other—meaningful differentiation requires jumps of 20% or more.

### Framework Comparison: TanStack React vs TanStack-Solid

Both TanStack implementations use the same router architecture and server-side rendering patterns, making this comparison a direct test of **React vs Solid as runtime engines**. The results reveal how underlying framework architecture impacts performance:

#### Bundle Size Analysis
- **TanStack React**: 131.1 KB total (74% JavaScript)
- **TanStack-Solid**: 58.4 KB total (74% JavaScript)
- **Difference**: Solid is **55% smaller** (72.7 KB reduction)

React's larger runtime footprint adds 72+ KB to every page load. On realistic 4G (400 Kbps), this translates to an additional **1.5 seconds of download time** before JavaScript can even begin parsing.

#### Performance Impact on Realistic 4G (3G speeds)
| Metric | TanStack React | TanStack-Solid | Difference |
|--------|---------------|----------------|------------|
| LCP | 1,602ms | 852ms | **88% faster** |
| FCP | 1,623ms | 867ms | **87% faster** |
| Bundle Size | 131.1 KB | 58.4 KB | 55% smaller |
| Parse Time | 2,621ms | 1,168ms | **55% faster** |

#### Performance Impact on Ideal 4G
| Metric | TanStack React | TanStack-Solid | Difference |
|--------|---------------|----------------|------------|
| LCP | 822ms | 504ms | **63% faster** |
| FCP | 838ms | 520ms | **61% faster** |

#### Key Insights

**The Solid advantage is network-amplified**: On ideal 4G, Solid is 63% faster. On realistic 4G with 3G speeds, that gap widens to **88% faster**. Slow networks magnify the impact of bundle size differences—every extra kilobyte hurts more at 400 Kbps than at 4 Mbps.

**Same architecture, vastly different outcomes**: Both implementations use identical TanStack Router patterns, server-side rendering, and application structure. The performance difference stems entirely from the runtime efficiency of Solid vs React. Solid's fine-grained reactivity eliminates the virtual DOM overhead, resulting in dramatically smaller compiled output.

**Perception impact**: The 750ms difference on realistic 4G (1,602ms vs 852ms) represents a **47% improvement**—well above the 20% perceptibility threshold. Users will consciously notice TanStack-Solid feeling faster. Combined with the Radware research showing 500ms differences impact brand perception, this gap is large enough to shift emotional responses from frustration to satisfaction.

**Developer experience trade-off**: Both frameworks offer excellent developer experience with TypeScript, file-based routing, and modern patterns. The choice comes down to: React's larger ecosystem and team familiarity vs. Solid's superior performance on constrained networks. For mobile-first applications targeting realistic 4G users, the 88% performance advantage makes Solid compelling enough to justify the learning curve.

### Framework Comparison: Next.js vs SvelteKit

Next.js (Vercel) and SvelteKit represent the flagship frameworks for React and Svelte respectively, both offering server-side rendering, file-based routing, and production-ready deployment infrastructure. Despite similar feature sets, their performance profiles diverge significantly on mobile networks.

#### Bundle Size Analysis
- **Next.js (Vercel)**: 193.6 KB total
- **SvelteKit**: 65.8 KB total
- **Difference**: SvelteKit is **66% smaller** (127.8 KB reduction)

Next.js ships nearly **3x more JavaScript** than SvelteKit. This includes React's runtime, Next.js framework code, and hydration overhead. Svelte's compiler-based approach eliminates the runtime framework, producing vanilla JavaScript that browsers execute directly.

#### Performance Impact on Realistic 4G (3G speeds)
| Metric | Next.js (Vercel) | SvelteKit | Difference |
|--------|-----------------|-----------|------------|
| LCP | 3,332ms | 2,424ms | **37% faster** |
| FCP | 2,967ms | 1,392ms | **113% faster** |
| Bundle Size | 193.6 KB | 65.8 KB | 66% smaller |
| Parse Time | 3,872ms | 1,316ms | **66% faster** |

#### Performance Impact on Ideal 4G
| Metric | Next.js (Vercel) | SvelteKit | Difference |
|--------|-----------------|-----------|------------|
| LCP | 892ms | 1,036ms | **14% slower** |
| FCP | 500ms | 364ms | **37% faster** |

#### Key Insights

**Network conditions flip the script**: On ideal 4G, Next.js achieves competitive LCP (892ms vs 1,036ms), actually outperforming SvelteKit by 14% on this metric. However, on realistic 4G, SvelteKit's smaller bundle becomes decisive—**37% faster LCP** and **113% faster FCP**. The performance winner depends entirely on your target network conditions.

**FCP tells a different story**: Even on ideal 4G, SvelteKit shows first content 37% faster (364ms vs 500ms). This suggests Next.js's hydration strategy delays initial rendering compared to SvelteKit's approach, independent of network speed.

**The 3-second wall**: Next.js crosses the critical 3-second threshold on realistic 4G (3,332ms LCP), entering the zone where users become distracted and frustrated. SvelteKit stays below this at 2,424ms, though still outside the optimal 2-5 second flow state. Both frameworks struggle on slow networks, but SvelteKit maintains user engagement where Next.js risks abandonment.

**Perception impact**: The 908ms difference on realistic 4G (3,332ms vs 2,424ms) represents a **37% improvement**—well above the 20% perceptibility threshold. More importantly, it's the difference between "uncomfortably slow" and "noticeably slow." While neither framework delivers the sub-1-second experience of Marko or TanStack-Solid, SvelteKit's performance keeps users in the flow state longer.

**Ecosystem vs performance trade-off**: Next.js offers unmatched ecosystem maturity—extensive middleware, authentication solutions, deployment options (Vercel), and the world's largest component library (React). SvelteKit counters with superior performance on constrained networks and simpler mental models (no virtual DOM, less boilerplate). The decision depends on your priorities:

- **Choose Next.js if**: You need React ecosystem compatibility, have an existing React team, target primarily desktop or high-speed mobile networks (5G, WiFi), or require Vercel's edge runtime features.

- **Choose SvelteKit if**: Mobile users on realistic 4G are your primary audience, you're starting a new project without React dependencies, performance is a top-3 priority, or you prefer compiler-based frameworks over runtime frameworks.

**The missing middle ground**: Both frameworks fall short of the sub-1-second LCP achieved by Marko (732ms) and TanStack-Solid (852ms) on realistic 4G. If mobile performance is critical, consider whether the ecosystem benefits of Next.js or the developer experience of SvelteKit justify the 2-3x performance penalty compared to lighter alternatives.

### Conclusion

Performance optimization isn't about chasing every millisecond—it's about crossing perceptual thresholds that matter to users. The 100ms threshold for instantaneous response, the 1-second threshold for flow, and the 20% rule for noticeable differences should guide your optimization priorities. On realistic 4G mobile networks, choosing a framework with sub-1-second LCP (like Marko, TanStack-Solid, or Nuxt) versus a 2-3 second framework (like SvelteKit or Next.js) creates a perceptually massive difference that directly impacts user satisfaction and engagement.
