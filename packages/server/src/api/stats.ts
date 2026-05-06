import { Router } from 'express';
import { getDb } from '../db/database';

export const statsRouter = Router();

statsRouter.get('/', (_req, res) => {
  const db = getDb();

  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM laps)                           AS total_laps,
      (SELECT COUNT(*) FROM laps WHERE valid = 1)           AS valid_laps,
      (SELECT COUNT(*) FROM sessions)                       AS total_sessions,
      (SELECT COUNT(*) FROM drivers)                        AS total_drivers,
      (SELECT COUNT(DISTINCT track) FROM sessions)          AS total_tracks
  `).get() as { total_laps: number; valid_laps: number; total_sessions: number; total_drivers: number; total_tracks: number };

  const fastestLap = db.prepare(`
    SELECT l.lap_time_ms, l.car_model, d.name as driver_name, s.track, l.completed_at
    FROM laps l
    JOIN drivers d ON l.driver_id = d.id
    JOIN sessions s ON l.session_id = s.id
    WHERE l.valid = 1
    ORDER BY l.lap_time_ms ASC
    LIMIT 1
  `).get() as { lap_time_ms: number; car_model: string; driver_name: string; track: string; completed_at: string } | undefined;

  const mostActiveDriver = db.prepare(`
    SELECT d.name, COUNT(l.id) as lap_count,
           COALESCE(p.color, '#cc0000') as color
    FROM drivers d
    JOIN laps l ON l.driver_id = d.id
    LEFT JOIN driver_profiles p ON p.driver_id = d.id
    GROUP BY d.id
    ORDER BY lap_count DESC
    LIMIT 1
  `).get() as { name: string; lap_count: number; color: string } | undefined;

  const mostRacedTrack = db.prepare(`
    SELECT s.track, COUNT(l.id) as lap_count
    FROM sessions s
    JOIN laps l ON l.session_id = s.id
    GROUP BY s.track
    ORDER BY lap_count DESC
    LIMIT 1
  `).get() as { track: string; lap_count: number } | undefined;

  const sessionTypes = db.prepare(`
    SELECT session_type, COUNT(*) as count
    FROM sessions
    GROUP BY session_type
  `).all() as { session_type: string; count: number }[];

  const recentActivity = db.prepare(`
    SELECT DATE(l.completed_at) as day, COUNT(*) as laps
    FROM laps l
    WHERE l.completed_at >= DATE('now', '-30 days')
    GROUP BY day
    ORDER BY day ASC
  `).all() as { day: string; laps: number }[];

  const topDrivers = db.prepare(`
    SELECT d.name,
           COUNT(l.id) as total_laps,
           MIN(CASE WHEN l.valid=1 THEN l.lap_time_ms END) as best_lap_ms,
           COUNT(DISTINCT s.track) as track_count,
           COALESCE(p.color, '#cc0000') as color
    FROM drivers d
    JOIN laps l ON l.driver_id = d.id
    JOIN sessions s ON l.session_id = s.id
    LEFT JOIN driver_profiles p ON p.driver_id = d.id
    GROUP BY d.id
    ORDER BY total_laps DESC
    LIMIT 10
  `).all();

  res.json({
    totals,
    fastestLap,
    mostActiveDriver,
    mostRacedTrack,
    sessionTypes,
    recentActivity,
    topDrivers,
  });
});
