import { PageServerLoad } from '@analogjs/router';
import { db } from '../../server/db/index';
import { boards } from '../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export const load = async () => {
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
