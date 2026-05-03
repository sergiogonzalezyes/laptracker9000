import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { api, formatLapTime, trackDisplayName } from '../../api/client';
function SortHeader({ label, col, sort, dir, onSort }) {
    const active = sort === col;
    return (_jsxs("th", { onClick: () => onSort(col), style: { cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }, children: [_jsx("span", { style: { color: active ? 'var(--accent-hot)' : 'var(--text-muted)' }, children: label }), ' ', _jsx("span", { style: { fontSize: 9, color: active ? 'var(--accent-hot)' : '#333' }, children: active ? (dir === 'asc' ? '▲' : '▼') : '▲▼' })] }));
}
function TrackCard({ track, selected, onClick }) {
    return (_jsxs("div", { onClick: onClick, style: {
            cursor: 'pointer',
            padding: '14px 16px',
            background: selected
                ? 'linear-gradient(135deg, #1a0000 0%, #0f0000 100%)'
                : 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
            border: `1px solid ${selected ? '#880000' : '#222'}`,
            borderTop: `1px solid ${selected ? '#cc0000' : '#333'}`,
            borderLeft: `3px solid ${selected ? 'var(--accent)' : '#1a1a1a'}`,
            borderRadius: 4,
            transition: 'all 0.15s',
            boxShadow: selected ? '0 0 16px rgba(204,0,0,0.2)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            minWidth: 160,
        }, children: [selected && (_jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)' } })), _jsxs("div", { style: {
                    fontFamily: 'var(--font-display)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    marginBottom: 8,
                    lineHeight: 1.3,
                }, children: [trackDisplayName(track.track).toUpperCase(), track.track_config && (_jsx("span", { style: { display: 'block', fontSize: 9, color: 'var(--text-muted)', fontWeight: 400 }, children: track.track_config }))] }), _jsx("div", { style: {
                    fontFamily: 'var(--font-display)',
                    fontSize: 17,
                    fontWeight: 800,
                    color: selected ? 'var(--accent-hot)' : 'var(--chrome-light)',
                    textShadow: selected ? '0 0 12px rgba(255,32,32,0.4)' : 'none',
                    letterSpacing: '0.03em',
                    marginBottom: 4,
                }, children: track.fastest_ms ? formatLapTime(track.fastest_ms) : '—' }), _jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: track.fastest_driver || '—' }), _jsxs("div", { style: { marginTop: 6, fontSize: 9, color: selected ? '#660000' : '#222', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }, children: [track.lap_count, " LAPS"] })] }));
}
export default function Leaderboard() {
    const [tracks, setTracks] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [entries, setEntries] = useState([]);
    const [sort, setSort] = useState('lap_time_ms');
    const [dir, setDir] = useState('asc');
    useEffect(() => {
        api.tracks().then(t => { setTracks(t); if (t[0])
            setSelectedTrack(t[0].track); });
    }, []);
    useEffect(() => {
        if (!selectedTrack)
            return;
        const params = new URLSearchParams({ track: selectedTrack });
        if (typeFilter)
            params.set('type', typeFilter);
        api.leaderboard('?' + params).then(setEntries);
    }, [selectedTrack, typeFilter]);
    // Keyboard: left/right arrow to navigate tracks
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
    const currentTrack = tracks.find(t => t.track === selectedTrack);
    return (_jsxs("div", { children: [_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }, children: tracks.map(t => (_jsx(TrackCard, { track: t, selected: t.track === selectedTrack, onClick: () => setSelectedTrack(t.track) }, t.track))) }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }, children: [_jsx("div", { style: { display: 'flex', gap: 2 }, children: ['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (_jsx("button", { onClick: () => setTypeFilter(type), style: {
                                padding: '5px 12px',
                                fontFamily: 'var(--font-display)',
                                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                                background: typeFilter === type ? 'linear-gradient(180deg, #aa0000, #770000)' : 'var(--bg-elevated)',
                                color: typeFilter === type ? '#fff' : 'var(--text-muted)',
                                border: `1px solid ${typeFilter === type ? '#cc0000' : 'var(--border-chrome)'}`,
                                borderRadius: 0,
                                boxShadow: typeFilter === type ? '0 0 10px rgba(204,0,0,0.3)' : 'none',
                                clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
                            }, children: type || 'ALL' }, type))) }), _jsx("span", { style: { marginLeft: 'auto', fontSize: 10, color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }, children: "\u2190 \u2192 TO NAVIGATE TRACKS" })] }), currentTrack && (_jsx("div", { style: { display: 'flex', gap: 1, marginBottom: 16 }, children: [
                    { label: 'Total Laps', value: String(currentTrack.lap_count), mono: false, highlight: false },
                    { label: 'Track Record', value: formatLapTime(currentTrack.fastest_ms), mono: true, highlight: true },
                    { label: 'Record Holder', value: currentTrack.fastest_driver || '—', mono: false, highlight: false },
                ].map(stat => (_jsxs("div", { style: {
                        flex: 1, padding: '12px 16px',
                        background: 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
                        border: '1px solid #222', borderTop: '1px solid #333',
                        position: 'relative', overflow: 'hidden',
                    }, children: [_jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.4 } }), _jsx("div", { style: { fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', marginBottom: 6 }, children: stat.label.toUpperCase() }), _jsx("div", { style: {
                                fontFamily: stat.mono ? 'var(--font-display)' : 'var(--font-sans)',
                                fontWeight: 800, fontSize: stat.highlight ? 20 : 16,
                                color: stat.highlight ? 'var(--accent-hot)' : 'var(--text-primary)',
                                textShadow: stat.highlight ? '0 0 14px rgba(255,32,32,0.4)' : 'none',
                                letterSpacing: stat.mono ? '0.05em' : '0',
                            }, children: stat.value })] }, stat.label))) })), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 48 }, children: "POS" }), _jsx(SortHeader, { label: "DRIVER", col: "driver_name", sort: sort, dir: dir, onSort: handleSort }), _jsx(SortHeader, { label: "BEST LAP", col: "lap_time_ms", sort: sort, dir: dir, onSort: handleSort }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx(SortHeader, { label: "CAR", col: "car_model", sort: sort, dir: dir, onSort: handleSort }), _jsx(SortHeader, { label: "DATE", col: "completed_at", sort: sort, dir: dir, onSort: handleSort })] }) }), _jsxs("tbody", { children: [sorted.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { textAlign: 'center', padding: '40px', color: '#222', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 11 }, children: "NO TIMES RECORDED" }) })), sorted.map((e, i) => (_jsxs("tr", { style: {
                                        background: i === 0 ? 'linear-gradient(90deg, rgba(204,0,0,0.08) 0%, transparent 100%)' : 'transparent',
                                        borderLeft: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                                    }, children: [_jsx("td", { style: {
                                                fontFamily: 'var(--font-display)', fontWeight: 900,
                                                fontSize: i === 0 ? 18 : 13,
                                                color: i === 0 ? 'var(--accent-hot)' : 'var(--text-muted)',
                                                textShadow: i === 0 ? '0 0 10px rgba(255,32,32,0.5)' : 'none',
                                            }, children: i === 0 ? '⚑' : i + 1 }), _jsx("td", { children: _jsx("a", { href: `/drivers/${encodeURIComponent(e.driver_name)}`, style: {
                                                    fontWeight: 700, fontSize: 14,
                                                    color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                    textDecoration: 'none',
                                                }, onMouseEnter: ev => (ev.currentTarget.style.color = 'var(--accent-hot)'), onMouseLeave: ev => (ev.currentTarget.style.color = i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)'), children: e.driver_name }) }), _jsx("td", { style: {
                                                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
                                                color: i === 0 ? 'var(--accent-hot)' : 'var(--chrome-light)',
                                                textShadow: i === 0 ? '0 0 12px rgba(255,32,32,0.4)' : 'none',
                                                letterSpacing: '0.03em',
                                            }, children: formatLapTime(e.lap_time_ms) }), _jsx("td", { style: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }, children: e.split1_ms ? formatLapTime(e.split1_ms) : '—' }), _jsx("td", { style: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }, children: e.split2_ms ? formatLapTime(e.split2_ms) : '—' }), _jsx("td", { style: { fontSize: 10, color: 'var(--text-muted)' }, children: e.car_model.replace(/_/g, ' ') }), _jsx("td", { style: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }, children: new Date(e.completed_at).toLocaleDateString() })] }, e.driver_name + i)))] })] }) })] }));
}
