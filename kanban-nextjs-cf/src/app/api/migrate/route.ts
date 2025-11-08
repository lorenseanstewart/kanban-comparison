import { NextResponse } from 'next/server';

/**
 * Migration endpoint for Cloudflare D1
 *
 * For D1 databases, migrations are managed via Wrangler CLI:
 * - Local: npm run db:migrate:local
 * - Remote: npm run db:migrate:remote
 *
 * For local development with better-sqlite3, migrations are applied
 * automatically on database initialization in src/lib/db.ts
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Not supported',
      message: 'D1 migrations must be applied via Wrangler CLI. Use: npm run db:migrate:local or npm run db:migrate:remote',
    },
    { status: 501 }
  );
}
