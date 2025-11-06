#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Try common Vite dev server ports
PORTS=(5173 5174 5175)
DEV_PORT=""

echo -e "${BLUE}Waiting for dev server to start...${NC}"

# Find which port the dev server is running on
MAX_ATTEMPTS=30
ATTEMPT=0
while [ -z "$DEV_PORT" ] && [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  for PORT in "${PORTS[@]}"; do
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
      DEV_PORT=$PORT
      break
    fi
  done

  if [ -z "$DEV_PORT" ]; then
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
      echo -e "${YELLOW}Warning: Dev server not responding after ${MAX_ATTEMPTS} attempts${NC}"
      echo -e "${YELLOW}Make sure to run 'npm run dev' first${NC}"
      exit 1
    fi
    sleep 1
    echo -e "${BLUE}Attempt $ATTEMPT/$MAX_ATTEMPTS...${NC}"
  fi
done

echo -e "${GREEN}Dev server is ready on port $DEV_PORT!${NC}"
echo ""

echo -e "${BLUE}Running database migration...${NC}"
MIGRATE_RESPONSE=$(curl -s -X POST http://localhost:$DEV_PORT/api/migrate)
echo "$MIGRATE_RESPONSE" | jq '.' 2>/dev/null || echo "$MIGRATE_RESPONSE"
echo ""

echo -e "${BLUE}Seeding database...${NC}"
SEED_RESPONSE=$(curl -s -X POST http://localhost:$DEV_PORT/api/seed)
echo "$SEED_RESPONSE" | jq '.' 2>/dev/null || echo "$SEED_RESPONSE"
echo ""

echo -e "${GREEN}Setup complete! Your database is ready.${NC}"
echo -e "${GREEN}Visit http://localhost:$DEV_PORT to view the app.${NC}"
