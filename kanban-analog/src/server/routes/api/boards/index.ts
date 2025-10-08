import { defineEventHandler } from 'h3';
import { db } from '../../../db/index';
import { boards } from '../../../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async () => {
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
