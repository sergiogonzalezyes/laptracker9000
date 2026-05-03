import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { formatLapTime } from '../../api/client';
// Sector color: compare sector time to driver's personal best sector
function sectorColor(ms, bestMs) {
    if (!ms || !bestMs || bestMs === Infinity)
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
function lapTrend(laps, idx) {
    if (idx < 2)
        return null;
    const [a, b, c] = [laps[idx - 2], laps[idx - 1], laps[idx]];
    if (!a.valid || !b.valid || !c.valid)
        return null;
    if (c.lapTimeMs < b.lapTimeMs && b.lapTimeMs < a.lapTimeMs)
        return { sym: '▲', color: 'var(--green)' };
    if (c.lapTimeMs > b.lapTimeMs && b.lapTimeMs > a.lapTimeMs)
        return { sym: '▼', color: 'var(--red)' };
    return { sym: '—', color: '#444' };
}
function formatDelta(ms, bestMs) {
    if (ms === bestMs)
        return '⚑';
    const d = ms - bestMs;
    return `+${(d / 1000).toFixed(3)}`;
}
export default function LapFeed({ filterDriver }) {
    const { recentLaps } = useLiveStore();
    const topRef = useRef(null);
    const now = Date.now();
    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [recentLaps.length]);
    const laps = filterDriver ? recentLaps.filter(l => l.driverName === filterDriver) : recentLaps;
    // Per-driver best sectors
    const driverBestS1 = new Map();
    const driverBestS2 = new Map();
    for (const l of laps) {
        if (!l.valid)
            continue;
        if (l.split1Ms)
            driverBestS1.set(l.driverName, Math.min(driverBestS1.get(l.driverName) ?? Infinity, l.split1Ms));
        if (l.split2Ms)
            driverBestS2.set(l.driverName, Math.min(driverBestS2.get(l.driverName) ?? Infinity, l.split2Ms));
    }
    // Session best lap
    const sessionBestMs = Math.min(...laps.filter(l => l.valid).map(l => l.lapTimeMs).filter(Boolean), Infinity);
    // Stats
    const validLaps = laps.filter(l => l.valid);
    const avgMs = validLaps.length ? validLaps.reduce((s, l) => s + l.lapTimeMs, 0) / validLaps.length : 0;
    const bestS1 = Math.min(...laps.filter(l => l.valid && l.split1Ms).map(l => l.split1Ms), Infinity);
    const bestS2 = Math.min(...laps.filter(l => l.valid && l.split2Ms).map(l => l.split2Ms), Infinity);
    const theoreticalBest = bestS1 !== Infinity && bestS2 !== Infinity ? bestS1 + bestS2 : null;
    const stdDev = validLaps.length > 1
        ? Math.sqrt(validLaps.map(l => (l.lapTimeMs - avgMs) ** 2).reduce((a, b) => a + b, 0) / validLaps.length)
        : null;
    if (laps.length === 0)
        return (_jsx("div", { style: { padding: '50px 16px', textAlign: 'center', color: '#1e1e1e', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 12 }, children: "NO LAPS YET" }));
    const displayLaps = laps.slice(0, 40);
    return (_jsxs("div", { children: [validLaps.length > 0 && (_jsx("div", { style: { display: 'flex', gap: 1, borderBottom: '1px solid var(--border)' }, children: [
                    { label: 'BEST', value: formatLapTime(sessionBestMs), highlight: true },
                    { label: 'AVERAGE', value: avgMs ? formatLapTime(Math.round(avgMs)) : '—', highlight: false },
                    { label: 'THEORY BEST', value: theoreticalBest ? formatLapTime(theoreticalBest) : '—', highlight: false },
                    { label: 'CONSISTENCY', value: stdDev ? `±${(stdDev / 1000).toFixed(2)}s` : '—', highlight: false },
                    { label: 'VALID LAPS', value: `${validLaps.length} / ${laps.length}`, highlight: false },
                ].map(s => (_jsxs("div", { style: { flex: 1, padding: '10px 12px', borderRight: '1px solid var(--border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }, children: [s.highlight && _jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.5 } }), _jsx("div", { style: { fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 4 }, children: s.label }), _jsx("div", { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: s.highlight ? 'var(--accent-hot)' : 'var(--chrome-light)', letterSpacing: '0.03em' }, children: s.value })] }, s.label))) })), _jsx("div", { ref: topRef }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 20 } }), _jsx("th", { style: { width: 28 }, children: "#" }), _jsx("th", { children: "DRIVER" }), _jsx("th", { children: "TIME" }), _jsx("th", { children: "DELTA" }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx("th", { children: "CAR" })] }) }), _jsx("tbody", { children: displayLaps.map((lap, idx) => {
                            const isNew = now - lap.timestamp < 2000;
                            const pulseClass = isNew && lap.isPB ? 'lap-pulse' : isNew ? 'lap-new' : '';
                            const timeClass = !lap.valid ? 'lap-invalid' : lap.isPB ? 'lap-pb' : lap.isSessionBest ? 'lap-session' : '';
                            const trend = lapTrend(displayLaps, idx);
                            const bestS1 = driverBestS1.get(lap.driverName) ?? Infinity;
                            const bestS2 = driverBestS2.get(lap.driverName) ?? Infinity;
                            return (_jsxs("tr", { className: pulseClass, children: [_jsx("td", { style: { width: 20, padding: '10px 4px' }, children: trend && _jsx("span", { style: { fontSize: 9, color: trend.color, fontWeight: 700 }, children: trend.sym }) }), _jsx("td", { style: { color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: lap.lapNumber || '—' }), _jsx("td", { style: { fontWeight: 600, fontSize: 13 }, children: lap.driverName }), _jsx("td", { className: timeClass, style: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }, children: formatLapTime(lap.lapTimeMs) }), _jsx("td", { style: {
                                            fontFamily: 'var(--font-mono)', fontSize: 11,
                                            color: !lap.valid ? 'var(--text-muted)' : lap.lapTimeMs === sessionBestMs ? 'var(--accent-hot)' : '#888',
                                            fontWeight: lap.lapTimeMs === sessionBestMs ? 700 : 400,
                                        }, children: lap.valid ? formatDelta(lap.lapTimeMs, sessionBestMs) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split1Ms, bestS1) }, children: lap.split1Ms ? formatLapTime(lap.split1Ms) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split2Ms, bestS2) }, children: lap.split2Ms ? formatLapTime(lap.split2Ms) : '—' }), _jsx("td", { style: { fontSize: 10, color: 'var(--text-muted)' }, children: lap.carModel.replace(/_/g, ' ') })] }, lap.id));
                        }) })] })] }));
}
