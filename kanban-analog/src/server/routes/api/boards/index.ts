import { defineEventHandler, createError } from 'h3';
import { getDatabase } from '../../../db/index';
import { boards } from '../../../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  // Try different paths for D1 binding (dev vs production)
  const d1 = (event.context.cloudflare?.env?.DB ||
               event.context.DB ||
               (event.context as any).env?.DB) as D1Database | undefined;

  if (!d1) {
    console.error('D1 binding not found. Available context:', Object.keys(event.context));
    console.error('Context values:', event.context);
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 binding not found',
    });
  }

  const db = getDatabase(d1);

  const rows = await db
    .select({
      id: boards.id,
      title: boards.title,
      description: boards.description,
    })
    .from(boards)
    .orderBy(asc(boards.createdAt));

  return rows;
});
