import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/drizzle/schema';

/**
 * Database connection using D1 (production) or better-sqlite3 (development)
 *
 * This uses a Proxy pattern to switch between:
 * - D1 Database (Cloudflare) in production when process.env.DB is available
 * - better-sqlite3 (local SQLite) in development
 *
 * The proxy ensures the correct database is used at runtime based on environment.
 *
 * To prevent better-sqlite3 from being bundled in production:
 * - Only import it when D1 is not available
 * - Use dynamic imports for ESM compatibility
 * - Mark as devDependency in package.json
 */

// Initialize local SQLite database for development
let localDb: any = null;
let initPromise: Promise<void> | null = null;

// Only initialize better-sqlite3 when D1 is not available
// This covers both development mode and running scripts directly
if (typeof process.env.DB === 'undefined') {
  initPromise = (async () => {
    try {
      // Dynamic imports for ESM compatibility
      const [
        { drizzle: drizzleSqlite },
        DatabaseModule,
        { migrate },
        { mkdirSync, existsSync },
        { dirname }
      ] = await Promise.all([
        import('drizzle-orm/better-sqlite3'),
        import('better-sqlite3'),
        import('drizzle-orm/better-sqlite3/migrator'),
        import('fs'),
        import('path')
      ]);

      const Database = DatabaseModule.default;
      const dbPath = './drizzle/db.sqlite';

      // Create directory if it doesn't exist
      try {
        mkdirSync(dirname(dbPath), { recursive: true });
      } catch (err) {
        // Directory might already exist, ignore error
      }

      const sqlite = new Database(dbPath);
      sqlite.pragma('journal_mode = WAL');
      sqlite.pragma('busy_timeout = 5000');

      localDb = drizzleSqlite(sqlite, { schema });

      // Auto-migrate on startup if migrations folder exists
      if (existsSync('./drizzle/migrations')) {
        try {
          migrate(localDb, { migrationsFolder: './drizzle/migrations' });
          console.log('✓ Database migrations applied');
        } catch (error) {
          console.warn('Warning: Could not apply migrations:', error);
        }
      }

      console.log('✓ Local database initialized');
    } catch (error) {
      console.error('Could not initialize local database:', error);
    }
  })();
}

// Create a proxy that switches between D1 and local SQLite
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    // Runtime check: use D1 if available, otherwise use local SQLite
    const d1 = process.env.DB as D1Database | undefined;

    if (d1) {
      // Production: use D1
      const instance = drizzle(d1, { schema });
      return (instance as any)[prop];
    }

    if (localDb) {
      // Development: use better-sqlite3
      return (localDb as any)[prop];
    }

    // If initialization is still in progress, throw helpful error
    if (initPromise) {
      throw new Error(
        'Database is still initializing. Please await the initialization or try again in a moment.'
      );
    }

    throw new Error(
      'D1 binding not found and local database unavailable. ' +
      'In development: ensure better-sqlite3 is installed. ' +
      'In production: ensure DB binding is configured in Cloudflare Pages.'
    );
  }
});

// Export initialization promise for scripts that need to wait
export const dbReady = initPromise || Promise.resolve();
