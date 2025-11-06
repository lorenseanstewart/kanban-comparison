import { NextResponse } from 'next/server';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '@/lib/db';

export async function POST() {
  try {
    console.log('[Migrate] Applying schema...');

    await migrate(db, { migrationsFolder: 'drizzle/migrations' });

    console.log('[Migrate] Schema applied successfully');

    return NextResponse.json({
      success: true,
      message: 'Database schema applied successfully',
    });
  } catch (error) {
    console.error('[Migrate] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply schema',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
