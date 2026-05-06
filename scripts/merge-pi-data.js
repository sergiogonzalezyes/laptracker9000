// Merges beans' Pi sessions into the Windows DB before copying to Pi
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('packages/server/data/laptracker.db');

// Pi data extracted from the Pi DB
const piSessions = [
  { id: 1, server_name: 'agent', track: 'zw_midohio-nc',               track_config: '', session_type: 'PRACTICE', started_at: '2026-05-03T06:26:49.408Z', source_file: 'agent#auto#zw_midohio-nc#1777789609408',               source_type: 'agent' },
  { id: 2, server_name: 'agent', track: 'zw_midohio-nc',               track_config: '', session_type: 'PRACTICE', started_at: '2026-05-03T06:26:49.516Z', source_file: 'agent#auto#zw_midohio-nc#1777789609516',               source_type: 'agent' },
  { id: 3, server_name: 'agent', track: 'zw_midohio-nc',               track_config: '', session_type: 'PRACTICE', started_at: '2026-05-03T06:26:49.593Z', source_file: 'agent#auto#zw_midohio-nc#1777789609593',               source_type: 'agent' },
  { id: 4, server_name: 'agent', track: 'zw_midohio-nc',               track_config: '', session_type: 'PRACTICE', started_at: '2026-05-03T06:26:49.644Z', source_file: 'agent#auto#zw_midohio-nc#1777789609644',               source_type: 'agent' },
  { id: 5, server_name: 'agent', track: 'charlotte_motor_speedway-roval', track_config: '', session_type: 'PRACTICE', started_at: '2026-05-03T06:34:24.878Z', source_file: 'agent#auto#charlotte_motor_speedway-roval#1777790064878', source_type: 'agent' },
  { id: 6, server_name: 'agent', track: 'charlotte_motor_speedway-roval', track_config: '', session_type: 'PRACTICE', started_at: '2026-05-03T06:34:24.980Z', source_file: 'agent#auto#charlotte_motor_speedway-roval#1777790064980', source_type: 'agent' },
  { id: 7, server_name: 'agent', track: 'charlotte_motor_speedway-roval', track_config: '', session_type: 'PRACTICE', started_at: '2026-05-03T06:34:25.037Z', source_file: 'agent#auto#charlotte_motor_speedway-roval#1777790065037', source_type: 'agent' },
];

const piLaps = [
  { session_id: 1, car_model: 'gt4_mercedes_amg', lap_number: 1, lap_time_ms: 149891, cuts: 0, valid: 1, split1_ms: 107529, split2_ms: 34879, split3_ms: 7483,  completed_at: '2026-05-03T06:26:48.537Z' },
  { session_id: 2, car_model: 'gt4_mercedes_amg', lap_number: 2, lap_time_ms: 95043,  cuts: 0, valid: 1, split1_ms: 52585,  split2_ms: 35041, split3_ms: 7417,  completed_at: '2026-05-03T06:26:49.467Z' },
  { session_id: 3, car_model: 'gt4_mercedes_amg', lap_number: 3, lap_time_ms: 92983,  cuts: 0, valid: 1, split1_ms: 51776,  split2_ms: 33922, split3_ms: 7285,  completed_at: '2026-05-03T06:26:49.584Z' },
  { session_id: 4, car_model: 'gt4_mercedes_amg', lap_number: 4, lap_time_ms: 91621,  cuts: 0, valid: 1, split1_ms: 51224,  split2_ms: 33134, split3_ms: 7263,  completed_at: '2026-05-03T06:26:49.647Z' },
  { session_id: 5, car_model: 'gt4_mercedes_amg', lap_number: 1, lap_time_ms: 143654, cuts: 0, valid: 1, split1_ms: 93569,  split2_ms: 22032, split3_ms: 28053, completed_at: '2026-05-03T06:34:24.807Z' },
  { session_id: 6, car_model: 'gt4_mercedes_amg', lap_number: 2, lap_time_ms: 89363,  cuts: 0, valid: 1, split1_ms: 40179,  split2_ms: 21987, split3_ms: 27197, completed_at: '2026-05-03T06:34:24.940Z' },
  { session_id: 7, car_model: 'gt4_mercedes_amg', lap_number: 3, lap_time_ms: 87802,  cuts: 0, valid: 1, split1_ms: 39378,  split2_ms: 21703, split3_ms: 26721, completed_at: '2026-05-03T06:34:25.037Z' },
];

// Get or find beans driver ID
let beansId;
const existing = db.prepare("SELECT id FROM drivers WHERE name = 'beans'").get();
if (existing) {
  beansId = existing.id;
  console.log(`Found existing driver beans (id=${beansId})`);
} else {
  const r = db.prepare("INSERT INTO drivers (name, steam_guid) VALUES ('beans', '')").run();
  beansId = Number(r.lastInsertRowid);
  console.log(`Created driver beans (id=${beansId})`);
}

// Insert sessions, track old→new ID mapping
const sessionIdMap = new Map();
const insertSession = db.prepare(`
  INSERT OR IGNORE INTO sessions (server_name, track, track_config, session_type, started_at, ended_at, source_file, source_type)
  VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
`);

for (const s of piSessions) {
  const result = insertSession.run(s.server_name, s.track, s.track_config, s.session_type, s.started_at, s.source_file, s.source_type);
  if (result.lastInsertRowid) {
    sessionIdMap.set(s.id, Number(result.lastInsertRowid));
    console.log(`Inserted session ${s.id} (${s.track}) → new id ${result.lastInsertRowid}`);
  } else {
    // Already existed (source_file is UNIQUE) — find it
    const row = db.prepare("SELECT id FROM sessions WHERE source_file = ?").get(s.source_file);
    sessionIdMap.set(s.id, row.id);
    console.log(`Session ${s.id} (${s.track}) already exists as id ${row.id}`);
  }
}

// Insert laps
const insertLap = db.prepare(`
  INSERT INTO laps (session_id, driver_id, car_model, lap_number, lap_time_ms, cuts, valid, split1_ms, split2_ms, split3_ms, completed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
for (const l of piLaps) {
  const newSessionId = sessionIdMap.get(l.session_id);
  if (!newSessionId) { console.warn(`No mapping for session ${l.session_id}`); continue; }
  insertLap.run(newSessionId, beansId, l.car_model, l.lap_number, l.lap_time_ms, l.cuts, l.valid, l.split1_ms, l.split2_ms, l.split3_ms, l.completed_at);
  inserted++;
}

console.log(`\nDone. Inserted ${inserted} laps for beans.`);

// Verify
const count = db.prepare("SELECT COUNT(*) as c FROM sessions").get();
console.log(`Total sessions in DB: ${count.c}`);
