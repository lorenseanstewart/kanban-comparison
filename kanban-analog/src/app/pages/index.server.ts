import { PageServerLoad } from '@analogjs/router';
import { getDatabase } from '../../server/db/index';
import { boards } from '../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export const load = async ({ event }: PageServerLoad) => {
  // Try different paths for D1 binding (dev vs production)
  const d1 = (event.context.cloudflare?.env?.DB ||
               event.context.DB ||
               (event.context as any).env?.DB) as D1Database | undefined;

  if (!d1) {
    console.error('D1 binding not found. Available context:', Object.keys(event.context));
    throw new Error('D1 binding not found');
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

  return { boards: rows };
};
