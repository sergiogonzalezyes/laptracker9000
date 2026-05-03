"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertSession = upsertSession;
exports.updateSessionEnd = updateSessionEnd;
exports.getSessions = getSessions;
exports.getSessionById = getSessionById;
exports.upsertDriver = upsertDriver;
exports.insertLap = insertLap;
exports.getLapsBySession = getLapsBySession;
exports.getRecentLaps = getRecentLaps;
exports.getLeaderboard = getLeaderboard;
exports.getLeaderboardTracks = getLeaderboardTracks;
exports.getDriverStats = getDriverStats;
exports.markFileIngested = markFileIngested;
exports.isFileIngested = isFileIngested;
exports.ingestParsedSession = ingestParsedSession;
// ── Sessions ──────────────────────────────────────────────────────────────────
function upsertSession(db, session, sourceFile, sourceType = 'log') {
    const existing = db.prepare('SELECT id FROM sessions WHERE source_file = ?').get(sourceFile);
    if (existing)
        return existing.id;
    const result = db.prepare(`
    INSERT INTO sessions (server_name, track, track_config, session_type, started_at, ended_at, source_file, source_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(session.serverName, session.track, session.trackConfig, session.sessionType, session.startedAt.toISOString(), session.endedAt?.toISOString() ?? null, sourceFile, sourceType);
    return Number(result.lastInsertRowid);
}
function updateSessionEnd(db, sessionId, endedAt) {
    db.prepare('UPDATE sessions SET ended_at = ? WHERE id = ?').run(endedAt, sessionId);
}
function getSessions(db, opts = {}) {
    const conditions = [];
    const params = [];
    if (opts.track) {
        conditions.push('track = ?');
        params.push(opts.track);
    }
    if (opts.serverName) {
        conditions.push('server_name = ?');
        params.push(opts.serverName);
    }
    if (opts.sessionType) {
        conditions.push('session_type = ?');
        params.push(opts.sessionType);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const total = db.prepare(`SELECT COUNT(*) as c FROM sessions ${where}`).get(...params).c;
    const sessions = db.prepare(`
    SELECT * FROM sessions ${where} ORDER BY started_at DESC LIMIT ? OFFSET ?
  `).all(...params, opts.limit ?? 20, opts.offset ?? 0);
    return { sessions, total };
}
function getSessionById(db, id) {
    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
}
// ── Drivers ───────────────────────────────────────────────────────────────────
function upsertDriver(db, name, guid = '') {
    const existing = db.prepare('SELECT id FROM drivers WHERE name = ?').get(name);
    if (existing) {
        if (guid)
            db.prepare('UPDATE drivers SET steam_guid = ? WHERE id = ? AND steam_guid = ""').run(guid, existing.id);
        return existing.id;
    }
    const result = db.prepare('INSERT INTO drivers (name, steam_guid) VALUES (?, ?)').run(name, guid);
    return Number(result.lastInsertRowid);
}
// ── Laps ──────────────────────────────────────────────────────────────────────
function insertLap(db, sessionId, driverId, lap) {
    const result = db.prepare(`
    INSERT INTO laps (session_id, driver_id, car_model, lap_number, lap_time_ms, cuts, valid, split1_ms, split2_ms, split3_ms, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, driverId, lap.carModel, lap.lapNumber, lap.lapTimeMs, lap.cuts, lap.valid ? 1 : 0, lap.split1Ms ?? null, lap.split2Ms ?? null, lap.split3Ms ?? null, lap.completedAt.toISOString());
    return Number(result.lastInsertRowid);
}
function getLapsBySession(db, sessionId) {
    return db.prepare(`
    SELECT l.*, d.name as driver_name
    FROM laps l JOIN drivers d ON l.driver_id = d.id
    WHERE l.session_id = ?
    ORDER BY l.completed_at ASC
  `).all(sessionId);
}
function getRecentLaps(db, limit = 50) {
    return db.prepare(`
    SELECT l.*, d.name as driver_name, s.track, s.server_name
    FROM laps l
    JOIN drivers d ON l.driver_id = d.id
    JOIN sessions s ON l.session_id = s.id
    ORDER BY l.completed_at DESC
    LIMIT ?
  `).all(limit);
}
// ── Leaderboard ───────────────────────────────────────────────────────────────
function getLeaderboard(db, opts) {
    const conditions = ['l.valid = 1'];
    const params = [];
    if (opts.track) {
        conditions.push('s.track = ?');
        params.push(opts.track);
    }
    if (opts.sessionType) {
        conditions.push('s.session_type = ?');
        params.push(opts.sessionType);
    }
    const where = 'WHERE ' + conditions.join(' AND ');
    return db.prepare(`
    SELECT d.name as driver_name, l.car_model, MIN(l.lap_time_ms) as lap_time_ms,
           l.split1_ms, l.split2_ms, l.split3_ms, l.session_id, l.completed_at
    FROM laps l
    JOIN drivers d ON l.driver_id = d.id
    JOIN sessions s ON l.session_id = s.id
    ${where}
    GROUP BY l.driver_id, s.track
    ORDER BY lap_time_ms ASC
  `).all(...params);
}
function getLeaderboardTracks(db) {
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
  `).all();
}
function getDriverStats(db) {
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
  `).all();
}
// ── Ingest tracking ───────────────────────────────────────────────────────────
function markFileIngested(db, filePath, lineCount) {
    db.prepare(`
    INSERT OR REPLACE INTO ingested_files (file_path, ingested_at, line_count)
    VALUES (?, ?, ?)
  `).run(filePath, new Date().toISOString(), lineCount);
}
function isFileIngested(db, filePath) {
    const row = db.prepare('SELECT 1 FROM ingested_files WHERE file_path = ?').get(filePath);
    return !!row;
}
// ── Bulk ingest (used for backfill) ───────────────────────────────────────────
function ingestParsedSession(db, session, sourceFile, sourceType = 'log') {
    const sessionId = upsertSession(db, session, sourceFile, sourceType);
    for (const lap of session.laps) {
        const driverId = upsertDriver(db, lap.driverName);
        insertLap(db, sessionId, driverId, lap);
    }
    return sessionId;
}
