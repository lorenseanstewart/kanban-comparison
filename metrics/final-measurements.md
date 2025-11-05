# Framework Performance Comparison

*Generated: 2025-11-05T00:43:52.410Z*

## Methodology

- **Frameworks measured**: 10
- **Runs per page**: 10
- **Measurement type**: cold-load (cache cleared between runs)
- **Device**: Mobile (Pixel 5 emulation)
- **Network**: 4G
- **CPU**: No throttling
- **Lighthouse version**: 12.8.2

---

# Bundle Size Comparison

## Board Page Performance

Sorted by compressed bundle size (smallest first):

| Framework | Compressed (kB) | Raw (kB) | Compression | Perf Score | FCP (ms) | LCP (ms) |
|-----------|----------------|----------|-------------|------------|----------|----------|
| kanban-marko | 29.1 ±0.0 | 88.8 ±0.0 | 67% | 95 ±0.0 | 2357 ±37 | 2357 ±37 |
| kanban-htmx | 35.2 ±0.1 | 127.7 ±0.0 | 72% | 98 ±2.6 | 1648 ±910 | 1648 ±910 |
| kanban-solidstart | 48.1 ±0.0 | 128.2 ±0.0 | 62% | 97 ±1.7 | 2154 ±897 | 2154 ±897 |
| kanban-sveltekit | 55.9 ±0.0 | 121.1 ±0.0 | 54% | 100 ±2.6 | 580 ±862 | 580 ±862 |
| kanban-qwikcity | 59.4 ±0.0 | 114.8 ±0.0 | 48% | 100 ±0.0 | 579 ±59 | 579 ±59 |
| kanban-tanstack-solid | 62.0 ±0.1 | 183.2 ±0.0 | 66% | 100 ±0.0 | 651 ±89 | 651 ±89 |
| kanban-nuxt | 89.5 ±0.1 | 231.7 ±0.0 | 61% | 100 ±0.0 | 495 ±427 | 495 ±427 |
| kanban-tanstack | 120.0 ±0.1 | 373.6 ±0.0 | 68% | 100 ±0.0 | 531 ±48 | 531 ±48 |
| kanban-analog | 120.8 ±0.0 | 387.8 ±0.0 | 69% | 98 ±2.6 | 1598 ±929 | 1598 ±929 |
| kanban-nextjs | 173.3 ±0.1 | 549.9 ±0.0 | 68% | 97 ±0.5 | 2176 ±57 | 2176 ±57 |

**Explanation:**
- **Compressed**: Bytes transferred over network (what users actually download)
- **Raw**: Uncompressed bundle size (actual code volume after decompression)
- **Compression**: Percentage saved by compression (higher = better compression)
- Values show median ±std dev from 10 measurement runs
- Compression type: gzip

## Home Page Performance

Sorted by compressed bundle size (smallest first):

| Framework | Compressed (kB) | Raw (kB) | Compression | Perf Score | FCP (ms) | LCP (ms) |
|-----------|----------------|----------|-------------|------------|----------|----------|
| kanban-marko | 7.0 ±0.0 | 12.4 ±0.0 | 43% | 96 ±0.0 | 2198 ±25 | 2198 ±25 |
| kanban-htmx | 22.2 ±0.0 | 87.2 ±0.0 | 75% | 96 ±0.0 | 2214 ±25 | 2214 ±25 |
| kanban-solidstart | 34.5 ±0.1 | 83.6 ±0.0 | 59% | 97 ±1.8 | 2148 ±896 | 2148 ±896 |
| kanban-qwikcity | 43.2 ±0.0 | 86.5 ±0.0 | 50% | 96 ±0.0 | 2248 ±53 | 2248 ±53 |
| kanban-sveltekit | 49.2 ±0.0 | 99.4 ±0.0 | 50% | 96 ±0.0 | 2226 ±11 | 2226 ±11 |
| kanban-tanstack-solid | 50.9 ±0.1 | 146.8 ±0.0 | 65% | 96 ±0.0 | 2233 ±50 | 2233 ±50 |
| kanban-nuxt | 89.4 ±0.1 | 231.7 ±0.0 | 61% | 100 ±0.0 | 1211 ±50 | 1211 ±50 |
| kanban-analog | 93.8 ±0.0 | 289.3 ±0.0 | 68% | 96 ±0.0 | 2205 ±60 | 2205 ±60 |
| kanban-tanstack | 99.4 ±0.0 | 309.4 ±0.0 | 68% | 96 ±0.0 | 2224 ±51 | 2224 ±51 |
| kanban-nextjs | 144.7 ±0.1 | 467.0 ±0.0 | 69% | 97 ±1.7 | 2157 ±752 | 2157 ±720 |

