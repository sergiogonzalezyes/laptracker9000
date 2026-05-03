import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) throw new Error('Database not initialized. Call initDb() first.');
  return _db;
}

export function initDb(dbPath: string): DatabaseSync {
  mkdirSync(dirname(dbPath), { recursive: true });
  _db = new DatabaseSync(dbPath);

  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  // node:sqlite doesn't support multi-statement exec directly — split on semicolons
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      _db.exec(stmt + ';');
    } catch (_e) {
      // Ignore "already exists" errors from CREATE TABLE IF NOT EXISTS
    }
  }

  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
