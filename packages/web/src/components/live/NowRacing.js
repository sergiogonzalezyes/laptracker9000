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
        return (_jsxs("div", { style: { textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }, children: [_jsx("div", { style: { fontSize: 40, marginBottom: 12 }, children: "\u23F1" }), _jsx("div", { style: { fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }, children: "No active session" }), _jsx("div", { style: { fontSize: 13, marginTop: 8 }, children: "Server is offline or no laps in progress" })] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }, children: [_jsx("span", { className: `badge badge-${sessionType.toLowerCase()}`, children: sessionType || 'Practice' }), _jsx("span", { style: { fontWeight: 700, fontSize: 20 }, children: trackDisplayName(track) }), acStatus?.name && (_jsxs("span", { style: { color: 'var(--text-muted)', fontSize: 13 }, children: ["on ", acStatus.name] })), (acStatus?.clients ?? 0) > 0 && (_jsxs("span", { className: "tag", style: { marginLeft: 'auto' }, children: [_jsx("span", { className: "dot dot-green" }), acStatus.clients, " on track"] }))] }), sortedDrivers.length > 0 ? (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 12 }, children: sortedDrivers.map((d, i) => (_jsx(DriverCard, { driver: d, rank: i + 1, leaderBestMs: leaderBestMs }, d.name))) })) : (_jsx("div", { style: { color: 'var(--text-muted)', fontSize: 13 }, children: "Waiting for drivers..." }))] }));
}
