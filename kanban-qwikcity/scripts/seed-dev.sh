#!/bin/bash
# Seed the dev server's D1 database
# Run this after starting the dev server with npm run dev

echo "Waiting for dev server to be ready..."
until curl -s http://localhost:8788 > /dev/null 2>&1; do
  sleep 1
done

echo "Running migration..."
curl -X POST http://localhost:8788/api/migrate
echo ""

echo "Seeding database with sample data..."
curl -X POST http://localhost:8788/api/seed
echo ""

echo -e "\nDatabase is ready with sample data!"
echo "Visit http://localhost:8788 to see the app."
