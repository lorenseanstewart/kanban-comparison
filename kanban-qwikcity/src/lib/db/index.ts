/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';

export function getDatabase(d1Binding: D1Database) {
  return drizzle(d1Binding);
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    // @ts-ignore - Cloudflare Pages provides DB binding via process.env
    const d1 = process.env.DB as D1Database | undefined;

    if (!d1) {
      throw new Error(
        'D1 binding not found. ' +
        'Local dev: Use `npm run dev` which runs wrangler with --d1 flag. ' +
        'Production: Ensure DB is bound in Cloudflare Pages settings.'
      );
    }

    const instance = getDatabase(d1);
    return (instance as any)[prop];
  }
});
