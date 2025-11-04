import { PageServerLoad } from '@analogjs/router';
import { getDatabase } from '../../server/db/index';
import { boards } from '../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export const load = async ({ event }: PageServerLoad) => {
  // Try different paths for D1 binding (dev vs production)
  const d1 = (event.context.cloudflare?.env?.DB ||
               event.context.DB ||
               (event.context as any).env?.DB) as D1Database | undefined;

  // getDatabase will use better-sqlite3 if d1 is undefined (local dev)
  const db = getDatabase(d1);

  const rows = await db
    .select({
      id: boards.id,
      title: boards.title,
      description: boards.description,
    })
    .from(boards)
    .orderBy(asc(boards.createdAt));

  return { boards: rows };
};
