const BASE = '/api';
async function get(path) {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok)
        throw new Error(`API ${path} → ${res.status}`);
    return res.json();
}
export const api = {
    sessions: (params = '') => get(`/sessions${params}`),
    session: (id) => get(`/sessions/${id}`),
    activeSession: () => get('/sessions/active'),
    recentLaps: (limit = 50) => get(`/laps/recent?limit=${limit}`),
    leaderboard: (params = '') => get(`/leaderboard${params}`),
    tracks: () => get('/leaderboard/tracks'),
    drivers: () => get('/leaderboard/drivers'),
};
// ── Format helpers ──────────────────────────────────────────────────────────
export function formatLapTime(ms) {
    if (ms >= 999000000)
        return '--:--.---';
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const millis = ms % 1000;
    if (minutes > 0) {
        return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    }
    return `${seconds}.${String(millis).padStart(3, '0')}`;
}
export function formatDelta(ms, referencMs) {
    const diff = ms - referencMs;
    if (diff === 0)
        return '—';
    const sign = diff > 0 ? '+' : '-';
    return sign + formatLapTime(Math.abs(diff));
}
export function sessionTypeBadge(type) {
    return type.toLowerCase();
}
export function trackDisplayName(track) {
    return track.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
