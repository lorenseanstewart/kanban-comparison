#!/usr/bin/env tsx
import { chromium } from "playwright";

async function inspectBundle(url: string) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send("Network.enable");
  
  const resources: Array<{ url: string; type: string; size: number }> = [];
  
  cdpSession.on("Network.responseReceived", (params: any) => {
    const response = params.response;
    if (response.url && (response.url.includes('.js') || response.url.includes('.css'))) {
      resources.push({
        url: response.url,
        type: response.mimeType || 'unknown',
        size: 0, // Will be updated in loadingFinished
      });
    }
  });
  
  cdpSession.on("Network.loadingFinished", (params: any) => {
    const resource = resources.find(r => r.size === 0);
    if (resource && params.encodedDataLength) {
      resource.size = params.encodedDataLength;
    }
  });
  
  console.log(`\nInspecting: ${url}\n`);
  await page.goto(url, { waitUntil: "networkidle" });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("\n📦 JavaScript Files:");
  const jsFiles = resources.filter(r => r.url.includes('.js'));
  let totalJS = 0;
  jsFiles.forEach(f => {
    console.log(`  ${f.size} bytes - ${f.url.split('/').pop()}`);
    totalJS += f.size;
  });
  console.log(`  TOTAL JS: ${(totalJS / 1024).toFixed(1)}kB`);
  
  console.log("\n🎨 CSS Files:");
  const cssFiles = resources.filter(r => r.url.includes('.css'));
  let totalCSS = 0;
  cssFiles.forEach(f => {
    console.log(`  ${f.size} bytes - ${f.url.split('/').pop()}`);
    totalCSS += f.size;
  });
  console.log(`  TOTAL CSS: ${(totalCSS / 1024).toFixed(1)}kB`);
  
  console.log(`\n📊 TOTAL BUNDLE: ${((totalJS + totalCSS) / 1024).toFixed(1)}kB\n`);
  
  await browser.close();
}

const url = process.argv[2] || "https://kanban-marko.vercel.app";
inspectBundle(url);
