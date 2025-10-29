# Framework Performance Comparison

*Measured: 2025-10-29T22:53:45.374Z*

## Methodology

- **Runs per page**: 10
- **Measurement type**: Cold-load (cache cleared between runs)
- **Device**: Mobile (Pixel 5 emulation)
- **Network**: 4G throttling (10 Mbps down, 40ms RTT)
- **CPU**: 1x (no throttling, to isolate bundle size impact)
- **Lighthouse version**: 12.8.2
- **Compression**: gzip

## Board Page Performance

Sorted by raw bundle size (smallest first):

| Framework | Raw (kB) | Compressed (kB) | Ratio | Perf Score | FCP (ms) | LCP (ms) |
|-----------|----------|----------------|-------|------------|----------|----------|
| Marko | 88.8 ±0.0 | 28.8 ±0.0 | 68% | 100 ±0.0 | 42 ±2 | 42 ±2 |
| Qwik | 114.8 ±0.0 | 58.4 ±0.0 | 49% | 100 ±0.0 | 71 ±7 | 71 ±7 |
| SvelteKit | 125.2 ±0.0 | 54.1 ±0.0 | 57% | 100 ±0.0 | 38 ±1 | 38 ±1 |
| Astro | 127.3 ±0.0 | 34.3 ±0.0 | 73% | 100 ±0.0 | 56 ±1 | 56 ±1 |
| SolidStart | 128.6 ±0.0 | 41.5 ±0.0 | 68% | 100 ±0.0 | 35 ±3 | 35 ±3 |
| TanStack Start + Solid | 182.6 ±0.0 | 60.4 ±0.0 | 67% | 100 ±0.0 | 39 ±2 | 39 ±2 |
| Nuxt | 224.9 ±0.0 | 74.7 ±0.0 | 67% | 100 ±0.0 | 38 ±4 | 38 ±4 |
| TanStack Start | 373.6 ±0.0 | 118.2 ±0.0 | 68% | 100 ±0.0 | 41 ±2 | 41 ±2 |
| Analog | 376.3 ±0.0 | 103.9 ±0.0 | 72% | 100 ±0.0 | 65 ±5 | 65 ±5 |
| Next.js | 564.9 ±0.0 | 176.3 ±0.0 | 69% | 100 ±0.0 | 444 ±1 | 444 ±1 |

**Explanation:**
- **Raw**: Uncompressed bundle size (actual code volume, more consistent for comparison)
- **Compressed**: Bytes transferred over network (what users download)
- **Ratio**: Percentage saved by compression (higher is better compression)
- Values show median ±std dev from 10 measurement runs
- Compression type: gzip

## Home Page Performance

Sorted by raw bundle size (smallest first):

| Framework | Raw (kB) | Compressed (kB) | Ratio | Perf Score | FCP (ms) | LCP (ms) |
|-----------|----------|----------------|-------|------------|----------|----------|
| Marko | 12.4 ±0.0 | 6.8 ±0.0 | 45% | 100 ±0.0 | 35 ±2 | 35 ±2 |
| SolidStart | 83.9 ±0.0 | 29.8 ±0.0 | 64% | 100 ±0.0 | 37 ±2 | 37 ±2 |
| Qwik | 86.5 ±0.0 | 42.5 ±0.0 | 51% | 100 ±0.0 | 44 ±2 | 44 ±2 |
| Astro | 86.9 ±0.0 | 21.5 ±0.0 | 75% | 100 ±0.0 | 43 ±2 | 43 ±2 |
| SvelteKit | 103.4 ±0.0 | 47.8 ±0.0 | 54% | 100 ±0.0 | 39 ±4 | 39 ±4 |
| TanStack Start + Solid | 149.4 ±0.0 | 50.8 ±0.0 | 66% | 100 ±0.0 | 38 ±2 | 38 ±2 |
| Nuxt | 224.9 ±0.0 | 74.7 ±0.0 | 67% | 100 ±0.0 | 33 ±1 | 33 ±1 |
| TanStack Start | 309.4 ±0.0 | 98.3 ±0.0 | 68% | 100 ±0.0 | 38 ±1 | 38 ±1 |
| Analog | 376.3 ±0.0 | 103.9 ±0.0 | 72% | 100 ±0.0 | 52 ±5 | 52 ±5 |
| Next.js | 486.1 ±0.0 | 150.9 ±0.0 | 69% | 100 ±0.0 | 140 ±11 | 140 ±11 |

**Explanation:**
- **Raw**: Uncompressed bundle size (actual code volume, more consistent for comparison)
- **Compressed**: Bytes transferred over network (what users download)
- **Ratio**: Percentage saved by compression (higher is better compression)
- Values show median ±std dev from 10 measurement runs
- Compression type: gzip

