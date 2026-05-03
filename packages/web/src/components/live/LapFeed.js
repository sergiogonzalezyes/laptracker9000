import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { formatLapTime } from '../../api/client';
function lapClass(lap) {
    if (!lap.valid)
        return 'lap-invalid';
    if (lap.isPB)
        return 'lap-pb';
    if (lap.isSessionBest)
        return 'lap-session';
    return '';
}
function LapRow({ lap, isNew }) {
    const cls = lapClass(lap);
    const pulseClass = isNew && lap.isPB ? 'lap-pulse' : isNew ? 'lap-new' : '';
    return (_jsxs("tr", { className: pulseClass, children: [_jsx("td", { style: { width: 32, color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: lap.lapNumber || '—' }), _jsx("td", { style: { fontWeight: 600, fontSize: 13 }, children: lap.driverName }), _jsx("td", { style: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }, className: cls, children: formatLapTime(lap.lapTimeMs) }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }, children: lap.split1Ms ? formatLapTime(lap.split1Ms) : '—' }), _jsx("td", { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }, children: lap.split2Ms ? formatLapTime(lap.split2Ms) : '—' }), _jsx("td", { style: { fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.02em' }, children: lap.carModel.replace(/_/g, ' ') }), _jsx("td", { style: { fontSize: 10, width: 48 }, children: !lap.valid
                    ? _jsxs("span", { style: { color: 'var(--red)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: ["\u2717 ", lap.cuts, "c"] })
                    : lap.isPB
                        ? _jsx("span", { style: { color: 'var(--green)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: "PB" })
                        : null })] }));
}
export default function LapFeed() {
    const { recentLaps } = useLiveStore();
    const topRef = useRef(null);
    const now = Date.now();
    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [recentLaps.length]);
    if (recentLaps.length === 0) {
        return (_jsx("div", { style: { padding: '50px 16px', textAlign: 'center', color: '#1e1e1e', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 12 }, children: "NO LAPS YET" }));
    }
    return (_jsxs("div", { style: { overflowY: 'auto', maxHeight: 520 }, children: [_jsx("div", { ref: topRef }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "#" }), _jsx("th", { children: "Driver" }), _jsx("th", { children: "Time" }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx("th", { children: "Car" }), _jsx("th", {})] }) }), _jsx("tbody", { children: recentLaps.slice(0, 40).map(lap => (_jsx(LapRow, { lap: lap, isNew: now - lap.timestamp < 2000 }, lap.id))) })] })] }));
}
