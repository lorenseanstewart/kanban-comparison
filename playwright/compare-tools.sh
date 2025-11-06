#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage: ./compare-tools.sh <url> [framework-name] [runs]"
    echo ""
    echo "Runs both Lighthouse and Playwright measurements for comparison"
    echo ""
    echo "Examples:"
    echo "  ./compare-tools.sh http://localhost:3000"
    echo "  ./compare-tools.sh https://kanban-nextjs.pages.dev \"Next.js\" 5"
    exit 1
fi

URL="$1"
FRAMEWORK_NAME="${2:-}"
RUNS="${3:-5}"

if [ -z "$FRAMEWORK_NAME" ]; then
    FRAMEWORK_NAME=$(echo "$URL" | sed 's|.*://||' | sed 's|\..*||' | sed 's|kanban-||')
fi

echo "🔍 Running comparison measurements for: $FRAMEWORK_NAME"
echo "URL: $URL"
echo "Runs: $RUNS"
echo ""

ROOT_DIR="$(dirname "$(dirname "$(cd "$(dirname "$0")" && pwd)")")"

echo "📊 Running Lighthouse measurement..."
tsx "$ROOT_DIR/scripts/measure-single.ts" --url "$URL" --name "$FRAMEWORK_NAME" --runs "$RUNS" > /tmp/lighthouse-output.json 2>&1 || true
echo "✅ Lighthouse complete"
echo ""

echo "📊 Running Playwright measurement..."
cd "$ROOT_DIR/playwright"
npx tsx measure.ts --url "$URL" --name "$FRAMEWORK_NAME" --runs "$RUNS" > /tmp/playwright-output.json 2>&1 || true
echo "✅ Playwright complete"
echo ""

echo "📁 Results saved to:"
echo "  Lighthouse: $ROOT_DIR/metrics/${FRAMEWORK_NAME}.json"
echo "  Playwright: $ROOT_DIR/metrics/${FRAMEWORK_NAME}-playwright.json"
echo ""
echo "✨ Comparison complete!"

