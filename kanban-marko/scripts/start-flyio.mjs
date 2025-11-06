import { execSync } from 'child_process';
import { existsSync } from 'fs';

const dbPath = process.env.DB_PATH || '/data/db.sqlite';

console.log('🚀 Starting Kanban Marko on Fly.io...');
console.log(`📁 Database path: ${dbPath}`);

// Check if database exists
if (!existsSync(dbPath)) {
  console.log('📦 Database not found, running migrations...');
  try {
    execSync('tsx scripts/migrate-db.ts', { stdio: 'inherit' });
    console.log('✅ Migrations complete');

    console.log('🌱 Seeding database...');
    execSync('tsx src/db/seed.ts', { stdio: 'inherit' });
    console.log('✅ Seed complete');
  } catch (error) {
    console.error('❌ Migration/seed failed:', error);
  }
} else {
  console.log('✅ Database exists');
}

console.log('🎯 Starting server...');
execSync('node --enable-source-maps ./dist/index.mjs', { stdio: 'inherit' });
