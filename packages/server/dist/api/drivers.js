"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driversRouter = void 0;
const express_1 = require("express");
const crypto_1 = require("crypto");
const database_1 = require("../db/database");
exports.driversRouter = (0, express_1.Router)();
function hashPin(pin) {
    return (0, crypto_1.createHash)('sha256').update(`laptracker:${pin}`).digest('hex');
}
exports.driversRouter.get('/', (_req, res) => {
    const db = (0, database_1.getDb)();
    const rows = db.prepare(`
    SELECT d.name,
           COUNT(l.id)                                            AS total_laps,
           SUM(l.valid)                                           AS valid_laps,
           MIN(CASE WHEN l.valid = 1 THEN l.lap_time_ms END)     AS best_lap_ms,
           COUNT(DISTINCT s.track)                                AS track_count,
           COALESCE(p.color,   '#cc0000')          AS color,
           COALESCE(p.tagline, '')                 AS tagline,
           CASE WHEN p.pin_hash != '' AND p.pin_hash IS NOT NULL THEN 1 ELSE 0 END AS claimed
    FROM drivers d
    LEFT JOIN laps l     ON l.driver_id  = d.id
    LEFT JOIN sessions s ON l.session_id = s.id
    LEFT JOIN driver_profiles p ON p.driver_id = d.id
    GROUP BY d.id
    ORDER BY total_laps DESC
  `).all();
    res.json(rows);
});
exports.driversRouter.get('/:name', (req, res) => {
    const db = (0, database_1.getDb)();
    const { name } = req.params;
    const driver = db.prepare(`
    SELECT d.id, d.name,
           COALESCE(p.color,   '#cc0000') AS color,
           COALESCE(p.tagline, '')        AS tagline,
           CASE WHEN p.pin_hash != '' AND p.pin_hash IS NOT NULL THEN 1 ELSE 0 END AS claimed
    FROM drivers d
    LEFT JOIN driver_profiles p ON p.driver_id = d.id
    WHERE d.name = ?
  `).get(name);
    if (!driver)
        return res.status(404).json({ error: 'Driver not found' });
    const stats = db.prepare(`
    SELECT COUNT(l.id)                                        AS total_laps,
           SUM(l.valid)                                       AS valid_laps,
           MIN(CASE WHEN l.valid=1 THEN l.lap_time_ms END)   AS best_lap_ms,
           COUNT(DISTINCT s.track)                            AS track_count
    FROM laps l
    JOIN sessions s ON l.session_id = s.id
    WHERE l.driver_id = ?
  `).get(driver.id);
    const favCar = db.prepare(`
    SELECT car_model, COUNT(*) AS cnt
    FROM laps WHERE driver_id = ?
    GROUP BY car_model ORDER BY cnt DESC LIMIT 1
  `).get(driver.id);
    const trackBests = db.prepare(`
    SELECT s.track, MIN(l.lap_time_ms) AS best_ms, l.car_model
    FROM laps l
    JOIN sessions s ON l.session_id = s.id
    WHERE l.driver_id = ? AND l.valid = 1
    GROUP BY s.track
    ORDER BY best_ms ASC
  `).all(driver.id);
    const recentSessions = db.prepare(`
    SELECT s.id, s.track, s.session_type, s.started_at,
           MIN(CASE WHEN l.valid=1 THEN l.lap_time_ms END) AS best_ms,
           COUNT(l.id) AS lap_count
    FROM sessions s
    JOIN laps l ON l.session_id = s.id
    WHERE l.driver_id = ?
    GROUP BY s.id
    ORDER BY s.started_at DESC
    LIMIT 10
  `).all(driver.id);
    res.json({ ...driver, stats, favCar: favCar?.car_model ?? '', trackBests, recentSessions });
});
// Driver lap history for a specific track — for progression charts
exports.driversRouter.get('/:name/track-history', (req, res) => {
    const db = (0, database_1.getDb)();
    const { name } = req.params;
    const { track } = req.query;
    const driver = db.prepare('SELECT id FROM drivers WHERE name = ?').get(name);
    if (!driver)
        return res.status(404).json({ error: 'Driver not found' });
    const rows = db.prepare(`
    SELECT s.id, s.track, s.session_type, s.started_at,
           MIN(CASE WHEN l.valid = 1 THEN l.lap_time_ms END) AS best_ms,
           (SELECT l2.car_model FROM laps l2
            WHERE l2.session_id = s.id AND l2.driver_id = ? AND l2.valid = 1
            ORDER BY l2.lap_time_ms ASC LIMIT 1) AS best_car,
           COUNT(l.id) AS lap_count
    FROM sessions s
    JOIN laps l ON l.session_id = s.id
    WHERE l.driver_id = ?
    ${track ? 'AND s.track = ?' : ''}
    GROUP BY s.id
    HAVING best_ms IS NOT NULL
    ORDER BY s.started_at ASC
  `).all(...(track ? [driver.id, driver.id, track] : [driver.id, driver.id]));
    res.json(rows);
});
// Claim an unclaimed driver — sets PIN + initial profile
exports.driversRouter.post('/:name/claim', (req, res) => {
    const db = (0, database_1.getDb)();
    const { name } = req.params;
    const { pin, color, tagline } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }
    const driver = db.prepare('SELECT id FROM drivers WHERE name = ?').get(name);
    if (!driver)
        return res.status(404).json({ error: 'Driver not found' });
    // Check if already claimed
    const existing = db.prepare('SELECT pin_hash FROM driver_profiles WHERE driver_id = ?').get(driver.id);
    if (existing?.pin_hash) {
        return res.status(409).json({ error: 'Driver already claimed' });
    }
    db.prepare(`
    INSERT INTO driver_profiles (driver_id, color, tagline, pin_hash) VALUES (?, ?, ?, ?)
    ON CONFLICT(driver_id) DO UPDATE SET
      color    = excluded.color,
      tagline  = excluded.tagline,
      pin_hash = excluded.pin_hash
  `).run(driver.id, color ?? '#cc0000', tagline ?? '', hashPin(pin));
    res.json({ ok: true });
});
// Verify PIN — returns ok:true/false
exports.driversRouter.post('/:name/verify-pin', (req, res) => {
    const db = (0, database_1.getDb)();
    const { name } = req.params;
    const { pin } = req.body;
    if (!pin)
        return res.status(400).json({ error: 'PIN required' });
    const row = db.prepare(`
    SELECT p.pin_hash FROM driver_profiles p
    JOIN drivers d ON p.driver_id = d.id
    WHERE d.name = ?
  `).get(name);
    if (!row?.pin_hash)
        return res.status(404).json({ error: 'Driver not claimed' });
    res.json({ ok: hashPin(pin) === row.pin_hash });
});
// Update profile — requires PIN
exports.driversRouter.put('/:name/profile', (req, res) => {
    const db = (0, database_1.getDb)();
    const { name } = req.params;
    const { pin, color, tagline } = req.body;
    const driver = db.prepare('SELECT id FROM drivers WHERE name = ?').get(name);
    if (!driver)
        return res.status(404).json({ error: 'Driver not found' });
    const existing = db.prepare('SELECT pin_hash FROM driver_profiles WHERE driver_id = ?').get(driver.id);
    // If claimed, require correct PIN
    if (existing?.pin_hash) {
        if (!pin || hashPin(pin) !== existing.pin_hash) {
            return res.status(401).json({ error: 'Incorrect PIN' });
        }
    }
    db.prepare(`
    INSERT INTO driver_profiles (driver_id, color, tagline, pin_hash) VALUES (?, ?, ?, ?)
    ON CONFLICT(driver_id) DO UPDATE SET color = excluded.color, tagline = excluded.tagline
  `).run(driver.id, color ?? '#cc0000', tagline ?? '', existing?.pin_hash ?? '');
    res.json({ ok: true });
});
