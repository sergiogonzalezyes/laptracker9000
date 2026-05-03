import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api, formatLapTime, trackDisplayName } from '../../api/client';
export default function Leaderboard() {
    const [tracks, setTracks] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [entries, setEntries] = useState([]);
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
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }, children: [_jsx("select", { value: selectedTrack, onChange: e => setSelectedTrack(e.target.value), style: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 13, minWidth: 220 }, children: tracks.map(t => (_jsxs("option", { value: t.track, children: [trackDisplayName(t.track), " (", t.lap_count, " laps)"] }, t.track))) }), _jsx("div", { style: { display: 'flex', gap: 4 }, children: ['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (_jsx("button", { onClick: () => setTypeFilter(type), style: {
                                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                                background: typeFilter === type ? 'var(--accent)' : 'var(--bg-elevated)',
                                color: typeFilter === type ? '#000' : 'var(--text-secondary)',
                                border: '1px solid ' + (typeFilter === type ? 'var(--accent)' : 'var(--border)'),
                            }, children: type || 'All' }, type))) })] }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Pos" }), _jsx("th", { children: "Driver" }), _jsx("th", { children: "Best Lap" }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx("th", { children: "Car" }), _jsx("th", { children: "Date" })] }) }), _jsxs("tbody", { children: [entries.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }, children: "No times recorded" }) })), entries.map((e, i) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }, children: i === 0 ? '⚑' : i + 1 }), _jsx("td", { style: { fontWeight: 600 }, children: e.driver_name }), _jsx("td", { className: "mono", style: { fontWeight: 700, fontSize: 15, color: i === 0 ? 'var(--accent)' : 'var(--text-primary)' }, children: formatLapTime(e.lap_time_ms) }), _jsx("td", { style: { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }, children: e.split1_ms ? formatLapTime(e.split1_ms) : '—' }), _jsx("td", { style: { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }, children: e.split2_ms ? formatLapTime(e.split2_ms) : '—' }), _jsx("td", { style: { fontSize: 11, color: 'var(--text-muted)' }, children: e.car_model.replace(/_/g, ' ') }), _jsx("td", { style: { fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }, children: new Date(e.completed_at).toLocaleDateString() })] }, e.driver_name)))] })] }) }), selectedTrack && tracks.length > 0 && (() => {
                const t = tracks.find(t => t.track === selectedTrack);
                if (!t)
                    return null;
                return (_jsx("div", { style: { display: 'flex', gap: 12, marginTop: 20 }, children: [
                        { label: 'Total Laps', value: t.lap_count },
                        { label: 'Track Record', value: formatLapTime(t.fastest_ms) },
                        { label: 'Record Holder', value: t.fastest_driver },
                    ].map(stat => (_jsxs("div", { className: "card", style: { padding: '12px 16px', flex: 1 }, children: [_jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }, children: stat.label }), _jsx("div", { className: stat.label === 'Track Record' ? 'mono' : '', style: { fontWeight: 700, fontSize: 16, color: 'var(--accent)' }, children: stat.value })] }, stat.label))) }));
            })()] }));
}
