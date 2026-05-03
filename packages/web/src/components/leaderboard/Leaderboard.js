import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatLapTime, trackDisplayName } from '../../api/client';
function SortTh({ label, col, sort, dir, onSort, style }) {
    const active = sort === col;
    return (_jsxs("th", { onClick: () => onSort(col), style: { cursor: 'pointer', userSelect: 'none', ...style }, children: [_jsx("span", { style: { color: active ? 'var(--accent-hot)' : undefined }, children: label }), _jsx("span", { style: { marginLeft: 4, fontSize: 9, color: active ? 'var(--accent-hot)' : '#2a2a2a' }, children: active ? (dir === 'asc' ? '▲' : '▼') : '▼' })] }));
}
function TrackCard({ track, selected, onClick }) {
    return (_jsxs("div", { onClick: onClick, style: {
            cursor: 'pointer',
            padding: '14px 16px',
            background: selected ? '#0f0000' : 'var(--bg-surface)',
            border: `1px solid ${selected ? '#440000' : 'var(--border)'}`,
            borderLeft: `3px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 6,
            minWidth: 170,
            transition: 'all 0.12s',
        }, children: [_jsxs("div", { style: {
                    fontSize: 12, fontWeight: 700,
                    color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    marginBottom: 8, lineHeight: 1.3,
                    letterSpacing: '0.01em',
                }, children: [trackDisplayName(track.track), track.track_config && (_jsx("span", { style: { display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }, children: track.track_config }))] }), _jsx("div", { style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18, fontWeight: 700,
                    color: selected ? 'var(--accent-hot)' : 'var(--text-primary)',
                    marginBottom: 4,
                }, children: track.fastest_ms ? formatLapTime(track.fastest_ms) : '—' }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)' }, children: track.fastest_driver || '—' }), _jsxs("div", { style: { marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }, children: [track.lap_count, " laps"] })] }));
}
export default function Leaderboard() {
    const [tracks, setTracks] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [entries, setEntries] = useState([]);
    const [sort, setSort] = useState('lap_time_ms');
    const [dir, setDir] = useState('asc');
    const navigate = useNavigate();
    useEffect(() => {
        api.tracks().then(t => { setTracks(t); if (t[0])
            setSelectedTrack(t[0].track); });
    }, []);
    useEffect(() => {
        if (!selectedTrack)
            return;
        const p = new URLSearchParams({ track: selectedTrack });
        if (typeFilter)
            p.set('type', typeFilter);
        api.leaderboard('?' + p).then(setEntries);
    }, [selectedTrack, typeFilter]);
    useEffect(() => {
        const handler = (e) => {
            if (e.target.tagName === 'INPUT')
                return;
            const idx = tracks.findIndex(t => t.track === selectedTrack);
            if (e.key === 'ArrowLeft' && idx > 0)
                setSelectedTrack(tracks[idx - 1].track);
            if (e.key === 'ArrowRight' && idx < tracks.length - 1)
                setSelectedTrack(tracks[idx + 1].track);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [tracks, selectedTrack]);
    const handleSort = useCallback((col) => {
        if (sort === col)
            setDir(d => d === 'asc' ? 'desc' : 'asc');
        else {
            setSort(col);
            setDir('asc');
        }
    }, [sort]);
    const sorted = [...entries].sort((a, b) => {
        let av = a[sort] ?? '';
        let bv = b[sort] ?? '';
        if (sort === 'completed_at') {
            av = new Date(av).getTime();
            bv = new Date(bv).getTime();
        }
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return dir === 'asc' ? cmp : -cmp;
    });
    const leaderMs = sorted[0]?.lap_time_ms ?? 0;
    const currentTrack = tracks.find(t => t.track === selectedTrack);
    return (_jsxs("div", { children: [_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }, children: tracks.map(t => (_jsx(TrackCard, { track: t, selected: t.track === selectedTrack, onClick: () => setSelectedTrack(t.track) }, t.track))) }), _jsxs("div", { style: { display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }, children: [['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (_jsx("button", { onClick: () => setTypeFilter(type), style: {
                            fontSize: 12, fontWeight: 600, padding: '5px 14px',
                            background: typeFilter === type ? 'var(--accent-dim)' : 'transparent',
                            color: typeFilter === type ? 'var(--accent-hot)' : 'var(--text-muted)',
                            border: `1px solid ${typeFilter === type ? '#440000' : 'var(--border)'}`,
                            borderRadius: 3,
                        }, children: type || 'All' }, type))), _jsx("span", { style: { marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }, children: "\u2190 \u2192 navigate tracks" })] }), currentTrack && (_jsx("div", { style: { display: 'flex', gap: 24, marginBottom: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }, children: [
                    { label: 'Track Record', value: formatLapTime(currentTrack.fastest_ms), big: true },
                    { label: 'Record Holder', value: currentTrack.fastest_driver || '—', big: false },
                    { label: 'Total Laps', value: String(currentTrack.lap_count), big: false },
                ].map(s => (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }, children: s.label }), _jsx("div", { style: {
                                fontFamily: s.big ? 'var(--font-mono)' : 'var(--font-sans)',
                                fontSize: s.big ? 22 : 16,
                                fontWeight: 700,
                                color: s.big ? 'var(--accent-hot)' : 'var(--text-primary)',
                            }, children: s.value })] }, s.label))) })), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 64, textAlign: 'center' }, children: "POS" }), _jsx(SortTh, { label: "Driver", col: "driver_name", sort: sort, dir: dir, onSort: handleSort }), _jsx(SortTh, { label: "Best Lap", col: "lap_time_ms", sort: sort, dir: dir, onSort: handleSort }), _jsx("th", { children: "Gap" }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx(SortTh, { label: "Car", col: "car_model", sort: sort, dir: dir, onSort: handleSort }), _jsx(SortTh, { label: "Date", col: "completed_at", sort: sort, dir: dir, onSort: handleSort })] }) }), _jsxs("tbody", { children: [sorted.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, style: { textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: 13 }, children: "No times recorded" }) })), sorted.map((e, i) => {
                                    const isFirst = i === 0;
                                    const gap = e.lap_time_ms - leaderMs;
                                    return (_jsxs("tr", { style: {
                                            background: isFirst ? 'rgba(204,0,0,0.04)' : undefined,
                                            borderLeft: isFirst ? '3px solid var(--accent)' : '3px solid transparent',
                                        }, children: [_jsx("td", { style: { textAlign: 'center', padding: '14px 8px' }, children: _jsx("span", { style: {
                                                        fontFamily: 'var(--font-display)',
                                                        fontSize: isFirst ? 26 : 16,
                                                        fontWeight: 900,
                                                        color: isFirst ? 'var(--accent)' : 'var(--text-muted)',
                                                        lineHeight: 1,
                                                    }, children: isFirst ? '1' : i + 1 }) }), _jsx("td", { style: { padding: '14px 20px' }, children: _jsx("a", { onClick: () => navigate(`/drivers/${encodeURIComponent(e.driver_name)}`), style: {
                                                        fontSize: 16, fontWeight: 700,
                                                        color: isFirst ? 'var(--text-primary)' : 'var(--text-primary)',
                                                        cursor: 'pointer',
                                                    }, onMouseEnter: ev => (ev.currentTarget.style.color = 'var(--accent-hot)'), onMouseLeave: ev => (ev.currentTarget.style.color = 'var(--text-primary)'), children: e.driver_name }) }), _jsx("td", { style: { padding: '14px 20px' }, children: _jsx("span", { style: {
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: 20, fontWeight: 700,
                                                        color: isFirst ? 'var(--accent-hot)' : 'var(--text-primary)',
                                                        letterSpacing: '0.02em',
                                                    }, children: formatLapTime(e.lap_time_ms) }) }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }, children: isFirst ? '—' : `+${((gap) / 1000).toFixed(3)}` }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }, children: e.split1_ms ? formatLapTime(e.split1_ms) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }, children: e.split2_ms ? formatLapTime(e.split2_ms) : '—' }), _jsx("td", { style: { fontSize: 12, color: 'var(--text-muted)' }, children: e.car_model.replace(/_/g, ' ') }), _jsx("td", { style: { fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }, children: new Date(e.completed_at).toLocaleDateString() })] }, e.driver_name + i));
                                })] })] }) })] }));
}
