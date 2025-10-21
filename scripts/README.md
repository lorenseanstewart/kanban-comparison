# Measurement Scripts

This directory contains the production measurement scripts for comparing framework performance.

## Production Scripts

### measure-single.ts
**Purpose**: Measure a single framework with statistical rigor

**Usage**:
```bash
tsx scripts/measure-single.ts "Framework Name" --runs 5
```

**Features**:
- Multiple runs (default: 5)
- Cache clearing between runs
- Both raw and compressed bundle sizes
- Compression ratio detection
- Statistical summaries (median, std dev, min, max)

**When to use**: Testing individual frameworks, validating builds, debugging measurements

---

### measure-final.ts
**Purpose**: Measure all frameworks and generate comprehensive reports

**Usage**:
```bash
tsx scripts/measure-final.ts --runs 5
# Or: npm run measure:all
```

**Features**:
- Validates all builds before starting
- Measures all frameworks sequentially
- Generates multiple output formats:
  - JSON with full statistics
  - Markdown tables for blog posts
  - Legacy format for compatibility

**When to use**: Final production measurements, generating blog post data

---

### measure-all-lighthouse.ts
**Purpose**: Legacy batch measurement script

**Usage**:
```bash
npm run measure:legacy
```

**Features**:
- Runs all frameworks with 5 runs each
- Older measurement format (compressed size only)
- Useful for comparison with previous results

**When to use**: Validating against historical data, comparison benchmarks

---

## Utilities

### generate-charts.py
**Purpose**: Generate SVG visualizations from measurement data

**Usage**:
```bash
npm run generate:charts
# Or: python3 scripts/generate-charts.py
```

**Features**:
- Reads metrics/final-measurements.json
- Generates 3 SVG files:
  - bundle-size-board.svg (board page comparison)
  - bundle-size-home.svg (home page comparison)
  - bundle-size-comparison.svg (side-by-side view)
- Shows both raw and compressed sizes with compression ratios

**When to use**: After running measurements to create visual charts for blog posts

**Note**: Automatically runs after `npm run measure:all`

---

### reseed-all.sh
**Purpose**: Reset and reseed all framework databases

**Usage**:
```bash
./scripts/reseed-all.sh
```

**When to use**: Before measurements to ensure identical data across all frameworks

---

## Documentation

For detailed operational instructions, see:
- [_loren/PERFORMANCE_METRICS_GUIDE.md](../_loren/PERFORMANCE_METRICS_GUIDE.md) - How to run measurements
- [METHODOLOGY.md](../METHODOLOGY.md) - Why we made methodology choices

## Quick Start

1. **Build all frameworks**:
   ```bash
   npm run build:all
   ```

2. **Run production measurements**:
   ```bash
   npm run measure:all
   ```

3. **View results**:
   ```bash
   cat metrics/final-measurements.md
   ```
