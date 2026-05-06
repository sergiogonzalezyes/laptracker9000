import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { api, formatLapTime, trackDisplayName } from '../../api/client';
function SortTh({ label, col, sort, dir, onSort, style }) {
    const active = sort === col;
    return (_jsxs("th", { onClick: () => onSort(col), style: { cursor: 'pointer', userSelect: 'none', ...style }, children: [_jsx("span", { style: { color: active ? 'var(--accent-hot)' : undefined }, children: label }), _jsx("span", { style: { marginLeft: 4, fontSize: 8, color: active ? 'var(--accent-hot)' : '#2a2a2a' }, children: active ? (dir === 'asc' ? '▲' : '▼') : '▼' })] }));
}
export default function Leaderboard() {
    const [tracks, setTracks] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [entries, setEntries] = useState([]);
    const [sort, setSort] = useState('lap_time_ms');
    const [dir, setDir] = useState('asc');
    const navigate = useNavigate();
    const isMobile = useIsMobile();
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
    const currentTrack = tracks.find(t => t.track === selectedTrack);
    const leaderMs = sorted[0]?.lap_time_ms ?? 0;
    // Best sectors across all entries
    const bestS1 = Math.min(...entries.filter(e => e.split1_ms).map(e => e.split1_ms));
    const bestS2 = Math.min(...entries.filter(e => e.split2_ms).map(e => e.split2_ms));
    const bestS3 = Math.min(...entries.filter(e => e.split3_ms).map(e => e.split3_ms));
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 0 }, children: [_jsxs("div", { style: { flexShrink: 0, marginBottom: 12 }, children: [_jsx("div", { style: { fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }, children: "Select Track" }), _jsx("div", { style: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }, children: tracks.map(t => {
                            const isSelected = t.track === selectedTrack;
                            return (_jsxs("div", { onClick: () => setSelectedTrack(t.track), style: {
                                    flexShrink: 0, cursor: 'pointer',
                                    padding: '10px 14px',
                                    background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                    borderRadius: 8,
                                    minWidth: 130, maxWidth: 160,
                                    transition: 'all 0.12s',
                                    boxShadow: isSelected ? `0 0 12px rgba(204,0,0,0.2)` : 'none',
                                }, children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: trackDisplayName(t.track) }), t.track_config && _jsx("div", { style: { fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }, children: t.track_config }), _jsx("div", { style: { fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: isSelected ? 'var(--accent-hot)' : 'var(--text-primary)', marginBottom: 2 }, children: t.fastest_ms ? formatLapTime(t.fastest_ms) : '—' }), _jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)' }, children: t.fastest_driver || '—' })] }, t.track));
                        }) })] }), currentTrack && (_jsxs("div", { style: {
                    flexShrink: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '16px 20px',
                    marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
                }, children: [_jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }, children: trackDisplayName(currentTrack.track) }), currentTrack.track_config && _jsx("div", { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }, children: currentTrack.track_config })] }), [
                        { label: 'Best Lap', value: formatLapTime(currentTrack.fastest_ms), mono: true, accent: true },
                        { label: 'Record Holder', value: currentTrack.fastest_driver || '—', mono: false, accent: false },
                        { label: 'Total Laps', value: String(currentTrack.lap_count), mono: false, accent: false },
                    ].map(s => (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }, children: s.label }), _jsx("div", { style: { fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: s.mono ? 22 : 16, fontWeight: 700, color: s.accent ? 'var(--accent-hot)' : 'var(--text-primary)' }, children: s.value })] }, s.label))), _jsx("div", { style: { display: 'flex', gap: 6, flexShrink: 0 }, children: ['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (_jsx("button", { onClick: () => setTypeFilter(type), style: {
                                padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                                background: typeFilter === type ? 'var(--accent)' : 'var(--bg-elevated)',
                                color: typeFilter === type ? '#fff' : 'var(--text-muted)',
                                border: `1px solid ${typeFilter === type ? 'var(--accent)' : 'var(--border)'}`,
                                cursor: 'pointer',
                            }, children: type || 'All' }, type))) })] })), _jsx("div", { className: "card", style: { flex: 1, minHeight: 0, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', overflowY: 'auto', overflowX: 'auto' }, children: _jsxs("table", { style: { minWidth: 640 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 56, textAlign: 'center' }, children: "Pos" }), _jsx(SortTh, { label: "Driver", col: "driver_name", sort: sort, dir: dir, onSort: handleSort }), _jsx(SortTh, { label: "Best Lap", col: "lap_time_ms", sort: sort, dir: dir, onSort: handleSort }), _jsx("th", { style: { width: 80 }, children: "Gap" }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx("th", { children: "S3" }), _jsx(SortTh, { label: "Car", col: "car_model", sort: sort, dir: dir, onSort: handleSort }), _jsx(SortTh, { label: "Date", col: "completed_at", sort: sort, dir: dir, onSort: handleSort })] }) }), _jsxs("tbody", { children: [sorted.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 9, style: { textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: 13 }, children: "No times recorded for this track" }) })), sorted.map((e, i) => {
                                        const isFirst = i === 0;
                                        const gap = e.lap_time_ms - leaderMs;
                                        const s1color = e.split1_ms && e.split1_ms === bestS1 ? '#a855f7' : 'var(--text-muted)';
                                        const s2color = e.split2_ms && e.split2_ms === bestS2 ? '#a855f7' : 'var(--text-muted)';
                                        const s3color = e.split3_ms && e.split3_ms === bestS3 ? '#a855f7' : 'var(--text-muted)';
                                        return (_jsxs("tr", { style: {
                                                background: isFirst ? 'rgba(232,176,0,0.04)' : undefined,
                                                borderLeft: isFirst ? '3px solid #e8b000' : '3px solid transparent',
                                            }, children: [_jsx("td", { style: { textAlign: 'center', padding: '12px 8px' }, children: isFirst ? (_jsx("span", { style: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: '#e8b000', lineHeight: 1 }, children: "1" })) : (_jsx("span", { style: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }, children: i + 1 })) }), _jsx("td", { children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [isFirst && _jsx("span", { style: { fontSize: 14 }, children: "\uD83D\uDC51" }), _jsx("a", { onClick: () => navigate(`/drivers/${encodeURIComponent(e.driver_name)}`), style: {
                                                                    fontSize: 15, fontWeight: isFirst ? 700 : 600,
                                                                    color: isFirst ? 'var(--text-primary)' : 'var(--text-primary)',
                                                                    cursor: 'pointer',
                                                                }, onMouseEnter: ev => (ev.currentTarget.style.color = 'var(--accent-hot)'), onMouseLeave: ev => (ev.currentTarget.style.color = 'var(--text-primary)'), children: e.driver_name })] }) }), _jsx("td", { children: _jsx("span", { style: {
                                                            fontFamily: 'var(--font-mono)', fontSize: isFirst ? 22 : 17, fontWeight: 700,
                                                            color: isFirst ? '#e8b000' : 'var(--text-primary)',
                                                        }, children: formatLapTime(e.lap_time_ms) }) }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }, children: isFirst ? '—' : `+${(gap / 1000).toFixed(3)}` }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: s1color, fontWeight: e.split1_ms === bestS1 ? 700 : 400 }, children: e.split1_ms ? formatLapTime(e.split1_ms) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: s2color, fontWeight: e.split2_ms === bestS2 ? 700 : 400 }, children: e.split2_ms ? formatLapTime(e.split2_ms) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: s3color, fontWeight: e.split3_ms === bestS3 ? 700 : 400 }, children: e.split3_ms ? formatLapTime(e.split3_ms) : '—' }), _jsx("td", { style: { fontSize: 12, color: 'var(--text-muted)' }, children: e.car_model.replace(/_/g, ' ') }), _jsx("td", { style: { fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }, children: new Date(e.completed_at).toLocaleDateString() })] }, e.driver_name + i));
                                    })] })] }) }) })] }));
}
