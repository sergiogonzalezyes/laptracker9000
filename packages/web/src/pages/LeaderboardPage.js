import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Leaderboard from '../components/leaderboard/Leaderboard';
export default function LeaderboardPage() {
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { style: { flexShrink: 0 }, children: [_jsx("div", { style: { fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }, children: "Leaderboard" }), _jsx("div", { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }, children: "Real-time lap times from Assetto Corsa" })] }), _jsx(Leaderboard, {})] }));
}
