const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export interface Session {
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

export interface Lap {
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
  track?: string;
  server_name?: string;
}

export interface LeaderboardEntry {
  driver_name: string;
  car_model: string;
  lap_time_ms: number;
  split1_ms: number | null;
  split2_ms: number | null;
  split3_ms: number | null;
  session_id: number;
  completed_at: string;
}

export interface TrackSummary {
  track: string;
  track_config: string;
  lap_count: number;
  fastest_ms: number;
  fastest_driver: string;
}

export interface DriverStats {
  driver_name: string;
  total_laps: number;
  valid_laps: number;
  best_lap_ms: number | null;
  track_count: number;
}

export interface DriverSummary {
  name: string;
  total_laps: number;
  valid_laps: number;
  best_lap_ms: number | null;
  track_count: number;
  color: string;
  tagline: string;
  claimed: number;
}

export interface DriverProfile {
  id: number;
  name: string;
  color: string;
  tagline: string;
  claimed: number;
  favCar: string;
  stats: { total_laps: number; valid_laps: number; best_lap_ms: number | null; track_count: number };
  trackBests: { track: string; best_ms: number; car_model: string }[];
  recentSessions: { id: number; track: string; session_type: string; started_at: string; best_ms: number | null; lap_count: number }[];
}

export const api = {
  sessions:      (params = '')  => get<{ sessions: Session[]; total: number }>(`/sessions${params}`),
  session:       (id: number)   => get<Session & { laps: Lap[] }>(`/sessions/${id}`),
  activeSession: ()             => get<Session | null>('/sessions/active'),
  recentLaps:    (limit = 50)   => get<Lap[]>(`/laps/recent?limit=${limit}`),
  leaderboard:   (params = '')  => get<LeaderboardEntry[]>(`/leaderboard${params}`),
  tracks:        ()             => get<TrackSummary[]>('/leaderboard/tracks'),
  drivers:       ()             => get<DriverStats[]>('/leaderboard/drivers'),
  allDrivers:    ()             => get<DriverSummary[]>('/drivers'),
  driverProfile: (name: string) => get<DriverProfile>(`/drivers/${encodeURIComponent(name)}`),
  driverTrackHistory: (name: string, track: string) =>
    get<{ id: number; track: string; session_type: string; started_at: string; best_ms: number; best_car: string; lap_count: number }[]>(
      `/drivers/${encodeURIComponent(name)}/track-history?track=${encodeURIComponent(track)}`
    ),
  updateDriverProfile: (name: string, pin: string, color: string, tagline: string) =>
    fetch(`/api/drivers/${encodeURIComponent(name)}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, color, tagline }),
    }),
  claimDriver: (name: string, pin: string, color: string, tagline: string) =>
    fetch(`/api/drivers/${encodeURIComponent(name)}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, color, tagline }),
    }),
  verifyPin: (name: string, pin: string) =>
    fetch(`/api/drivers/${encodeURIComponent(name)}/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    }).then(r => r.json() as Promise<{ ok: boolean }>),
  stats: () => get<{
    totals: { total_laps: number; valid_laps: number; total_sessions: number; total_drivers: number; total_tracks: number };
    fastestLap: { lap_time_ms: number; car_model: string; driver_name: string; track: string; completed_at: string } | null;
    mostActiveDriver: { name: string; lap_count: number; color: string } | null;
    mostRacedTrack: { track: string; lap_count: number } | null;
    sessionTypes: { session_type: string; count: number }[];
    recentActivity: { day: string; laps: number }[];
    topDrivers: { name: string; total_laps: number; best_lap_ms: number | null; track_count: number; color: string }[];
  }>('/stats'),
};

// ── Format helpers ──────────────────────────────────────────────────────────

export function formatLapTime(ms: number): string {
  if (ms >= 999_000_000) return '--:--.---';
  const totalSec = Math.floor(ms / 1000);
  const minutes  = Math.floor(totalSec / 60);
  const seconds  = totalSec % 60;
  const millis   = ms % 1000;
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
  return `${seconds}.${String(millis).padStart(3, '0')}`;
}

export function formatDelta(ms: number, referencMs: number): string {
  const diff = ms - referencMs;
  if (diff === 0) return '—';
  const sign = diff > 0 ? '+' : '-';
  return sign + formatLapTime(Math.abs(diff));
}

export function sessionTypeBadge(type: string): string {
  return type.toLowerCase();
}

export function trackDisplayName(track: string): string {
  return track.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
