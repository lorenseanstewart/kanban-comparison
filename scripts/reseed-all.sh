#!/bin/bash

# Reseed all framework databases with UUID data

echo "🌱 Reseeding all framework databases..."

FRAMEWORKS=(
  "kanban-nextjs"
  "kanban-nextjs-compiler"
  "kanban-nuxt"
  "kanban-analog"
  "kanban-solidstart"
  "kanban-sveltekit"
  "kanban-qwikcity"
  "kanban-marko"
)

for framework in "${FRAMEWORKS[@]}"; do
  echo ""
  echo "📦 Reseeding $framework..."
  cd "$framework" || exit 1

  # Try different seed commands
  if npm run | grep -q "^  seed$"; then
    npm run seed
  elif npm run | grep -q "^  db:seed$"; then
    npm run db:seed
  else
    echo "⚠️  No seed script found for $framework"
  fi

  cd ..
done

echo ""
echo "✅ All databases reseeded!"
