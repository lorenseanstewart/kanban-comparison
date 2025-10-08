import { defineEventHandler } from 'h3';
import { db } from '../../../db/index';
import { tags } from '../../../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async () => {
  return db
    .select({ id: tags.id, name: tags.name, color: tags.color })
    .from(tags)
    .orderBy(asc(tags.name));
});
