import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('Inlining CSS in Next.js build...');

// Find all HTML files in .next/server/app
const serverAppDir = join(root, '.next/server/app');

function inlineCSSInHTML(htmlPath) {
  let html = readFileSync(htmlPath, 'utf-8');

  // Find CSS link tags
  const cssLinkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
  const cssLinks = [...html.matchAll(cssLinkRegex)];

  if (cssLinks.length === 0) return;

  console.log(`  Processing ${htmlPath}...`);

  for (const match of cssLinks) {
    const cssHref = match[1];
    const linkTag = match[0];

    // Resolve CSS file path
    const cssFilePath = join(root, '.next', cssHref);

    try {
      const cssContent = readFileSync(cssFilePath, 'utf-8');

      // Replace link tag with inline style
      html = html.replace(linkTag, `<style>${cssContent}</style>`);

      console.log(`    Inlined ${cssHref} (${Math.round(cssContent.length / 1024)} KB)`);
    } catch (e) {
      console.log(`    ⚠️  Could not inline ${cssHref}`);
    }
  }

  writeFileSync(htmlPath, html);
}

// Process all HTML files recursively
function processDirectory(dir) {
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);

    if (item.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.name.endsWith('.html')) {
      inlineCSSInHTML(fullPath);
    }
  }
}

processDirectory(serverAppDir);

console.log('✓ CSS inlining complete');
