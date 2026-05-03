import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { trackDisplayName } from '../../api/client';
import DriverCard from './DriverCard';
export default function NowRacing({ focusedDriver, onFocus }) {
    const { currentSession, drivers, acStatus } = useLiveStore();
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
    const leaderBestMs = [...drivers.values()].sort((a, b) => a.bestLapMs - b.bestLapMs)[0]?.bestLapMs ?? Infinity;
    if (!isActive && sorted.length === 0) {
        return (_jsxs("div", { style: { textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }, children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, marginBottom: 12, color: '#1a1a1a' }, children: "\u23F1" }), _jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#2a2a2a', letterSpacing: '0.15em' }, children: "NO ACTIVE SESSION" }), _jsx("div", { style: { fontSize: 12, marginTop: 8, color: '#333', letterSpacing: '0.05em' }, children: "Server is offline or no laps in progress" })] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }, children: [_jsx("span", { className: `badge badge-${sessionType.toLowerCase()}`, children: sessionType || 'PRACTICE' }), _jsx("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '0.05em' }, children: trackDisplayName(track).toUpperCase() }), acStatus?.name && (_jsx("span", { style: { color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: acStatus.name })), (acStatus?.clients ?? 0) > 0 && (_jsxs("span", { className: "tag", style: { marginLeft: 'auto' }, children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients, " ON TRACK"] }))] }), sorted.length > 0 && (_jsxs("div", { style: { display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginRight: 4 }, children: "SORT" }), ['lap', 'count', 'alpha'].map(m => (_jsx("button", { onClick: () => setSortMode(m), style: {
                            fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                            padding: '3px 10px',
                            background: sortMode === m ? 'rgba(204,0,0,0.2)' : 'transparent',
                            color: sortMode === m ? 'var(--accent-hot)' : 'var(--text-muted)',
                            border: `1px solid ${sortMode === m ? '#440000' : '#222'}`,
                            borderRadius: 0,
                        }, children: m === 'lap' ? 'BEST LAP' : m === 'count' ? 'LAP COUNT' : 'NAME' }, m))), focusedDriver && (_jsx("button", { onClick: () => onFocus(null), style: {
                            marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700,
                            letterSpacing: '0.1em', padding: '3px 10px',
                            background: 'rgba(204,0,0,0.1)', color: 'var(--accent-hot)',
                            border: '1px solid #440000', borderRadius: 0,
                        }, children: "\u2715 CLEAR FILTER" }))] })), sorted.length > 0 ? (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 10 }, children: sorted.map((d, i) => (_jsx("div", { onClick: () => onFocus(focusedDriver === d.name ? null : d.name), style: { cursor: 'pointer', outline: focusedDriver === d.name ? `2px solid var(--accent)` : '2px solid transparent', borderRadius: 4 }, children: _jsx(DriverCard, { driver: d, rank: i + 1, leaderBestMs: leaderBestMs }) }, d.name))) })) : (_jsx("div", { style: { color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }, children: "WAITING FOR DRIVERS..." }))] }));
}
