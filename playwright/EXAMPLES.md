# Playwright Measurement Examples

## Understanding Cache Modes

All measurements automatically include **both** cache scenarios:

- **❄️ Cold-Load**: Browser cache cleared, separate contexts per run (first-visit experience)
- **🔥 Warm-Load**: Cache retained, same context across runs (repeat-visit experience)

So `--runs 5` actually runs 10 page loads (5 cold + 5 warm) per page.

### Time Estimate

With `--runs N` on 2 pages (home + board):

- N=3: ~10-15 minutes
- N=5: ~20-30 minutes
- N=10: ~40-60 minutes

Times vary based on network condition and server response time.

## Basic Examples

### Single Quick Measurement

```bash
tsx measure.ts --url http://localhost:3000
```

Output: 10 runs × 2 cache modes = 20 page loads per page, results to metrics/localhost-playwright.json

### Named Framework Measurement

```bash
tsx measure.ts --url http://localhost:3000 --name "Next.js"
```

Output: metrics/Next.js-playwright.json

### Fewer Runs for Quick Iteration

```bash
tsx measure.ts --url http://localhost:3000 --runs 3
```

Output: 3 runs per page instead of default 10

## Network Condition Examples

### Test with 4G Throttling (Default)

```bash
tsx measure.ts --url http://localhost:3000 --name "Next.js" --runs 5
```

Uses Chrome's built-in `cellular4g` connection type

### Test Without Throttling

```bash
tsx measure.ts --url http://localhost:3000 --name "React" --runs 5 --network none
```

No network throttling, maximum speed

## Production URL Examples

### Measure Deployed Framework

```bash
tsx measure.ts --url https://kanban-nextjs.pages.dev --name "Next.js" --runs 5
```

### All Frameworks on Cloudflare Pages

```bash
tsx measure.ts --url https://kanban-nextjs.pages.dev --name "Next.js" --runs 5
tsx measure.ts --url https://kanban-nuxt.pages.dev --name "Nuxt" --runs 5
tsx measure.ts --url https://kanban-sveltekit.pages.dev --name "SvelteKit" --runs 5
tsx measure.ts --url https://kanban-qwikcity.pages.dev --name "Qwik" --runs 5
tsx measure.ts --url https://kanban-astro.pages.dev --name "Astro" --runs 5
```


## Comparison Examples

### Run Both Tools on Same URL

```bash
# Lighthouse measurement
tsx ../scripts/measure-single.ts --url http://localhost:3000 --runs 5

# Playwright measurement
tsx measure.ts --url http://localhost:3000 --runs 5

# Compare results
# metrics/localhost.json (Lighthouse)
# metrics/localhost-playwright.json (Playwright)
```


## Batch Measurement Examples

### Test All Local Frameworks

```bash
#!/bin/bash

frameworks=(
  "http://localhost:3000:Next.js"
  "http://localhost:3002:Nuxt"
  "http://localhost:3003:Analog"
  "http://localhost:3004:SolidStart"
  "http://localhost:3005:SvelteKit"
)

for framework in "${frameworks[@]}"; do
  IFS=':' read -r url name <<< "$framework"
  echo "Measuring $name..."
  npx tsx measure.ts --url "$url" --name "$name" --runs 5
  sleep 5
done
```

### Measure All Frameworks

```bash
#!/bin/bash

frameworks=("nextjs" "nuxt" "sveltekit" "qwik" "astro")

for framework in "${frameworks[@]}"; do
  url="https://kanban-${framework}.pages.dev"
  echo "Measuring $framework..."
  npx tsx measure.ts --url "$url" --name "$framework" --runs 5
  sleep 3
done
```

## Analyzing Results

### View Home Page Results

```bash
cat metrics/Next.js-playwright.json | jq '.results[] | select(.page == "home")'
```

### Extract JS Bundle Sizes

```bash
cat metrics/Next.js-playwright.json | jq '.results[] | {page, jsTransferred: .jsTransferred.median, jsUncompressed: .jsUncompressed.median}'
```

### Compare Frameworks

```bash
echo "=== Framework Comparison ===" && \
for f in Next.js Nuxt SvelteKit; do
  size=$(cat metrics/$f-playwright.json | jq '.results[0].jsTransferred.median')
  echo "$f home page JS: $size bytes"
done
```

### Calculate JS/CSS Ratio

```bash
cat metrics/Next.js-playwright.json | jq '.results[] | {
  page,
  jsRatio: .jsToTotalRatio,
  jsSize: (.jsTransferred.median / 1024),
  cssSize: (.cssTransferred.median / 1024),
  totalSize: (.totalTransferred.median / 1024)
}'
```

### Find Slowest Metric

```bash
cat metrics/Next.js-playwright.json | jq '.results[0] | to_entries | max_by(.value.median | values) | {metric: .key, median: .value.median}'
```

## Scripting Patterns

### Redirect Output to File

```bash
tsx measure.ts --url http://localhost:3000 --runs 5 > results.json 2> measurement.log
```

### Append to Existing Results

```bash
# First run
tsx measure.ts --url http://localhost:3000 --name "Next.js-run1" --runs 5

# Later, different conditions
tsx measure.ts --url http://localhost:3000 --name "Next.js-run2" --network 3g --runs 5

# Both in metrics/ folder for comparison
```

### Conditional Execution

```bash
# Only measure if URL is accessible
if curl -s --head http://localhost:3000 > /dev/null; then
  tsx measure.ts --url http://localhost:3000 --runs 5
else
  echo "Server not running"
fi
```

### Measure Only Home Page

```bash
# Modify measure.ts to comment out board page in pages array
# Or parse results to isolate home page metrics:
cat metrics/Next.js-playwright.json | jq '.results[] | select(.page == "home")'
```

## Performance Tuning

### Quick Smoke Test

```bash
tsx measure.ts --url http://localhost:3000 --runs 1
```

~10 seconds, gives basic metrics

### Development Iteration

```bash
tsx measure.ts --url http://localhost:3000 --runs 3
```

~30 seconds, good for iteration

### Detailed Analysis

```bash
tsx measure.ts --url http://localhost:3000 --runs 10
```

~120-180 seconds, most accurate results

### Production Benchmark

```bash
tsx measure.ts --url https://framework.pages.dev --runs 10
```

Full measurement with 4G throttling

## Troubleshooting

### Port Already in Use

```bash
# Check what's running
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Browser Crashes

```bash
# Check available memory
free -h

# Reduce concurrent measurements or run fewer runs
tsx measure.ts --url http://localhost:3000 --runs 3
```

### Inconsistent Results

```bash
# Increase runs for better statistics
tsx measure.ts --url http://localhost:3000 --runs 20

# Check system load
top -b -n 1 | head -n 5
```

### Network Throttling Not Working

```bash
# Verify CDP session is created
# Check browser args in measure.ts
# Ensure Chrome supports the throttling parameters
```
