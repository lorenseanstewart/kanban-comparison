# Framework Bundle Size Comparison

*Measured: 2025-11-02T22:33:11.691Z*

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
| Marko | 88.8 ±0.0 | 28.8 ±0.0 | 68% | 100 ±0.0 | 42 ±3 | 42 ±3 |
| Qwik | 114.8 ±0.0 | 58.4 ±0.0 | 49% | 100 ±0.0 | 68 ±3 | 68 ±3 |
| SvelteKit | 125.2 ±0.0 | 54.1 ±0.0 | 57% | 100 ±0.0 | 39 ±2 | 39 ±2 |
| Astro | 127.3 ±0.0 | 34.3 ±0.0 | 73% | 100 ±0.0 | 58 ±2 | 58 ±2 |
| SolidStart | 128.6 ±0.0 | 41.5 ±0.0 | 68% | 100 ±0.0 | 41 ±17 | 41 ±17 |
| TanStack Start + Solid | 182.6 ±0.0 | 60.4 ±0.0 | 67% | 100 ±0.0 | 39 ±6 | 39 ±6 |
| Nuxt | 224.9 ±0.0 | 74.7 ±0.0 | 67% | 100 ±0.0 | 38 ±2 | 38 ±2 |
| TanStack Start | 373.6 ±0.0 | 118.2 ±0.0 | 68% | 100 ±0.0 | 40 ±5 | 40 ±5 |
| Analog | 376.3 ±0.0 | 103.9 ±0.0 | 72% | 100 ±0.0 | 53 ±4 | 53 ±4 |
| Next.js | 563.7 ±0.0 | 176.1 ±0.0 | 69% | 100 ±0.0 | 37 ±2 | 343 ±5 |

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
| Marko | 12.4 ±0.0 | 6.8 ±0.0 | 45% | 100 ±0.0 | 36 ±1 | 36 ±1 |
| SolidStart | 83.9 ±0.0 | 29.8 ±0.0 | 64% | 100 ±0.0 | 38 ±3 | 38 ±3 |
| Qwik | 86.5 ±0.0 | 42.5 ±0.0 | 51% | 100 ±0.0 | 45 ±2 | 45 ±2 |
| Astro | 86.9 ±0.0 | 21.5 ±0.0 | 75% | 100 ±0.0 | 44 ±3 | 44 ±3 |
| SvelteKit | 103.4 ±0.0 | 47.8 ±0.0 | 54% | 100 ±0.0 | 40 ±2 | 40 ±2 |
| TanStack Start + Solid | 149.4 ±0.0 | 50.8 ±0.0 | 66% | 100 ±0.0 | 40 ±3 | 40 ±3 |
| Nuxt | 224.9 ±0.0 | 74.7 ±0.0 | 67% | 100 ±0.0 | 34 ±1 | 34 ±1 |
| TanStack Start | 309.4 ±0.0 | 98.3 ±0.0 | 68% | 100 ±0.0 | 37 ±3 | 37 ±3 |
| Analog | 376.3 ±0.0 | 103.9 ±0.0 | 72% | 100 ±0.0 | 42 ±2 | 42 ±2 |
| Next.js | 486.1 ±0.0 | 150.9 ±0.0 | 69% | 100 ±0.0 | 37 ±4 | 37 ±4 |

**Explanation:**
- **Raw**: Uncompressed bundle size (actual code volume, more consistent for comparison)
- **Compressed**: Bytes transferred over network (what users download)
- **Ratio**: Percentage saved by compression (higher is better compression)
- Values show median ±std dev from 10 measurement runs
- Compression type: gzip

