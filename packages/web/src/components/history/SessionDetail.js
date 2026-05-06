import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatLapTime, trackDisplayName } from '../../api/client';
import { useIsMobile } from '../../hooks/useBreakpoint';
import LapTimeChart from '../charts/LapTimeChart';
function sectorColor(ms, bestMs) {
    if (!ms || !bestMs)
        return 'var(--text-muted)';
    const pct = (ms - bestMs) / bestMs;
    if (pct <= 0.01)
        return 'var(--green)';
    if (pct <= 0.04)
        return '#ffcc00';
    if (pct <= 0.08)
        return '#ff8800';
    return 'var(--red)';
}
function formatDelta(ms, bestMs) {
    if (ms === bestMs)
        return '⚑ BEST';
    return `+${((ms - bestMs) / 1000).toFixed(3)}`;
}
function lapTrend(laps, idx) {
    if (idx < 2)
        return null;
    const [a, b, c] = [laps[idx - 2], laps[idx - 1], laps[idx]];
    if (!a.valid || !b.valid || !c.valid)
        return null;
    if (c.lap_time_ms < b.lap_time_ms && b.lap_time_ms < a.lap_time_ms)
        return { sym: '▲', color: 'var(--green)' };
    if (c.lap_time_ms > b.lap_time_ms && b.lap_time_ms > a.lap_time_ms)
        return { sym: '▼', color: 'var(--red)' };
    return { sym: '—', color: '#444' };
}
function calcDriverStats(laps) {
    const valid = laps.filter(l => l.valid === 1);
    if (valid.length === 0)
        return { best: null, avg: null, theoreticalBest: null, stdDev: null, bestS1: null, bestS2: null, bestS3: null, lapCount: laps.length, validCount: 0 };
    const times = valid.map(l => l.lap_time_ms);
    const best = Math.min(...times);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const stdDev = times.length > 1
        ? Math.sqrt(times.map(t => (t - avg) ** 2).reduce((a, b) => a + b, 0) / times.length)
        : null;
    const s1s = valid.filter(l => l.split1_ms).map(l => l.split1_ms);
    const s2s = valid.filter(l => l.split2_ms).map(l => l.split2_ms);
    const s3s = valid.filter(l => l.split3_ms).map(l => l.split3_ms);
    const bestS1 = s1s.length ? Math.min(...s1s) : null;
    const bestS2 = s2s.length ? Math.min(...s2s) : null;
    const bestS3 = s3s.length ? Math.min(...s3s) : null;
    const theoreticalBest = bestS1 && bestS2 ? bestS1 + bestS2 + (bestS3 ?? 0) : null;
    return { best, avg, theoreticalBest, stdDev, bestS1, bestS2, bestS3, lapCount: laps.length, validCount: valid.length };
}
// ── Head-to-Head component ───────────────────────────────────────────────────
function HeadToHead({ standings, isMobile }) {
    const [p1idx, setP1idx] = useState(0);
    const [p2idx, setP2idx] = useState(1);
    const p1 = standings[p1idx];
    const p2 = standings[p2idx];
    if (!p1 || !p2)
        return null;
    // Shared laps: both drivers did the same lap number
    const p1ByLap = new Map(p1.laps.map(l => [l.lap_number, l]));
    const p2ByLap = new Map(p2.laps.map(l => [l.lap_number, l]));
    const allLapNums = [...new Set([...p1ByLap.keys(), ...p2ByLap.keys()])].sort((a, b) => a - b);
    const sharedLaps = allLapNums.filter(n => p1ByLap.has(n) && p2ByLap.has(n) && p1ByLap.get(n).valid === 1 && p2ByLap.get(n).valid === 1);
    const p1Wins = sharedLaps.filter(n => p1ByLap.get(n).lap_time_ms < p2ByLap.get(n).lap_time_ms).length;
    const p2Wins = sharedLaps.length - p1Wins;
    const p1Best = p1.stats.best;
    const p2Best = p2.stats.best;
    const gap = p1Best && p2Best ? Math.abs(p1Best - p2Best) : null;
    const faster = p1Best && p2Best ? (p1Best <= p2Best ? p1.name : p2.name) : null;
    return (_jsxs("div", { className: "card", style: { marginBottom: 16, padding: '16px 20px' }, children: [_jsxs("div", { style: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }, children: ["Head to Head", standings.length > 2 && (_jsxs("div", { style: { display: 'flex', gap: 6, marginLeft: 'auto' }, children: [_jsx("select", { value: p1idx, onChange: e => setP1idx(+e.target.value), style: { fontSize: 11, padding: '3px 8px', height: 26 }, children: standings.map((s, i) => i !== p2idx && _jsx("option", { value: i, children: s.name }, i)) }), _jsx("span", { style: { color: 'var(--text-muted)', alignSelf: 'center' }, children: "vs" }), _jsx("select", { value: p2idx, onChange: e => setP2idx(+e.target.value), style: { fontSize: 11, padding: '3px 8px', height: 26 }, children: standings.map((s, i) => i !== p1idx && _jsx("option", { value: i, children: s.name }, i)) })] }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: sharedLaps.length > 0 ? 16 : 0 }, children: [_jsxs("div", { style: { flex: 1, textAlign: 'left' }, children: [_jsx(Link, { to: `/drivers/${encodeURIComponent(p1.name)}`, style: { fontSize: 16, fontWeight: 700, color: p1.name === faster ? 'var(--accent-hot)' : 'var(--text-primary)', textDecoration: 'none' }, children: p1.name }), _jsx("div", { style: { fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: p1.name === faster ? 'var(--accent-hot)' : 'var(--text-primary)', marginTop: 4 }, children: p1Best ? formatLapTime(p1Best) : '—' }), _jsxs("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }, children: [p1.stats.lapCount, " laps"] })] }), _jsxs("div", { style: { textAlign: 'center', padding: '0 20px', flexShrink: 0 }, children: [gap && (_jsx("div", { style: { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }, children: `+${(gap / 1000).toFixed(3)}` })), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }, children: "vs" }), sharedLaps.length > 0 && (_jsxs("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }, children: [_jsx("span", { style: { color: p1Wins > p2Wins ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }, children: p1Wins }), _jsx("span", { style: { margin: '0 4px' }, children: "\u2013" }), _jsx("span", { style: { color: p2Wins > p1Wins ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }, children: p2Wins }), _jsx("div", { style: { fontSize: 10, color: '#444', marginTop: 2 }, children: "shared laps" })] }))] }), _jsxs("div", { style: { flex: 1, textAlign: 'right' }, children: [_jsx(Link, { to: `/drivers/${encodeURIComponent(p2.name)}`, style: { fontSize: 16, fontWeight: 700, color: p2.name === faster ? 'var(--accent-hot)' : 'var(--text-primary)', textDecoration: 'none' }, children: p2.name }), _jsx("div", { style: { fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: p2.name === faster ? 'var(--accent-hot)' : 'var(--text-primary)', marginTop: 4 }, children: p2Best ? formatLapTime(p2Best) : '—' }), _jsxs("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }, children: [p2.stats.lapCount, " laps"] })] })] }), sharedLaps.length > 0 && (_jsx("div", { className: "table-scroll", children: _jsxs("table", { style: { minWidth: 380 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 40 }, children: "LAP" }), _jsx("th", { children: p1.name }), _jsx("th", { style: { width: 80, textAlign: 'center' }, children: "GAP" }), _jsx("th", { style: { textAlign: 'right' }, children: p2.name })] }) }), _jsx("tbody", { children: sharedLaps.map(n => {
                                const l1 = p1ByLap.get(n);
                                const l2 = p2ByLap.get(n);
                                const d = l1.lap_time_ms - l2.lap_time_ms;
                                const p1faster = d < 0;
                                return (_jsxs("tr", { children: [_jsx("td", { style: { color: 'var(--text-muted)', fontSize: 12 }, children: n }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: p1faster ? 700 : 400, color: p1faster ? 'var(--green)' : 'var(--text-secondary)' }, children: formatLapTime(l1.lap_time_ms) }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }, children: d === 0 ? 'dead heat' : `${p1faster ? '' : '+'}${(d / 1000).toFixed(3)}` }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: !p1faster ? 700 : 400, color: !p1faster ? 'var(--green)' : 'var(--text-secondary)', textAlign: 'right' }, children: formatLapTime(l2.lap_time_ms) })] }, n));
                            }) })] }) })), sharedLaps.length === 0 && (_jsx("div", { style: { fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }, children: "No shared valid lap numbers in this session" }))] }));
}
function StatCell({ label, value, highlight }) {
    return (_jsxs("div", { style: { flex: 1, padding: '10px 12px', borderRight: '1px solid #1a1a1a', textAlign: 'center', position: 'relative', overflow: 'hidden' }, children: [highlight && _jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.5 } }), _jsx("div", { style: { fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 4 }, children: label }), _jsx("div", { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: highlight ? 'var(--accent-hot)' : 'var(--chrome-light)', letterSpacing: '0.02em' }, children: value })] }));
}
export default function SessionDetail() {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [focusDriver, setFocusDriver] = useState(null);
    const isMobile = useIsMobile();
    useEffect(() => {
        if (id)
            api.session(parseInt(id, 10)).then(s => {
                setSession(s);
                // Default to first driver if only one
                const names = [...new Set(s.laps.map(l => l.driver_name))];
                if (names.length === 1)
                    setFocusDriver(names[0]);
            });
    }, [id]);
    if (!session)
        return _jsx("div", { style: { color: 'var(--text-muted)', padding: 40, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', fontSize: 11 }, children: "LOADING..." });
    // Group by driver
    const byDriver = new Map();
    for (const lap of session.laps) {
        const arr = byDriver.get(lap.driver_name) ?? [];
        arr.push(lap);
        byDriver.set(lap.driver_name, arr);
    }
    const standings = [...byDriver.entries()].map(([name, laps]) => {
        const stats = calcDriverStats(laps);
        return { name, laps, stats };
    }).sort((a, b) => (a.stats.best ?? Infinity) - (b.stats.best ?? Infinity));
    const leaderBest = standings[0]?.stats.best ?? null;
    const driverNames = standings.map(s => s.name);
    // Focus driver data
    const focusLaps = focusDriver ? (byDriver.get(focusDriver) ?? session.laps) : session.laps;
    const focusStats = calcDriverStats(focusLaps);
    const sessionBestMs = Math.min(...session.laps.filter(l => l.valid === 1).map(l => l.lap_time_ms), Infinity);
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("div", { style: { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }, children: [_jsx(Link, { to: "/history", style: { color: 'var(--text-muted)', fontSize: 12 }, children: "\u2190 History" }), _jsx("span", { className: `badge badge-${session.session_type.toLowerCase()}`, children: session.session_type }), _jsx("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '0.05em' }, children: trackDisplayName(session.track).toUpperCase() }), _jsx("span", { style: { color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }, children: new Date(session.started_at).toLocaleString() })] }), driverNames.length >= 2 && (_jsx("div", { style: { flexShrink: 0, maxHeight: 260, overflowY: 'auto' }, children: _jsx(HeadToHead, { standings: standings, isMobile: isMobile }) })), _jsxs("div", { style: { flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr', gap: 12 }, children: [_jsxs("div", { style: { minHeight: 0, overflowY: 'auto' }, children: [_jsx("div", { className: "section-label", children: "Standings" }), _jsx("div", { className: "card", children: standings.map((s, i) => {
                                    const gap = s.stats.best && leaderBest ? s.stats.best - leaderBest : null;
                                    return (_jsxs("div", { onClick: () => setFocusDriver(focusDriver === s.name ? null : s.name), style: {
                                            padding: '12px 14px',
                                            borderBottom: i < standings.length - 1 ? '1px solid #1a1a1a' : 'none',
                                            borderLeft: focusDriver === s.name ? '2px solid var(--accent)' : '2px solid transparent',
                                            background: focusDriver === s.name ? 'rgba(204,0,0,0.05)' : 'transparent',
                                            cursor: 'pointer',
                                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }, children: [_jsxs("span", { style: { fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: i === 0 ? 16 : 12, color: i === 0 ? 'var(--accent-hot)' : 'var(--text-muted)' }, children: i === 0 ? '⚑' : `P${i + 1}` }), _jsx(Link, { to: `/drivers/${encodeURIComponent(s.name)}`, onClick: e => e.stopPropagation(), style: { color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13 }, onMouseEnter: e => (e.currentTarget.style.color = 'var(--accent-hot)'), onMouseLeave: e => (e.currentTarget.style.color = 'var(--text-primary)'), children: s.name })] }), _jsx("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: i === 0 ? 'var(--accent-hot)' : 'var(--chrome-light)' }, children: s.stats.best ? formatLapTime(s.stats.best) : '—' })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }, children: [_jsxs("span", { children: [s.stats.lapCount, " laps"] }), gap && gap > 0 ? (_jsxs("span", { style: { fontFamily: 'var(--font-mono)', color: '#555' }, children: ["+", (gap / 1000).toFixed(3)] })) : null] }), s.stats.stdDev && (_jsxs("div", { style: { marginTop: 6, display: 'flex', gap: 8, fontSize: 9, color: '#444', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }, children: [_jsxs("span", { children: ["AVG ", formatLapTime(Math.round(s.stats.avg))] }), _jsxs("span", { children: ["\u00B1", (s.stats.stdDev / 1000).toFixed(2), "s"] })] }))] }, s.name));
                                }) })] }), _jsxs("div", { style: { minHeight: 0, display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { className: "section-label", style: { flexShrink: 0 }, children: [focusDriver ? focusDriver.toUpperCase() : `ALL LAPS`, _jsxs("span", { style: { marginLeft: 8, fontSize: 9, color: '#333' }, children: ["(", focusLaps.length, " laps", focusDriver ? ' · click driver to deselect' : '', ")"] })] }), focusStats.validCount >= 2 && (_jsxs("div", { className: "card", style: { marginBottom: 8, padding: '12px 16px 8px' }, children: [_jsx("div", { style: { fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }, children: "Lap Time Progression" }), _jsx(LapTimeChart, { laps: focusLaps.map(l => ({
                                            lapNumber: l.lap_number,
                                            lapTimeMs: l.lap_time_ms,
                                            valid: l.valid === 1,
                                        })), height: 140 })] })), focusStats.validCount > 0 && (_jsxs("div", { className: "card", style: { display: 'flex', marginBottom: 8, padding: 0, overflow: 'hidden' }, children: [_jsx(StatCell, { label: "BEST", value: focusStats.best ? formatLapTime(focusStats.best) : '—', highlight: true }), _jsx(StatCell, { label: "AVERAGE", value: focusStats.avg ? formatLapTime(Math.round(focusStats.avg)) : '—' }), _jsx(StatCell, { label: "THEORY BEST", value: focusStats.theoreticalBest ? formatLapTime(focusStats.theoreticalBest) : '—' }), _jsx(StatCell, { label: "CONSISTENCY", value: focusStats.stdDev ? `±${(focusStats.stdDev / 1000).toFixed(2)}s` : '—' }), _jsx(StatCell, { label: "VALID / TOTAL", value: `${focusStats.validCount} / ${focusStats.lapCount}` })] })), _jsx("div", { className: "card", style: { flex: 1, minHeight: 0, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', overflowY: 'auto', overflowX: 'auto' }, children: _jsxs("table", { style: { minWidth: 560 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 20 } }), _jsx("th", { children: "#" }), _jsx("th", { children: "DRIVER" }), _jsx("th", { children: "TIME" }), _jsx("th", { children: "DELTA" }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx("th", { children: "S3" }), _jsx("th", { children: "CAR" }), _jsx("th", { children: "STATUS" })] }) }), _jsx("tbody", { children: focusLaps.map((lap, idx) => {
                                                    const trend = lapTrend(focusLaps, idx);
                                                    const driverLaps = byDriver.get(lap.driver_name) ?? [];
                                                    const driverStats = calcDriverStats(driverLaps);
                                                    const isSessionBest = lap.valid === 1 && lap.lap_time_ms === sessionBestMs;
                                                    return (_jsxs("tr", { style: {
                                                            background: isSessionBest ? 'linear-gradient(90deg, rgba(204,0,0,0.06) 0%, transparent 100%)' : 'transparent',
                                                            borderLeft: isSessionBest ? '2px solid var(--accent)' : '2px solid transparent',
                                                        }, children: [_jsx("td", { style: { width: 20, padding: '10px 4px', textAlign: 'center' }, children: trend && _jsx("span", { style: { fontSize: 9, color: trend.color, fontWeight: 700 }, children: trend.sym }) }), _jsx("td", { style: { color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)' }, children: lap.lap_number }), _jsx("td", { style: { fontWeight: 600 }, children: _jsx(Link, { to: `/drivers/${encodeURIComponent(lap.driver_name)}`, style: { color: 'inherit', textDecoration: 'none' }, onMouseEnter: e => (e.currentTarget.style.color = 'var(--accent-hot)'), onMouseLeave: e => (e.currentTarget.style.color = 'inherit'), children: lap.driver_name }) }), _jsx("td", { style: {
                                                                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                                                                    color: lap.valid === 0 ? 'var(--red)' : isSessionBest ? 'var(--accent-hot)' : 'var(--chrome-light)',
                                                                    opacity: lap.valid === 0 ? 0.6 : 1,
                                                                }, children: formatLapTime(lap.lap_time_ms) }), _jsx("td", { style: {
                                                                    fontFamily: 'var(--font-mono)', fontSize: 11,
                                                                    color: !lap.valid ? 'var(--text-muted)' : isSessionBest ? 'var(--accent-hot)' : '#666',
                                                                    fontWeight: isSessionBest ? 700 : 400,
                                                                }, children: lap.valid === 1 ? formatDelta(lap.lap_time_ms, sessionBestMs) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split1_ms, driverStats.bestS1) }, children: lap.split1_ms ? formatLapTime(lap.split1_ms) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split2_ms, driverStats.bestS2) }, children: lap.split2_ms ? formatLapTime(lap.split2_ms) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split3_ms, driverStats.bestS3) }, children: lap.split3_ms ? formatLapTime(lap.split3_ms) : '—' }), _jsx("td", { style: { fontSize: 10, color: 'var(--text-muted)' }, children: lap.car_model.replace(/_/g, ' ') }), _jsx("td", { style: { fontSize: 10 }, children: lap.valid === 0
                                                                    ? _jsxs("span", { style: { color: 'var(--red)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: ["\u2717 ", lap.cuts, "c"] })
                                                                    : isSessionBest
                                                                        ? _jsx("span", { style: { color: 'var(--accent-hot)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: "\u2691" })
                                                                        : null })] }, lap.id));
                                                }) })] }) }) })] })] })] }));
}
