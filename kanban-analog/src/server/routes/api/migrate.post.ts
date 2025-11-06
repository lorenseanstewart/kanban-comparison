import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'Use drizzle-kit push to run migrations. This endpoint is no longer needed for Postgres.',
  };
});
