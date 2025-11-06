import { defineEventHandler, createError } from 'h3';
import { getDatabase } from '../../../db/index';
import { users } from '../../../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const db = getDatabase();

  return await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.name));
});
