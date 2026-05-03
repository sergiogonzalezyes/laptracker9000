import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
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
function LapRow({ lap }) {
    const cls = lapClass(lap);
    const isNew = Date.now() - lap.timestamp < 2000;
    return (_jsxs("tr", { className: isNew && lap.isPB ? 'lap-pulse' : '', children: [_jsxs("td", { style: { width: 28, color: 'var(--text-muted)', fontSize: 11 }, children: ["#", lap.lapNumber || '—'] }), _jsx("td", { style: { fontWeight: 500 }, children: lap.driverName }), _jsx("td", { className: `mono ${cls}`, style: { fontSize: 15, fontWeight: 700 }, children: formatLapTime(lap.lapTimeMs) }), _jsx("td", { style: { color: 'var(--text-muted)', fontSize: 12 }, children: lap.split1Ms ? formatLapTime(lap.split1Ms) : '—' }), _jsx("td", { style: { color: 'var(--text-muted)', fontSize: 12 }, children: lap.split2Ms ? formatLapTime(lap.split2Ms) : '—' }), _jsx("td", { style: { fontSize: 11, color: 'var(--text-muted)' }, children: lap.carModel.replace(/_/g, ' ') }), _jsx("td", { style: { fontSize: 11 }, children: !lap.valid ? _jsxs("span", { style: { color: 'var(--red)', fontSize: 11 }, children: ["\u2717 ", lap.cuts, "c"] })
                    : lap.isPB ? _jsx("span", { style: { color: 'var(--green)', fontSize: 11 }, children: "PB" })
                        : null })] }));
}
export default function LapFeed() {
    const { recentLaps } = useLiveStore();
    const topRef = useRef(null);
    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [recentLaps.length]);
    if (recentLaps.length === 0) {
        return (_jsx("div", { style: { padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }, children: "No laps yet" }));
    }
    return (_jsxs("div", { style: { overflowY: 'auto', maxHeight: 520 }, children: [_jsx("div", { ref: topRef }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "#" }), _jsx("th", { children: "Driver" }), _jsx("th", { children: "Time" }), _jsx("th", { children: "S1" }), _jsx("th", { children: "S2" }), _jsx("th", { children: "Car" }), _jsx("th", {})] }) }), _jsx("tbody", { children: recentLaps.slice(0, 40).map(lap => _jsx(LapRow, { lap: lap }, lap.id)) })] })] }));
}
