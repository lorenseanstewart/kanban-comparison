FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source and config files (respecting .dockerignore)
COPY . .

# Build the application
RUN npm run build

# Create database directory
RUN mkdir -p /data

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DB_PATH=/data/db.sqlite

# Override default entrypoint and run startup script
ENTRYPOINT []
CMD ["node", "scripts/start-flyio.mjs"]
