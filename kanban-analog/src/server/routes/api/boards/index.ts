import { defineEventHandler, createError } from 'h3';
import { getDatabase } from '../../../db/index';
import { boards } from '../../../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const db = getDatabase();

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