**Explanation:**
- **Compressed**: Bytes transferred over network (what users actually download)
- **Raw**: Uncompressed bundle size (actual code volume after decompression)
- **Compression**: Percentage saved by compression (higher = better compression)
- Values show median ±std dev from 10 measurement runs
- Compression type: gzip

---

# Web Vitals

### Board Page - Core Web Vitals

| Framework | FCP (ms) | LCP (ms) | TBT (ms) | CLS | Speed Index |
|-----------|----------|----------|----------|-----|-------------|
| kanban-nuxt | 495 ±427 | 495 ±427 | 0 ±0 | 0.000 ±0.000 | 506 ±418 |
| kanban-qwikcity | 579 ±59 | 579 ±59 | 0 ±0 | 0.000 ±0.000 | 590 ±58 |
| kanban-sveltekit | 580 ±862 | 580 ±862 | 0 ±0 | 0.000 ±0.000 | 609 ±838 |
| kanban-tanstack-solid | 651 ±89 | 651 ±89 | 0 ±0 | 0.013 ±0.000 | 670 ±88 |
| kanban-tanstack | 531 ±48 | 531 ±48 | 0 ±0 | 0.000 ±0.000 | 542 ±50 |
| kanban-analog | 1598 ±929 | 1598 ±929 | 0 ±0 | 0.000 ±0.000 | 1443 ±826 |
| kanban-htmx | 1648 ±910 | 1648 ±910 | 0 ±0 | 0.000 ±0.000 | 1646 ±896 |
| kanban-nextjs | 2176 ±57 | 2176 ±57 | 0 ±0 | 0.000 ±0.000 | 2180 ±51 |
| kanban-solidstart | 2154 ±897 | 2154 ±897 | 0 ±0 | 0.000 ±0.000 | 2160 ±895 |
| kanban-marko | 2357 ±37 | 2357 ±37 | 0 ±0 | 0.000 ±0.000 | 2342 ±38 |

### Home Page - Core Web Vitals

| Framework | FCP (ms) | LCP (ms) | TBT (ms) | CLS | Speed Index |
|-----------|----------|----------|----------|-----|-------------|
| kanban-nuxt | 1211 ±50 | 1211 ±50 | 0 ±0 | 0.000 ±0.000 | 1209 ±50 |
| kanban-nextjs | 2157 ±752 | 2157 ±720 | 0 ±0 | 0.000 ±0.000 | 2147 ±739 |
| kanban-solidstart | 2148 ±896 | 2148 ±896 | 0 ±0 | 0.000 ±0.000 | 2138 ±879 |
| kanban-analog | 2205 ±60 | 2205 ±60 | 0 ±0 | 0.000 ±0.000 | 2008 ±50 |
| kanban-htmx | 2214 ±25 | 2214 ±25 | 0 ±0 | 0.000 ±0.000 | 2206 ±25 |
| kanban-marko | 2198 ±25 | 2198 ±25 | 0 ±0 | 0.000 ±0.000 | 2193 ±24 |
| kanban-qwikcity | 2248 ±53 | 2248 ±53 | 0 ±0 | 0.000 ±0.000 | 2228 ±53 |
| kanban-sveltekit | 2226 ±11 | 2226 ±11 | 0 ±0 | 0.000 ±0.000 | 2205 ±11 |
| kanban-tanstack-solid | 2233 ±50 | 2233 ±50 | 0 ±0 | 0.000 ±0.000 | 2212 ±49 |
| kanban-tanstack | 2224 ±51 | 2224 ±51 | 0 ±0 | 0.000 ±0.000 | 2206 ±49 |

---

## Framework Details

| Framework | URL | Last Measured |
|-----------|-----|---------------|
| kanban-analog | https://kanban-analog.pages.dev | 11/4/2025, 3:46:06 PM |
| kanban-htmx | https://kanban-htmx.pages.dev | 11/4/2025, 4:43:24 PM |
| kanban-marko | https://kanban-marko.pages.dev | 11/4/2025, 4:34:23 PM |
| kanban-nextjs | https://kanban-nextjs.pages.dev | 11/4/2025, 3:29:46 PM |
| kanban-nuxt | https://kanban-nuxt.pages.dev | 11/4/2025, 3:37:38 PM |
| kanban-qwikcity | https://kanban-qwikcity.pages.dev | 11/4/2025, 4:10:12 PM |
| kanban-solidstart | https://kanban-solidstart.pages.dev | 11/4/2025, 3:54:06 PM |
| kanban-sveltekit | https://kanban-sveltekit.pages.dev | 11/4/2025, 4:02:09 PM |
| kanban-tanstack-solid | https://kanban-tanstack-solid.pages.dev | 11/4/2025, 4:26:12 PM |
| kanban-tanstack | https://kanban-tanstack.pages.dev | 11/4/2025, 4:18:12 PM |

