import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatLapTime, trackDisplayName } from '../api/client';
export default function TracksPage() {
    const [tracks, setTracks] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    useEffect(() => { api.tracks().then(setTracks); }, []);
    const filtered = tracks.filter(t => trackDisplayName(t.track).toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { style: { flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }, children: "Tracks" }), _jsxs("div", { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }, children: [tracks.length, " tracks raced"] })] }), _jsx("input", { placeholder: "Search tracks...", value: search, onChange: e => setSearch(e.target.value), style: { marginLeft: 'auto', width: 200 } })] }), _jsx("div", { style: { flex: 1, minHeight: 0, overflowY: 'auto' }, children: _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }, children: filtered.map(t => (_jsxs("div", { onClick: () => navigate(`/leaderboard?track=${encodeURIComponent(t.track)}`), style: {
                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            borderRadius: 10, padding: '16px', cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                        }, onMouseEnter: e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(204,0,0,0.15)'; }, onMouseLeave: e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4)'; }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }, children: trackDisplayName(t.track) }), t.track_config && _jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }, children: t.track_config }), _jsx("div", { style: { fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent-hot)', marginBottom: 4 }, children: t.fastest_ms ? formatLapTime(t.fastest_ms) : '—' }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }, children: t.fastest_driver || '—' }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }, children: [_jsxs("span", { style: { fontSize: 11, color: 'var(--text-muted)' }, children: [t.lap_count, " laps"] }), _jsx("span", { style: { fontSize: 11, color: 'var(--accent)', fontWeight: 600 }, children: "View \u2192" })] })] }, t.track))) }) })] }));
}
