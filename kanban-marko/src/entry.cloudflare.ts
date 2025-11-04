/// <reference types="@cloudflare/workers-types" />
import { fetch as markoFetch } from "@marko/run/router";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets from /assets/* or /public/*
    if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/public/')) {
      // Try to serve from ASSETS first
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          return assetResponse;
        }
      } catch (e) {
        // If ASSETS.fetch fails, continue to Marko router
      }
    }

    const platform = {
      env,
      ctx,
    };

    const response = await markoFetch(request, platform);

    return response || new Response("Not found", { status: 404 });
  },
};
