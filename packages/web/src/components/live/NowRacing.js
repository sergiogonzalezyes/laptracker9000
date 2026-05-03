import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { trackDisplayName } from '../../api/client';
import DriverCard from './DriverCard';
export default function NowRacing({ focusedDriver, onFocus }) {
    const { currentSession, drivers, acStatus, recentLaps } = useLiveStore();
    const [sortMode, setSortMode] = useState('lap');
    const track = acStatus?.track || currentSession?.track || '';
    const sessionType = acStatus?.sessionType || currentSession?.session_type || '';
    const isActive = (acStatus?.clients ?? 0) > 0 || !!currentSession;
    const sorted = [...drivers.values()].sort((a, b) => {
        if (sortMode === 'lap')
            return a.bestLapMs - b.bestLapMs;
        if (sortMode === 'count')
            return b.lapCount - a.lapCount;
        return a.name.localeCompare(b.name);
    });
    const leaderBestMs = [...drivers.values()]
        .sort((a, b) => a.bestLapMs - b.bestLapMs)[0]?.bestLapMs ?? Infinity;
    // Per-driver lap history for sparklines
    const driverLapHistory = new Map();
    for (const lap of recentLaps) {
        if (!lap.valid)
            continue;
        const arr = driverLapHistory.get(lap.driverName) ?? [];
        arr.push(lap.lapTimeMs);
        driverLapHistory.set(lap.driverName, arr);
    }
    if (!isActive && sorted.length === 0) {
        return (_jsx("div", { style: { padding: '60px 0', textAlign: 'center' }, children: _jsx("div", { style: { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em' }, children: "No active session \u2014 server is offline or no laps in progress" }) }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }, children: [_jsx("span", { className: `badge badge-${sessionType.toLowerCase()}`, children: sessionType || 'PRACTICE' }), _jsx("span", { style: { fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }, children: trackDisplayName(track) }), acStatus?.name && (_jsx("span", { style: { fontSize: 13, color: 'var(--text-muted)' }, children: acStatus.name })), (acStatus?.clients ?? 0) > 0 && (_jsxs("span", { className: "tag", style: { marginLeft: 'auto' }, children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients, " on track"] }))] }), sorted.length > 0 && (_jsxs("div", { style: { display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }, children: [['lap', 'count', 'alpha'].map(m => (_jsx("button", { onClick: () => setSortMode(m), style: {
                            fontSize: 11, fontWeight: 600, padding: '4px 12px',
                            background: sortMode === m ? 'var(--accent-dim)' : 'transparent',
                            color: sortMode === m ? 'var(--accent-hot)' : 'var(--text-muted)',
                            border: `1px solid ${sortMode === m ? '#440000' : 'var(--border)'}`,
                            borderRadius: 3,
                        }, children: m === 'lap' ? 'Best Lap' : m === 'count' ? 'Lap Count' : 'Name' }, m))), focusedDriver && (_jsxs("button", { onClick: () => onFocus(null), style: {
                            marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '4px 12px',
                            background: 'var(--accent-dim)', color: 'var(--accent-hot)',
                            border: '1px solid #440000', borderRadius: 3,
                        }, children: ["\u2715 ", focusedDriver] }))] })), sorted.length > 0 ? (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 10 }, children: sorted.map((d, i) => (_jsx("div", { onClick: () => onFocus(focusedDriver === d.name ? null : d.name), style: {
                        outline: focusedDriver === d.name ? '2px solid var(--accent)' : '2px solid transparent',
                        borderRadius: 6,
                    }, children: _jsx(DriverCard, { driver: d, rank: i + 1, leaderBestMs: leaderBestMs, lapHistory: driverLapHistory.get(d.name) ?? [] }) }, d.name))) })) : (_jsx("div", { style: { fontSize: 13, color: 'var(--text-muted)' }, children: "Waiting for drivers..." }))] }));
}
