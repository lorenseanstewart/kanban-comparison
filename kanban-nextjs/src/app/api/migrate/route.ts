import { NextResponse } from 'next/server';
import { db } from '@/lib/db';


// Apply database schema migrations
export async function POST() {
  try {
    // @ts-ignore - Cloudflare Pages env binding
    const d1 = process.env.DB as D1Database | undefined;

    if (!d1) {
      return NextResponse.json(
        { error: 'D1 binding not found' },
        { status: 500 }
      );
    }

    console.log('[Migrate] Applying schema...');

    // Apply migrations using D1 batch API
    await d1.batch([
      d1.prepare(`CREATE TABLE IF NOT EXISTS "users" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL)`),

      d1.prepare(`CREATE TABLE IF NOT EXISTS "boards" ("id" text PRIMARY KEY NOT NULL, "title" text NOT NULL, "description" text, "created_at" integer DEFAULT (unixepoch() * 1000) NOT NULL)`),

      d1.prepare(`CREATE TABLE IF NOT EXISTS "lists" ("id" text PRIMARY KEY NOT NULL, "board_id" text NOT NULL, "title" text NOT NULL, "position" integer NOT NULL, "created_at" integer DEFAULT (unixepoch() * 1000) NOT NULL, FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON UPDATE no action ON DELETE cascade)`),

      d1.prepare(`CREATE TABLE IF NOT EXISTS "cards" ("id" text PRIMARY KEY NOT NULL, "list_id" text NOT NULL, "title" text NOT NULL, "description" text, "assignee_id" text, "position" integer NOT NULL, "completed" integer DEFAULT 0 NOT NULL, "created_at" integer DEFAULT (unixepoch() * 1000) NOT NULL, FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON UPDATE no action ON DELETE cascade, FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE set null)`),

      d1.prepare(`CREATE TABLE IF NOT EXISTS "tags" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "color" text NOT NULL, "created_at" integer DEFAULT (unixepoch() * 1000) NOT NULL)`),

      d1.prepare(`CREATE TABLE IF NOT EXISTS "card_tags" ("card_id" text NOT NULL, "tag_id" text NOT NULL, PRIMARY KEY("card_id","tag_id"), FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON UPDATE no action ON DELETE cascade, FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON UPDATE no action ON DELETE cascade)`),

      d1.prepare(`CREATE TABLE IF NOT EXISTS "comments" ("id" text PRIMARY KEY NOT NULL, "card_id" text NOT NULL, "user_id" text NOT NULL, "text" text NOT NULL, "created_at" integer DEFAULT (unixepoch() * 1000) NOT NULL, FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON UPDATE no action ON DELETE cascade, FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE set null)`),
    ]);

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
