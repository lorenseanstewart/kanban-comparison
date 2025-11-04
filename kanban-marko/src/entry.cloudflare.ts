/// <reference types="@cloudflare/workers-types" />
import { fetch as markoFetch } from "@marko/run/router";

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const platform = {
      env,
      ctx,
    };

    const response = await markoFetch(request, platform);

    return response || new Response("Not found", { status: 404 });
  },
};
