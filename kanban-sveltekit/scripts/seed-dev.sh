#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Waiting for dev server to start...${NC}"

# Wait for the dev server to be ready (default wrangler port is 8788)
MAX_ATTEMPTS=30
ATTEMPT=0
while ! curl -s http://localhost:8788 > /dev/null 2>&1; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo -e "${YELLOW}Warning: Dev server not responding after ${MAX_ATTEMPTS} attempts${NC}"
    echo -e "${YELLOW}Make sure to run 'npm run build && npm run dev' first${NC}"
    exit 1
  fi
  sleep 1
  echo -e "${BLUE}Attempt $ATTEMPT/$MAX_ATTEMPTS...${NC}"
done

echo -e "${GREEN}Dev server is ready!${NC}"
echo ""

echo -e "${BLUE}Running database migration...${NC}"
MIGRATE_RESPONSE=$(curl -s -X POST http://localhost:8788/api/migrate)
echo "$MIGRATE_RESPONSE" | jq '.' 2>/dev/null || echo "$MIGRATE_RESPONSE"
echo ""

echo -e "${BLUE}Seeding database...${NC}"
SEED_RESPONSE=$(curl -s -X POST http://localhost:8788/api/seed)
echo "$SEED_RESPONSE" | jq '.' 2>/dev/null || echo "$SEED_RESPONSE"
echo ""

echo -e "${GREEN}Setup complete! Your database is ready.${NC}"
echo -e "${GREEN}Visit http://localhost:8788 to view the app.${NC}"
