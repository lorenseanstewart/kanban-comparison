import { defineEventHandler } from 'h3';
import { db } from '../../../db/index';
import { users } from '../../../../../drizzle/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async () => {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.name));
});
