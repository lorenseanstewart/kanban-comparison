# Lighthouse CLI vs Playwright Measurement

## Measurement Approach

### Lighthouse CLI (`scripts/measure-single.ts`)

- Uses Lighthouse's standardized audit framework
- Runs full performance audits through CDP
- Synthesizes multiple metrics into a single "performance score"
- More resource-intensive (includes accessibility, SEO, best practices audits)
- Standardized methodology aligned with web standards
- **Cache Mode**: Cold-load only (new user experience)

### Playwright (`playwright/measure.ts`)

- Direct browser automation with Chrome DevTools Protocol
- Measures actual runtime metrics from browser APIs
- Focuses on performance-specific data
- Lower overhead, faster execution
- More granular resource-level data
- **Cache Modes**: Both cold-load (first visit) and warm-load (repeat visit)

## Metrics Comparison

| Metric                             | Lighthouse                    | Playwright                    | Notes                                  |
| ---------------------------------- | ----------------------------- | ----------------------------- | -------------------------------------- |
| **JS Bundle Size**                 | ✅ Transferred & Uncompressed | ✅ Transferred & Uncompressed | Same data, different collection method |
| **CSS Bundle Size**                | ✅ Included in total          | ✅ Separate JS/CSS tracking   | Playwright separates resources         |
| **FCP (First Contentful Paint)**   | ✅                            | ✅                            | Web Vitals standard, both accurate     |
| **LCP (Largest Contentful Paint)** | ✅                            | ✅                            | Web Vitals standard, both accurate     |
| **CLS (Cumulative Layout Shift)**  | ✅                            | ✅                            | Web Vitals standard, both accurate     |
| **TTI (Time to Interactive)**      | ✅ Calculated                 | ⚠️ Not measured               | Requires additional instrumentation    |
| **Performance Score**              | ✅ Algorithm                  | ❌ Not applicable             | Lighthouse-specific metric             |
| **Script Evaluation Time**         | ✅ Via bootup-time audit      | ✅ Via measure entries        | Playwright more granular               |
| **Per-File Metrics**               | ❌ Not accessible             | ✅ Individual resource data   | Playwright advantage                   |
| **Network Details**                | ✅ Request/response           | ✅ Resource Timing API        | Both comprehensive                     |

## When to Use Each

### Use Lighthouse When You Need:

- Standardized performance scoring
- Accessibility compliance checking
- SEO recommendations
- Best practices validation
- Consistent industry benchmarking
- Compliance with Google Web Vitals

### Use Playwright When You Need:

- Fast iteration during development
- Per-resource performance data
- Lower measurement overhead
- Custom metric collection
- Direct browser automation
- CSS vs JS bundle separation

## Running Both

You can use both tools together for comprehensive analysis:

```bash
tsx scripts/measure-single.ts --url http://localhost:3000 --runs 5

tsx playwright/measure.ts --url http://localhost:3000 --runs 5
```

Compare results:

- Lighthouse for overall performance scoring and web standards compliance
- Playwright for detailed resource-level analysis and optimization targets

## Data Accuracy

Both tools should produce similar measurements for common metrics like:

- Bundle sizes (identical data source)
- Web Vitals (same underlying browser APIs)
- Network timing

Minor differences may occur due to:

- Script evaluation methodology differences
- Outlier handling in statistical analysis
- Timing of collection vs Lighthouse processing
- Browser cache behavior differences

## Recommendations for Your Use Case

Given you're comparing framework performance:

**Phase 1: Detailed Analysis** - Use Playwright

- Understand per-resource costs
- Identify JS vs CSS overhead by framework
- Find optimization opportunities

**Phase 2: Standardized Reporting** - Use Lighthouse

- Report official Web Vitals scores
- Include accessibility/best practices
- Provide web standards compliance data

**Phase 3: Continuous Monitoring** - Use Both

- Lighthouse for standards compliance
- Playwright for regression detection
- Combine for complete picture
