import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const d1 = event.context.cloudflare?.env?.DB as D1Database | undefined;

    if (!d1) {
      throw createError({
        statusCode: 500,
        statusMessage: 'D1 binding not found',
      });
    }

    // Run all schema migrations using D1's batch API
    await d1.batch([
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL
        )
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS boards (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          created_at INTEGER NOT NULL
        )
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS lists (
          id TEXT PRIMARY KEY,
          board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          position INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        )
      `),
      d1.prepare(`CREATE INDEX IF NOT EXISTS lists_board_id_idx ON lists(board_id)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS lists_position_idx ON lists(position)`),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS cards (
          id TEXT PRIMARY KEY,
          list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          position INTEGER NOT NULL,
          completed INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        )
      `),
      d1.prepare(`CREATE INDEX IF NOT EXISTS cards_list_id_idx ON cards(list_id)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS cards_position_idx ON cards(position)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS cards_assignee_id_idx ON cards(assignee_id)`),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS card_tags (
          card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
          tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
          PRIMARY KEY (card_id, tag_id)
        )
      `),
      d1.prepare(`CREATE INDEX IF NOT EXISTS card_tags_card_id_idx ON card_tags(card_id)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS card_tags_tag_id_idx ON card_tags(tag_id)`),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
          text TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `),
      d1.prepare(`CREATE INDEX IF NOT EXISTS comments_card_id_idx ON comments(card_id)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at)`),
    ]);

    return { success: true, message: 'Database schema created successfully' };
  } catch (error: any) {
    console.error('Migration failed:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Migration failed: ' + error.message,
    });
  }
});
