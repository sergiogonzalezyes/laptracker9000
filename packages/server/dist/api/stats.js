"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRouter = void 0;
const express_1 = require("express");
const database_1 = require("../db/database");
exports.statsRouter = (0, express_1.Router)();
exports.statsRouter.get('/', (_req, res) => {
    const db = (0, database_1.getDb)();
    const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM laps)                           AS total_laps,
      (SELECT COUNT(*) FROM laps WHERE valid = 1)           AS valid_laps,
      (SELECT COUNT(*) FROM sessions)                       AS total_sessions,
      (SELECT COUNT(*) FROM drivers)                        AS total_drivers,
      (SELECT COUNT(DISTINCT track) FROM sessions)          AS total_tracks
  `).get();
    const fastestLap = db.prepare(`
    SELECT l.lap_time_ms, l.car_model, d.name as driver_name, s.track, l.completed_at
    FROM laps l
    JOIN drivers d ON l.driver_id = d.id
    JOIN sessions s ON l.session_id = s.id
    WHERE l.valid = 1
    ORDER BY l.lap_time_ms ASC
    LIMIT 1
  `).get();
    const mostActiveDriver = db.prepare(`
    SELECT d.name, COUNT(l.id) as lap_count,
           COALESCE(p.color, '#cc0000') as color
    FROM drivers d
    JOIN laps l ON l.driver_id = d.id
    LEFT JOIN driver_profiles p ON p.driver_id = d.id
    GROUP BY d.id
    ORDER BY lap_count DESC
    LIMIT 1
  `).get();
    const mostRacedTrack = db.prepare(`
    SELECT s.track, COUNT(l.id) as lap_count
    FROM sessions s
    JOIN laps l ON l.session_id = s.id
    GROUP BY s.track
    ORDER BY lap_count DESC
    LIMIT 1
  `).get();
    const sessionTypes = db.prepare(`
    SELECT session_type, COUNT(*) as count
    FROM sessions
    GROUP BY session_type
  `).all();
    const recentActivity = db.prepare(`
    SELECT DATE(l.completed_at) as day, COUNT(*) as laps
    FROM laps l
    WHERE l.completed_at >= DATE('now', '-30 days')
    GROUP BY day
    ORDER BY day ASC
  `).all();
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
