import { unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const dbFiles = [
  resolve(projectRoot, 'drizzle/db.sqlite'),
  resolve(projectRoot, 'drizzle/db.sqlite-shm'),
  resolve(projectRoot, 'drizzle/db.sqlite-wal')
];

for (const file of dbFiles) {
  try {
    unlinkSync(file);
    console.log(`Deleted: ${file}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Error deleting ${file}:`, err);
    }
    // ENOENT means file doesn't exist, which is fine
  }
}

console.log('Database reset complete');
