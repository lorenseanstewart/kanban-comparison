# Playwright Tool - Quick Start Guide

## 30-Second Setup

```bash
cd playwright
npm install
npm run measure -- --url http://localhost:3000 --runs 3
```

Done! Results go to `metrics/localhost-playwright.json`

## What You Get

📊 **4 measurements per framework** (automatically):
- ❄️ Home page - Cold-load (no cache)
- 🔥 Home page - Warm-load (cached)
- ❄️ Board page - Cold-load (no cache)
- 🔥 Board page - Warm-load (cached)

## Understanding the Output

### Quick Facts
- `--runs 3` = 3 cold runs + 3 warm runs per page = 12 total page loads
- Takes ~10-15 minutes per framework
- Each metric includes: mean, median, stddev, min, max

### Key Metrics to Compare

**Bundle Sizes:**
- Cold: Full download
- Warm: Should be ~0 (cached)

**LCP Time:**
- Cold: How fast first-time visitors see content
- Warm: How fast returning visitors see content

**Script Eval Time:**
- Cold: High (parsing + evaluation)
- Warm: Low (cached, minimal parsing)

## Common Commands

### Quick test (3 runs)
```bash
npm run measure -- --url http://localhost:3000 --runs 3
```

### Thorough test (10 runs)
```bash
npm run measure -- --url http://localhost:3000 --runs 10
```

### Slow network simulation (3G)
```bash
npm run measure -- --url http://localhost:3000 --runs 5 --network 3g
```

### Production site
```bash
npm run measure -- --url https://your-site.pages.dev --runs 5
```

### Using shell script
```bash
./run-measurement.sh http://localhost:3000 "My Framework" 5 3g
```

## Interpreting Results

Open `metrics/localhost-playwright.json` and look for:

### If it looks healthy:
```json
{
  "page": "home",
  "cacheMode": "cold",
  "jsTransferred": { "median": 45000 }  // Some size
},
{
  "page": "home",
  "cacheMode": "warm",
  "jsTransferred": { "median": 0 }      // Cached to 0!
}
```

✅ Caching works! Warm is much faster.

### If something's wrong:
```json
{
  "cacheMode": "cold",
  "jsTransferred": { "median": 100000 }
},
{
  "cacheMode": "warm",
  "jsTransferred": { "median": 95000 }   // Still 95%!
}
```

⚠️ Cache isn't working well. Check cache headers.

## Quick Analysis

Extract just what you need:

### Compare two frameworks
```bash
# Measure both
npm run measure -- --url http://localhost:3000 --name "Framework A" --runs 5
npm run measure -- --url http://localhost:3001 --name "Framework B" --runs 5

# Results in:
# metrics/Framework A-playwright.json
# metrics/Framework B-playwright.json

# Check: Which has smaller cold bundle?
# Check: Which shows better warm-load improvement?
```

### Check cache impact on one metric
```bash
# Look in the JSON for home page, cold vs warm
# Compare jsTransferred, lcp, scriptEvalTime

# Quick ratio:
# (cold - warm) / cold × 100 = % improvement
```

### Test slow network
```bash
npm run measure -- --url http://localhost:3000 --runs 3 --network 3g
```

Compare results to 4G - how much slower is 3G?

## File Locations

```
playwright/
├── measure.ts              # The measurement script
├── package.json            # Dependencies
├── README.md               # Detailed docs
├── CACHE_STRATEGY.md       # Deep dive on cache
└── EXAMPLES.md             # 50+ examples

metrics/
├── localhost-playwright.json        # Your results
└── [other framework results]
```

## Need Help?

**For command options:**
```bash
npm run measure -- --help
```

**For what each metric means:**
See `README.md` in playwright/

**For deep technical details:**
See `CACHE_STRATEGY.md` and `ARCHITECTURE.md` in playwright/

**For more examples:**
See `EXAMPLES.md` in playwright/

## Typical Workflow

### Day 1: Quick Check
```bash
npm run measure -- --url http://localhost:3000 --runs 3
```
See if basics work, how long it takes.

### Day 2: Thorough Measurement
```bash
npm run measure -- --url http://localhost:3000 --runs 10 --network 4g
npm run measure -- --url http://localhost:3000 --runs 10 --network 3g
```
Get detailed stats on both fast and slow networks.

### Day 3: Framework Comparison
```bash
for framework in nextjs nuxt sveltekit astro; do
  npm run measure -- --url http://localhost:${port} --name "$framework" --runs 5
done
```

### Analysis
```bash
# Compare cold-load JS sizes
cat metrics/*.json | jq '.results[] | select(.cacheMode == "cold") | {framework, jsTransferred: .jsTransferred.median}'

# Compare warm-load LCP times  
cat metrics/*.json | jq '.results[] | select(.cacheMode == "warm") | {framework, lcp: .lcp.median}'
```

## Time Estimates

| Runs | Pages | Cold+Warm | Total Time | Network |
|------|-------|-----------|-----------|---------|
| 3 | 2 | 12 loads | ~15 min | 4G |
| 5 | 2 | 20 loads | ~25 min | 4G |
| 10 | 2 | 40 loads | ~50 min | 4G |
| 5 | 2 | 20 loads | ~60 min | 3G |
| 5 | 2 | 20 loads | ~2 hrs | Slow 3G |

## Pro Tips

1. **Start with `--runs 3`** - Get a feel for it
2. **Use `--network 3g`** - More representative of real users
3. **Compare within cache mode** - Cold vs cold, warm vs warm
4. **Look at LCP first** - Most user-visible metric
5. **Check JS size ratio** - Is JS the bottleneck?
6. **Run at different times** - Average over multiple days for production sites

## Troubleshooting

**"Port already in use"**
```bash
lsof -i :3000
kill -9 [PID]
```

**"Slow measurement"**
- Check system load: `top`
- Use `--runs 3` instead of 10
- Try different time of day

**"Inconsistent results"**
- Use more runs: `--runs 10` instead of 3
- Check browser task manager for other tabs
- Quit other applications

**"Cache not working"**
- Check HTTP headers in browser DevTools
- Look for Cache-Control header
- Files may have ?timestamp query strings breaking cache

## Next Steps

1. ✅ Install and run once
2. ✅ Compare your frameworks
3. ✅ Identify optimization opportunities
4. ✅ Run again after optimizations
5. ✅ Track improvements over time

## Remember

- **Cold-load**: First-time user experience (most critical)
- **Warm-load**: Returning user experience (shows caching quality)
- **Both matter**: Comprehensive view needed

Happy measuring! 📊
