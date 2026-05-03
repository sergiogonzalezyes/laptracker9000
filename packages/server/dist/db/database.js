"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.initDb = initDb;
exports.closeDb = closeDb;
const node_sqlite_1 = require("node:sqlite");
const fs_1 = require("fs");
const path_1 = require("path");
let _db = null;
function getDb() {
    if (!_db)
        throw new Error('Database not initialized. Call initDb() first.');
    return _db;
}
function initDb(dbPath) {
    (0, fs_1.mkdirSync)((0, path_1.dirname)(dbPath), { recursive: true });
    _db = new node_sqlite_1.DatabaseSync(dbPath);
    const schema = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, 'schema.sql'), 'utf8');
    // node:sqlite doesn't support multi-statement exec directly — split on semicolons
    const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
    for (const stmt of statements) {
        try {
            _db.exec(stmt + ';');
        }
        catch (_e) {
            // Ignore "already exists" errors from CREATE TABLE IF NOT EXISTS
        }
    }
    // Migrations: add columns that may not exist in older DBs
    const migrations = [
        `ALTER TABLE driver_profiles ADD COLUMN pin_hash TEXT NOT NULL DEFAULT ''`,
    ];
    for (const m of migrations) {
        try {
            _db.exec(m + ';');
        }
        catch { /* column already exists */ }
    }
    return _db;
}
function closeDb() {
    if (_db) {
        _db.close();
        _db = null;
    }
}
