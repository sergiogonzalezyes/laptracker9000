import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatLapTime } from '../../api/client';
export default function DriverCard({ driver, rank, leaderBestMs }) {
    const gap = driver.bestLapMs - leaderBestMs;
    const isLeader = gap === 0;
    return (_jsxs("div", { style: {
            background: isLeader
                ? 'linear-gradient(135deg, #1a0000 0%, #0f0000 60%, #0a0000 100%)'
                : 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
            border: `1px solid ${isLeader ? '#440000' : '#222'}`,
            borderTop: `1px solid ${isLeader ? '#880000' : '#333'}`,
            borderLeft: `3px solid ${isLeader ? 'var(--accent)' : '#222'}`,
            borderRadius: 4,
            padding: '14px 16px',
            minWidth: 210,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isLeader ? '0 0 20px rgba(204,0,0,0.15)' : 'none',
        }, children: [isLeader && (_jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)' } })), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, children: [_jsxs("span", { style: {
                            fontFamily: 'var(--font-display)',
                            fontSize: 20,
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            color: isLeader ? 'var(--accent)' : '#333',
                            lineHeight: 1,
                        }, children: ["P", rank] }), _jsxs("span", { style: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }, children: [driver.lapCount, " LAPS"] })] }), _jsx("div", { style: { fontWeight: 700, marginBottom: 10, fontSize: 15, letterSpacing: '0.02em', color: 'var(--text-primary)' }, children: driver.name }), _jsx("div", { style: {
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 800,
                    color: isLeader ? 'var(--accent-hot)' : 'var(--chrome-light)',
                    textShadow: isLeader ? '0 0 16px rgba(255,32,32,0.5)' : 'none',
                    letterSpacing: '0.02em',
                    marginBottom: 4,
                }, children: driver.bestLapMs === Infinity ? '--:--.---' : formatLapTime(driver.bestLapMs) }), !isLeader && driver.bestLapMs !== Infinity && (_jsxs("div", { style: { fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }, children: ["+", formatLapTime(gap)] })), isLeader && _jsx("div", { style: { fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }, children: "LEADER" }), _jsx("div", { style: { marginTop: 10, paddingTop: 8, borderTop: '1px solid #222', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.03em' }, children: driver.carModel.replace(/_/g, ' ') })] }));
}
