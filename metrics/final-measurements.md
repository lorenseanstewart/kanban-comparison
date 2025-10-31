# Framework Performance Comparison

*Measured: 2025-10-31T03:26:26.025Z*

## Methodology

- **Runs per page**: 10
- **Measurement type**: Cold-load (cache cleared between runs)
- **Device**: Mobile (Pixel 5 emulation)
- **Network**: 4G throttling (10 Mbps down, 40ms RTT)
- **CPU**: 1x (no throttling, to isolate bundle size impact)
- **Lighthouse version**: 13.0.1
- **Compression**: gzip

## Board Page Performance

Sorted by raw bundle size (smallest first):

| Framework | Raw (kB) | Compressed (kB) | Ratio | Perf Score | FCP (ms) | LCP (ms) |
|-----------|----------|----------------|-------|------------|----------|----------|
| Datastar | 28.7 ±0.0 | 12.4 ±0.0 | 57% | 100 ±0.0 | 31 ±2 | 31 ±2 |
| Marko | 88.8 ±0.0 | 28.8 ±0.0 | 68% | 100 ±0.0 | 36 ±1 | 36 ±1 |
| Qwik | 114.8 ±0.0 | 58.4 ±0.0 | 49% | 100 ±0.0 | 57 ±2 | 57 ±2 |
| SvelteKit | 121.1 ±0.0 | 52.6 ±0.0 | 57% | 100 ±0.0 | 33 ±1 | 33 ±1 |
| Astro | 127.3 ±0.0 | 34.3 ±0.0 | 73% | 100 ±0.0 | 48 ±1 | 48 ±1 |
| SolidStart | 128.7 ±0.0 | 41.5 ±0.0 | 68% | 100 ±0.0 | 31 ±4 | 31 ±4 |
| TanStack Start + Solid | 180.9 ±0.0 | 59.8 ±0.0 | 67% | 100 ±0.0 | 34 ±3 | 34 ±3 |
| Nuxt | 224.9 ±0.0 | 74.7 ±0.0 | 67% | 100 ±0.0 | 34 ±1 | 34 ±1 |
| TanStack Start | 372.7 ±0.0 | 118.1 ±0.0 | 68% | 100 ±0.0 | 33 ±2 | 33 ±2 |
| Next.js | 564.9 ±0.0 | 176.3 ±0.0 | 69% | 100 ±0.0 | 433 ±134 | 433 ±134 |
| Analog | 666.5 ±0.0 | 125.4 ±0.0 | 81% | 100 ±0.0 | 48 ±2 | 48 ±2 |

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
| Marko | 12.4 ±0.0 | 6.8 ±0.0 | 45% | 100 ±0.0 | 30 ±2 | 30 ±2 |
| Datastar | 28.7 ±0.0 | 12.4 ±0.1 | 57% | 100 ±0.0 | 27 ±2 | 27 ±2 |
| SolidStart | 84.0 ±0.0 | 29.8 ±0.0 | 64% | 100 ±0.0 | 34 ±3 | 34 ±3 |
| Qwik | 86.5 ±0.0 | 42.5 ±0.0 | 51% | 100 ±0.0 | 37 ±1 | 37 ±1 |
| Astro | 86.9 ±0.0 | 21.5 ±0.0 | 75% | 100 ±0.0 | 37 ±1 | 37 ±1 |
| SvelteKit | 99.4 ±0.0 | 46.2 ±0.0 | 53% | 100 ±0.0 | 37 ±4 | 37 ±4 |
| TanStack Start + Solid | 144.4 ±0.0 | 48.9 ±0.0 | 66% | 100 ±0.0 | 34 ±2 | 34 ±2 |
| Nuxt | 224.9 ±0.0 | 74.7 ±0.0 | 67% | 100 ±0.0 | 29 ±1 | 29 ±1 |
| TanStack Start | 308.5 ±0.0 | 98.2 ±0.0 | 68% | 100 ±0.0 | 34 ±1 | 34 ±1 |
| Analog | 430.3 ±0.0 | 113.3 ±0.0 | 74% | 100 ±0.0 | 32 ±2 | 32 ±2 |
| Next.js | 486.1 ±0.0 | 150.9 ±0.0 | 69% | 100 ±0.0 | 126 ±9 | 126 ±9 |

**Explanation:**
- **Raw**: Uncompressed bundle size (actual code volume, more consistent for comparison)
- **Compressed**: Bytes transferred over network (what users download)
- **Ratio**: Percentage saved by compression (higher is better compression)
- Values show median ±std dev from 10 measurement runs
- Compression type: gzip

