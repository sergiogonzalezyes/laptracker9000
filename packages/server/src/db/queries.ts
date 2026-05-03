import { DatabaseSync } from 'node:sqlite';
import { ParsedSession, ParsedLap } from '../parser/types';

export interface DbSession {
  id: number;
  server_name: string;
  track: string;
  track_config: string;
  session_type: string;
  started_at: string;
  ended_at: string | null;
  source_file: string;
  source_type: string;
}

export interface DbLap {
  id: number;
  session_id: number;
  driver_id: number;
  driver_name: string;
  car_model: string;
  lap_number: number;
  lap_time_ms: number;
  cuts: number;
  valid: number;
  split1_ms: number | null;
  split2_ms: number | null;
  split3_ms: number | null;
  completed_at: string;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function upsertSession(db: DatabaseSync, session: ParsedSession, sourceFile: string, sourceType = 'log'): number {
  const existing = db.prepare('SELECT id FROM sessions WHERE source_file = ?').get(sourceFile) as { id: number } | undefined;
  if (existing) return existing.id;

  const result = db.prepare(`
    INSERT INTO sessions (server_name, track, track_config, session_type, started_at, ended_at, source_file, source_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    session.serverName,
    session.track,
    session.trackConfig,
    session.sessionType,
    session.startedAt.toISOString(),
    session.endedAt?.toISOString() ?? null,
    sourceFile,
    sourceType,
  );
  return Number(result.lastInsertRowid);
}

export function updateSessionEnd(db: DatabaseSync, sessionId: number, endedAt: string): void {
  db.prepare('UPDATE sessions SET ended_at = ? WHERE id = ?').run(endedAt, sessionId);
}

export function getSessions(db: DatabaseSync, opts: {
  limit?: number;
  offset?: number;
  track?: string;
  serverName?: string;
  sessionType?: string;
} = {}): { sessions: DbSession[]; total: number } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (opts.track) { conditions.push('track = ?'); params.push(opts.track); }
  if (opts.serverName) { conditions.push('server_name = ?'); params.push(opts.serverName); }
  if (opts.sessionType) { conditions.push('session_type = ?'); params.push(opts.sessionType); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const total = (db.prepare(`SELECT COUNT(*) as c FROM sessions ${where}`).get(...params) as { c: number }).c;
  const sessions = db.prepare(`
    SELECT * FROM sessions ${where} ORDER BY started_at DESC LIMIT ? OFFSET ?
  `).all(...params, opts.limit ?? 20, opts.offset ?? 0) as DbSession[];

  return { sessions, total };
}

export function getSessionById(db: DatabaseSync, id: number): DbSession | undefined {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as DbSession | undefined;
}

// ── Drivers ───────────────────────────────────────────────────────────────────

export function upsertDriver(db: DatabaseSync, name: string, guid = ''): number {
  const existing = db.prepare('SELECT id FROM drivers WHERE name = ?').get(name) as { id: number } | undefined;
  if (existing) {
    if (guid) db.prepare('UPDATE drivers SET steam_guid = ? WHERE id = ? AND steam_guid = ""').run(guid, existing.id);
    return existing.id;
  }
  const result = db.prepare('INSERT INTO drivers (name, steam_guid) VALUES (?, ?)').run(name, guid);
  return Number(result.lastInsertRowid);
}

// ── Laps ──────────────────────────────────────────────────────────────────────

export function insertLap(db: DatabaseSync, sessionId: number, driverId: number, lap: ParsedLap): number {
  const result = db.prepare(`
    INSERT INTO laps (session_id, driver_id, car_model, lap_number, lap_time_ms, cuts, valid, split1_ms, split2_ms, split3_ms, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    driverId,
    lap.carModel,
    lap.lapNumber,
    lap.lapTimeMs,
    lap.cuts,
    lap.valid ? 1 : 0,
    lap.split1Ms ?? null,
    lap.split2Ms ?? null,
    lap.split3Ms ?? null,
    lap.completedAt.toISOString(),
  );
  return Number(result.lastInsertRowid);
}

export function getLapsBySession(db: DatabaseSync, sessionId: number): DbLap[] {
  return db.prepare(`
    SELECT l.*, d.name as driver_name
    FROM laps l JOIN drivers d ON l.driver_id = d.id
    WHERE l.session_id = ?
    ORDER BY l.completed_at ASC
  `).all(sessionId) as DbLap[];
}

export function getRecentLaps(db: DatabaseSync, limit = 50): (DbLap & { track: string; server_name: string })[] {
  return db.prepare(`
    SELECT l.*, d.name as driver_name, s.track, s.server_name
    FROM laps l
    JOIN drivers d ON l.driver_id = d.id
    JOIN sessions s ON l.session_id = s.id
    ORDER BY l.completed_at DESC
    LIMIT ?
  `).all(limit) as (DbLap & { track: string; server_name: string })[];
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export function getLeaderboard(db: DatabaseSync, opts: {
  track?: string;
  sessionType?: string;
  validOnly?: boolean;
}): { driver_name: string; car_model: string; lap_time_ms: number; split1_ms: number | null; split2_ms: number | null; session_id: number; completed_at: string }[] {
  const conditions: string[] = ['l.valid = 1'];
  const params: unknown[] = [];

  if (opts.track) { conditions.push('s.track = ?'); params.push(opts.track); }
  if (opts.sessionType) { conditions.push('s.session_type = ?'); params.push(opts.sessionType); }

  const where = 'WHERE ' + conditions.join(' AND ');
  return db.prepare(`
    SELECT d.name as driver_name, l.car_model, MIN(l.lap_time_ms) as lap_time_ms,
           l.split1_ms, l.split2_ms, l.session_id, l.completed_at
    FROM laps l
    JOIN drivers d ON l.driver_id = d.id
    JOIN sessions s ON l.session_id = s.id
    ${where}
    GROUP BY l.driver_id, s.track
    ORDER BY lap_time_ms ASC
  `).all(...params) as { driver_name: string; car_model: string; lap_time_ms: number; split1_ms: number | null; split2_ms: number | null; session_id: number; completed_at: string }[];
}

export function getLeaderboardTracks(db: DatabaseSync): { track: string; track_config: string; lap_count: number; fastest_ms: number; fastest_driver: string }[] {
  return db.prepare(`
    SELECT s.track, s.track_config,
           COUNT(l.id) as lap_count,
           MIN(CASE WHEN l.valid = 1 THEN l.lap_time_ms END) as fastest_ms,
           (SELECT d2.name FROM laps l2 JOIN drivers d2 ON l2.driver_id = d2.id
            JOIN sessions s2 ON l2.session_id = s2.id
            WHERE s2.track = s.track AND l2.valid = 1
            ORDER BY l2.lap_time_ms ASC LIMIT 1) as fastest_driver
    FROM sessions s
    JOIN laps l ON l.session_id = s.id
    GROUP BY s.track
    ORDER BY lap_count DESC
  `).all() as { track: string; track_config: string; lap_count: number; fastest_ms: number; fastest_driver: string }[];
}

export function getDriverStats(db: DatabaseSync): { driver_name: string; total_laps: number; valid_laps: number; best_lap_ms: number | null; track_count: number }[] {
  return db.prepare(`
    SELECT d.name as driver_name,
           COUNT(l.id) as total_laps,
           SUM(l.valid) as valid_laps,
           MIN(CASE WHEN l.valid = 1 THEN l.lap_time_ms END) as best_lap_ms,
           COUNT(DISTINCT s.track) as track_count
    FROM drivers d
    JOIN laps l ON l.driver_id = d.id
    JOIN sessions s ON l.session_id = s.id
    GROUP BY d.id
    ORDER BY total_laps DESC
  `).all() as { driver_name: string; total_laps: number; valid_laps: number; best_lap_ms: number | null; track_count: number }[];
}

// ── Ingest tracking ───────────────────────────────────────────────────────────

export function markFileIngested(db: DatabaseSync, filePath: string, lineCount: number): void {
  db.prepare(`
    INSERT OR REPLACE INTO ingested_files (file_path, ingested_at, line_count)
    VALUES (?, ?, ?)
  `).run(filePath, new Date().toISOString(), lineCount);
}

export function isFileIngested(db: DatabaseSync, filePath: string): boolean {
  const row = db.prepare('SELECT 1 FROM ingested_files WHERE file_path = ?').get(filePath);
  return !!row;
}

// ── Bulk ingest (used for backfill) ───────────────────────────────────────────

export function ingestParsedSession(
  db: DatabaseSync,
  session: ParsedSession,
  sourceFile: string,
  sourceType = 'log',
): number {
  const sessionId = upsertSession(db, session, sourceFile, sourceType);
  for (const lap of session.laps) {
    const driverId = upsertDriver(db, lap.driverName);
    insertLap(db, sessionId, driverId, lap);
  }
  return sessionId;
}
