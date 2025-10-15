#!/usr/bin/env node
/**
 * Custom server wrapper that adds gzip compression
 * to the Astro standalone server for accurate bundle measurements
 */

import { handler } from './dist/server/entry.mjs';
import compression from 'compression';
import sirv from 'sirv';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4321;
const HOST = process.env.HOST || 'localhost';

// Create compression middleware
const compress = compression();

// Create static file server for client assets
const clientDir = join(__dirname, 'dist/client');
const assets = sirv(clientDir, {
  dev: false,
  etag: true,
});

// Create HTTP server
const server = http.createServer((req, res) => {
  // Apply compression first
  compress(req, res, () => {
    // Try to serve static files first
    assets(req, res, () => {
      // If not a static file, pass to Astro handler
      handler(req, res);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server with gzip compression running at http://${HOST}:${PORT}/`);
});
