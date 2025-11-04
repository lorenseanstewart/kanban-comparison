import { defineEventHandler, createError } from 'h3';
import { getDatabase } from '../../../db/index';
import { users } from '../../../../../drizzle/schema';
import { asc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export default defineEventHandler(async (event) => {
  const d1 = event.context.cloudflare?.env?.DB as D1Database | undefined;

  if (!d1) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 binding not found',
    });
  }

  const db = getDatabase(d1);

  return await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.name));
});
