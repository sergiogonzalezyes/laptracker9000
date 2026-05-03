import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatLapTime, trackDisplayName } from '../../api/client';
export default function SessionDetail() {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    useEffect(() => {
        if (id)
            api.session(parseInt(id, 10)).then(setSession);
    }, [id]);
    if (!session)
        return _jsx("div", { style: { color: 'var(--text-muted)', padding: 40 }, children: "Loading..." });
    const validLaps = session.laps.filter(l => l.valid === 1);
    const bestMs = validLaps.length ? Math.min(...validLaps.map(l => l.lap_time_ms)) : null;
    // Group by driver for standings
    const byDriver = new Map();
    for (const lap of session.laps) {
        const arr = byDriver.get(lap.driver_name) ?? [];
        arr.push(lap);
        byDriver.set(lap.driver_name, arr);
    }
    const standings = [...byDriver.entries()].map(([name, laps]) => {
        const best = laps.filter(l => l.valid === 1).reduce((a, b) => a.lap_time_ms < b.lap_time_ms ? a : b, laps[0]);
        return { name, best, totalLaps: laps.length };
    }).sort((a, b) => (a.best?.valid === 1 ? a.best.lap_time_ms : Infinity) - (b.best?.valid === 1 ? b.best.lap_time_ms : Infinity));
    return (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: 20 }, children: _jsx(Link, { to: "/history", style: { color: 'var(--text-muted)', fontSize: 13 }, children: "\u2190 History" }) }), _jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 24 }, children: [_jsx("span", { className: `badge badge-${session.session_type.toLowerCase()}`, children: session.session_type }), _jsx("h1", { style: { fontWeight: 700, fontSize: 22 }, children: trackDisplayName(session.track) }), _jsx("span", { style: { color: 'var(--text-muted)', fontSize: 13 }, children: new Date(session.started_at).toLocaleString() })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { fontWeight: 600, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }, children: "Standings" }), _jsx("div", { className: "card", children: standings.map((s, i) => (_jsxs("div", { style: { padding: '10px 14px', borderBottom: i < standings.length - 1 ? '1px solid var(--border)' : 'none' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }, children: [_jsxs("span", { style: { fontWeight: 600 }, children: [_jsxs("span", { style: { color: 'var(--text-muted)', marginRight: 8, fontSize: 12 }, children: ["P", i + 1] }), _jsx(Link, { to: `/drivers/${encodeURIComponent(s.name)}`, style: { color: 'inherit', textDecoration: 'none' }, onMouseEnter: e => (e.currentTarget.style.color = 'var(--accent-hot)'), onMouseLeave: e => (e.currentTarget.style.color = 'inherit'), children: s.name })] }), _jsx("span", { className: "mono", style: { color: i === 0 ? 'var(--accent)' : 'var(--text-primary)', fontWeight: 700 }, children: s.best?.valid === 1 ? formatLapTime(s.best.lap_time_ms) : '—' })] }), _jsxs("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }, children: [s.totalLaps, " laps \u00B7 ", s.best?.car_model?.replace(/_/g, ' ') ?? ''] })] }, s.name))) })] }), _jsxs("div", { children: [_jsxs("h3", { style: { fontWeight: 600, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }, children: ["All Laps (", session.laps.length, ")"] }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "#" }), _jsx("th", { children: "Driver" }), _jsx("th", { children: "Time" }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx("th", { children: "Car" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: session.laps.map(lap => (_jsxs("tr", { children: [_jsx("td", { style: { color: 'var(--text-muted)', fontSize: 11 }, children: lap.lap_number }), _jsx("td", { style: { fontWeight: 500 }, children: _jsx(Link, { to: `/drivers/${encodeURIComponent(lap.driver_name)}`, style: { color: 'inherit', textDecoration: 'none' }, onMouseEnter: e => (e.currentTarget.style.color = 'var(--accent-hot)'), onMouseLeave: e => (e.currentTarget.style.color = 'inherit'), children: lap.driver_name }) }), _jsx("td", { className: `mono ${lap.valid === 1 ? (lap.lap_time_ms === bestMs ? 'lap-session' : '') : 'lap-invalid'}`, style: { fontWeight: 700, fontSize: 14 }, children: formatLapTime(lap.lap_time_ms) }), _jsx("td", { style: { fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }, children: lap.split1_ms ? formatLapTime(lap.split1_ms) : '—' }), _jsx("td", { style: { fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }, children: lap.split2_ms ? formatLapTime(lap.split2_ms) : '—' }), _jsx("td", { style: { fontSize: 11, color: 'var(--text-muted)' }, children: lap.car_model.replace(/_/g, ' ') }), _jsx("td", { children: lap.valid === 0 ? _jsxs("span", { style: { color: 'var(--red)', fontSize: 11 }, children: ["\u2717 ", lap.cuts, "c"] })
                                                            : lap.lap_time_ms === bestMs ? _jsx("span", { style: { color: 'var(--accent)', fontSize: 11 }, children: "\u2691 Best" })
                                                                : null })] }, lap.id))) })] }) })] })] })] }));
}
