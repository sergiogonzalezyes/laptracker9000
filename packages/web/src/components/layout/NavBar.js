import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
const linkStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 13,
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    background: active ? 'rgba(232,176,0,0.08)' : 'transparent',
    transition: 'color 0.15s, background 0.15s',
});
export default function NavBar() {
    const { isConnected, acStatus } = useLiveStore();
    return (_jsxs("header", { style: {
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 52,
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }, children: [_jsxs("span", { style: { fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: 15, marginRight: 16, letterSpacing: '0.02em' }, children: ["LAP", _jsx("span", { style: { color: 'var(--text-secondary)' }, children: "TRACKER" })] }), _jsxs("nav", { style: { display: 'flex', gap: 4 }, children: [_jsx(NavLink, { to: "/", end: true, style: ({ isActive }) => linkStyle(isActive), children: "Live" }), _jsx(NavLink, { to: "/history", style: ({ isActive }) => linkStyle(isActive), children: "History" }), _jsx(NavLink, { to: "/leaderboard", style: ({ isActive }) => linkStyle(isActive), children: "Leaderboard" })] }), _jsxs("div", { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }, children: [acStatus && acStatus.clients > 0 && (_jsxs("span", { className: "tag", children: [_jsx("span", { className: "dot dot-green" }), acStatus.clients, " on track"] })), _jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }, children: [_jsx("span", { className: `dot ${isConnected ? 'dot-green' : 'dot-grey'}` }), isConnected ? 'live' : 'connecting...'] })] })] }));
}
