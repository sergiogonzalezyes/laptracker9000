import { Router } from 'express';
import { getDb } from '../db/database';

export const driversRouter = Router();

driversRouter.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT d.name,
           COUNT(l.id)                                            AS total_laps,
           SUM(l.valid)                                           AS valid_laps,
           MIN(CASE WHEN l.valid = 1 THEN l.lap_time_ms END)     AS best_lap_ms,
           COUNT(DISTINCT s.track)                                AS track_count,
           COALESCE(p.color,   '#cc0000') AS color,
           COALESCE(p.tagline, '')        AS tagline
    FROM drivers d
    LEFT JOIN laps l     ON l.driver_id  = d.id
    LEFT JOIN sessions s ON l.session_id = s.id
    LEFT JOIN driver_profiles p ON p.driver_id = d.id
    GROUP BY d.id
    ORDER BY total_laps DESC
  `).all();
  res.json(rows);
});

driversRouter.get('/:name', (req, res) => {
  const db = getDb();
  const { name } = req.params;

  const driver = db.prepare(`
    SELECT d.id, d.name,
           COALESCE(p.color,   '#cc0000') AS color,
           COALESCE(p.tagline, '')        AS tagline
    FROM drivers d
    LEFT JOIN driver_profiles p ON p.driver_id = d.id
    WHERE d.name = ?
  `).get(name) as { id: number; name: string; color: string; tagline: string } | undefined;

  if (!driver) return res.status(404).json({ error: 'Driver not found' });

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
  `).get(driver.id) as { car_model: string } | undefined;

  const trackBests = db.prepare(`
    SELECT s.track,
           MIN(l.lap_time_ms) AS best_ms,
           l.car_model
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

driversRouter.put('/:name/profile', (req, res) => {
  const db = getDb();
  const { name } = req.params;
  const { color, tagline } = req.body as { color?: string; tagline?: string };

  const driver = db.prepare('SELECT id FROM drivers WHERE name = ?').get(name) as { id: number } | undefined;
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  db.prepare(`
    INSERT INTO driver_profiles (driver_id, color, tagline) VALUES (?, ?, ?)
    ON CONFLICT(driver_id) DO UPDATE SET color = excluded.color, tagline = excluded.tagline
  `).run(driver.id, color ?? '#cc0000', tagline ?? '');

  res.json({ ok: true });
});
