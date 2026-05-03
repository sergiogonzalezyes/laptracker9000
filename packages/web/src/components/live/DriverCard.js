import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatLapTime } from '../../api/client';
export default function DriverCard({ driver, rank, leaderBestMs }) {
    const gap = driver.bestLapMs - leaderBestMs;
    const isLeader = gap === 0;
    const hasTime = driver.bestLapMs !== Infinity;
    return (_jsxs("div", { style: {
            background: isLeader ? '#0f0000' : 'var(--bg-surface)',
            border: `1px solid ${isLeader ? '#330000' : 'var(--border)'}`,
            borderLeft: `4px solid ${isLeader ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 6,
            padding: '16px 18px',
            minWidth: 220,
            cursor: 'pointer',
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }, children: [_jsx("span", { style: {
                            fontFamily: 'var(--font-display)',
                            fontSize: 28, fontWeight: 900,
                            color: isLeader ? 'var(--accent)' : '#2a2a2a',
                            lineHeight: 1,
                        }, children: rank }), _jsxs("span", { style: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }, children: [driver.lapCount, " lap", driver.lapCount !== 1 ? 's' : ''] })] }), _jsx("div", { style: {
                    fontSize: 16, fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                    letterSpacing: '0.01em',
                }, children: driver.name }), _jsx("div", { style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: 22, fontWeight: 700,
                    color: isLeader ? 'var(--accent-hot)' : 'var(--text-primary)',
                    letterSpacing: '0.02em',
                    marginBottom: hasTime && !isLeader ? 4 : 0,
                }, children: hasTime ? formatLapTime(driver.bestLapMs) : '--:--.---' }), !isLeader && hasTime && (_jsxs("div", { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }, children: ["+", formatLapTime(gap)] })), isLeader && (_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em' }, children: "LEADER" })), _jsx("div", { style: {
                    marginTop: 10, paddingTop: 8,
                    borderTop: '1px solid var(--border)',
                    fontSize: 11, color: 'var(--text-muted)',
                }, children: driver.carModel.replace(/_/g, ' ') })] }));
}
