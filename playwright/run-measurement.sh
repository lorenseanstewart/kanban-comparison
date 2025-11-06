#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage: ./run-measurement.sh <url> [framework-name] [runs] [network-condition]"
    echo ""
    echo "Examples:"
    echo "  ./run-measurement.sh http://localhost:3000"
    echo "  ./run-measurement.sh https://kanban-nextjs.pages.dev \"Next.js\" 10 4g"
    echo "  ./run-measurement.sh http://localhost:3001 \"Framework\" 5 3g"
    echo ""
    echo "Network conditions: 4g (default), 3g, slow-3g"
    exit 1
fi

URL="$1"
FRAMEWORK_NAME="${2:-}"
RUNS="${3:-10}"
NETWORK="${4:-4g}"

if [ -z "$FRAMEWORK_NAME" ]; then
    FRAMEWORK_NAME=$(echo "$URL" | sed 's|.*://||' | sed 's|\..*||')
fi

cd "$(dirname "$0")"

npx tsx measure.ts --url "$URL" --name "$FRAMEWORK_NAME" --runs "$RUNS" --network "$NETWORK"

