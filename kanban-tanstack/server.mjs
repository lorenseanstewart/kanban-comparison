import { createServer } from 'node:http';
import { readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import serverHandler from './dist/server/server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3008;

const MIME_TYPES = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
};

const COMPRESSIBLE_TYPES = ['.js', '.css', '.json', '.webmanifest'];

async function serveStaticFile(filePath, res, acceptEncoding) {
  try {
    await access(filePath);
    const content = await readFile(filePath);
    const ext = filePath.substring(filePath.lastIndexOf('.'));
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);

    // Check if we should compress
    const shouldCompress = COMPRESSIBLE_TYPES.includes(ext) &&
                          acceptEncoding?.includes('gzip') &&
                          content.length > 1024; // Only compress files > 1KB

    if (shouldCompress) {
      res.setHeader('Content-Encoding', 'gzip');
      const readable = Readable.from(content);
      const gzip = createGzip();
      await pipeline(readable, gzip, res);
    } else {
      res.end(content);
    }
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Try to serve static files from dist/client first
    const staticPath = join(__dirname, 'dist/client', url.pathname);
    const acceptEncoding = req.headers['accept-encoding'];
    if (await serveStaticFile(staticPath, res, acceptEncoding)) {
      return;
    }

    // Create a Web API Request from Node request
    const requestInit = {
      method: req.method,
      headers: req.headers,
    };

    // Add body and duplex option for methods that support body
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      requestInit.body = req;
      requestInit.duplex = 'half';
    }

    const request = new Request(url, requestInit);

    // Call the TanStack Start handler
    const response = await serverHandler.fetch(request);

    // Convert Web API Response to Node response
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
