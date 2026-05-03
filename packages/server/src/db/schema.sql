PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sessions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  server_name  TEXT NOT NULL,
  track        TEXT NOT NULL,
  track_config TEXT NOT NULL DEFAULT '',
  session_type TEXT NOT NULL,
  started_at   TEXT NOT NULL,
  ended_at     TEXT,
  source_file  TEXT NOT NULL UNIQUE,
  source_type  TEXT NOT NULL DEFAULT 'log'
);

CREATE TABLE IF NOT EXISTS drivers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  steam_guid  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS laps (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id   INTEGER NOT NULL REFERENCES sessions(id),
  driver_id    INTEGER NOT NULL REFERENCES drivers(id),
  car_model    TEXT NOT NULL DEFAULT '',
  lap_number   INTEGER NOT NULL,
  lap_time_ms  INTEGER NOT NULL,
  cuts         INTEGER NOT NULL DEFAULT 0,
  valid        INTEGER NOT NULL DEFAULT 1,
  split1_ms    INTEGER,
  split2_ms    INTEGER,
  split3_ms    INTEGER,
  completed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ingested_files (
  file_path   TEXT NOT NULL UNIQUE,
  ingested_at TEXT NOT NULL,
  line_count  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS driver_profiles (
  driver_id INTEGER PRIMARY KEY REFERENCES drivers(id),
  color     TEXT NOT NULL DEFAULT '#cc0000',
  tagline   TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_laps_session    ON laps(session_id);
CREATE INDEX IF NOT EXISTS idx_laps_driver     ON laps(driver_id);
CREATE INDEX IF NOT EXISTS idx_laps_valid      ON laps(valid, lap_time_ms);
CREATE INDEX IF NOT EXISTS idx_sessions_track  ON sessions(track);
CREATE INDEX IF NOT EXISTS idx_sessions_type   ON sessions(session_type);
