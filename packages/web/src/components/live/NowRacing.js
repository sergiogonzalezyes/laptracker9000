import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLiveStore } from '../../store/liveStore';
import { trackDisplayName } from '../../api/client';
import DriverCard from './DriverCard';
export default function NowRacing() {
    const { currentSession, drivers, acStatus } = useLiveStore();
    const track = acStatus?.track || currentSession?.track || '';
    const sessionType = acStatus?.sessionType || currentSession?.session_type || '';
    const isActive = (acStatus?.clients ?? 0) > 0 || !!currentSession;
    const sortedDrivers = [...drivers.values()].sort((a, b) => a.bestLapMs - b.bestLapMs);
    const leaderBestMs = sortedDrivers[0]?.bestLapMs ?? Infinity;
    if (!isActive && sortedDrivers.length === 0) {
        return (_jsxs("div", { style: { textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }, children: [_jsx("div", { style: {
                        fontFamily: 'var(--font-display)',
                        fontSize: 48,
                        fontWeight: 900,
                        letterSpacing: '0.1em',
                        marginBottom: 12,
                        color: '#1a1a1a',
                    }, children: "\u23F1" }), _jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#2a2a2a', letterSpacing: '0.15em' }, children: "NO ACTIVE SESSION" }), _jsx("div", { style: { fontSize: 12, marginTop: 8, color: '#333', letterSpacing: '0.05em' }, children: "Server is offline or no laps in progress" })] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }, children: [_jsx("span", { className: `badge badge-${sessionType.toLowerCase()}`, children: sessionType || 'PRACTICE' }), _jsx("span", { style: {
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800,
                            fontSize: 22,
                            letterSpacing: '0.05em',
                            color: 'var(--text-primary)',
                        }, children: trackDisplayName(track).toUpperCase() }), acStatus?.name && (_jsx("span", { style: { color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: acStatus.name })), (acStatus?.clients ?? 0) > 0 && (_jsxs("span", { className: "tag", style: { marginLeft: 'auto' }, children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients, " ON TRACK"] }))] }), sortedDrivers.length > 0 ? (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 10 }, children: sortedDrivers.map((d, i) => (_jsx(DriverCard, { driver: d, rank: i + 1, leaderBestMs: leaderBestMs }, d.name))) })) : (_jsx("div", { style: { color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }, children: "WAITING FOR DRIVERS..." }))] }));
}
