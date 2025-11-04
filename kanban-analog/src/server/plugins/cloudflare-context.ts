/// <reference types="@cloudflare/workers-types" />
import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin((nitroApp) => {
  // Store the cloudflare context from incoming requests
  let cloudflareContext: any = null;

  nitroApp.hooks.hook('request', (event) => {
    // Capture cloudflare context from the initial incoming request
    if (event.context.cloudflare) {
      cloudflareContext = event.context.cloudflare;
    }

    // If this is an internal request without cloudflare context, inject it
    if (!event.context.cloudflare && cloudflareContext) {
      event.context.cloudflare = cloudflareContext;
    }
  });
});
