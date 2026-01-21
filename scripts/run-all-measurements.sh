#!/usr/bin/env bash

# Script to run Playwright measurements on all apps
# Runs 3 apps at a time with both 3G and 4G (6 concurrent processes)

set -e

# Define all apps with their URLs (extracted from previous measurements in playwright/metrics/old/)
# Using parallel arrays for better shell compatibility
APP_NAMES=(
  "kanban-analog"
  "kanban-htmx"
  "kanban-marko"
  "kanban-nextjs-cf"
  "kanban-nextjs-vercel"
  "kanban-nuxt"
  "kanban-qwikcity"
  "kanban-solidstart"
  "kanban-sveltekit"
  "kanban-tanstack"
  "kanban-tanstack-solid"
)

APP_URLS=(
  "https://kanban-analog.vercel.app"
  "https://kanban-htmx.vercel.app"
  "https://kanban-marko.pages.dev"
  "https://kanban-nextjs-cf.pages.dev"
  "https://kanban-nextjs-ochre.vercel.app/"
  "https://kanban-nuxt.vercel.app"
  "https://kanban-qwikcity.vercel.app"
  "https://kanban-solidstart.vercel.app"
  "https://kanban-sveltekit.vercel.app"
  "https://kanban-tanstack.pages.dev"
  "https://kanban-tanstack-solid.pages.dev"
)

RUNS=50
PLAYWRIGHT_DIR="playwright"

TOTAL_APPS=${#APP_NAMES[@]}
BATCH_SIZE=3

echo "🚀 Starting measurements for $TOTAL_APPS apps"
echo "📊 Configuration: $RUNS runs per app, 3G + 4G networks"
echo "⚙️  Batch size: $BATCH_SIZE apps at a time (= 6 concurrent processes)"
echo ""

# Process apps in batches
for ((i=0; i<TOTAL_APPS; i+=BATCH_SIZE)); do
  BATCH_NUM=$((i/BATCH_SIZE + 1))
  BATCH_END=$((i + BATCH_SIZE))
  if [ $BATCH_END -gt $TOTAL_APPS ]; then
    BATCH_END=$TOTAL_APPS
  fi

  BATCH_COUNT=$((BATCH_END - i))
  echo "📦 Batch $BATCH_NUM: Processing apps $((i+1))-$BATCH_END"
  echo ""

  # Start all processes in this batch
  PIDS=()

  for ((j=i; j<BATCH_END; j++)); do
    APP_NAME="${APP_NAMES[$j]}"
    APP_URL="${APP_URLS[$j]}"

    echo "  🔷 Starting $APP_NAME (3G & 4G)..."

    # Start 3G measurement in background (output visible in terminal)
    cd "$PLAYWRIGHT_DIR"
    tsx measure.ts --url "$APP_URL" --name "$APP_NAME" --runs "$RUNS" --network cellular3g 2>&1 | sed "s/^/[$APP_NAME-3G] /" &
    PIDS+=($!)
    cd ..

    # Start 4G measurement in background (output visible in terminal)
    cd "$PLAYWRIGHT_DIR"
    tsx measure.ts --url "$APP_URL" --name "$APP_NAME" --runs "$RUNS" --network cellular4g 2>&1 | sed "s/^/[$APP_NAME-4G] /" &
    PIDS+=($!)
    cd ..
  done

  echo ""
  echo "⏳ Waiting for batch $BATCH_NUM to complete ($((BATCH_COUNT * 2)) processes)..."
  echo ""

  # Wait for all processes in this batch
  for pid in "${PIDS[@]}"; do
    wait "$pid"
  done

  echo "✅ Batch $BATCH_NUM complete!"
  echo ""
done

echo ""
echo "🎉 All measurements complete!"
echo "📁 Results saved to: playwright/metrics/"
echo ""
echo "To analyze results, run:"
echo "  tsx scripts/extract-metrics.ts"
