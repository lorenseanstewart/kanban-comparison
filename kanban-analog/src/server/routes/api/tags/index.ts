import { defineEventHandler, createError } from 'h3';
import { getDatabase } from '../../../db/index';
import { tags } from '../../../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const db = getDatabase();

  return await db
    .select({ id: tags.id, name: tags.name, color: tags.color })
    .from(tags)
    .orderBy(asc(tags.name));
});
