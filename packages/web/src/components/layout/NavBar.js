import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
export default function NavBar() {
    const { isConnected, acStatus } = useLiveStore();
    return (_jsxs("header", { style: {
            background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
            borderBottom: '1px solid #2a2a2a',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 56,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 20px rgba(0,0,0,0.8)',
        }, children: [_jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, #cc0000 30%, #ff2020 50%, #cc0000 70%, transparent 100%)' } }), _jsxs("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 17, marginRight: 24, letterSpacing: '0.08em', userSelect: 'none' }, children: [_jsx("span", { className: "chrome", children: "LAP" }), _jsx("span", { style: { color: 'var(--accent)', textShadow: '0 0 12px rgba(204,0,0,0.6)' }, children: "TRACKER" }), _jsx("span", { style: { color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }, children: "9000" })] }), _jsx("nav", { style: { display: 'flex', gap: 2 }, children: [
                    { to: '/', label: 'Live', end: true },
                    { to: '/history', label: 'History', end: false },
                    { to: '/leaderboard', label: 'Leaderboard', end: false },
                ].map(({ to, label, end }) => (_jsx(NavLink, { to: to, end: end, style: ({ isActive }) => ({
                        padding: '5px 16px',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: 11,
                        letterSpacing: '0.1em',
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        background: isActive ? 'linear-gradient(180deg, #1e0000 0%, #110000 100%)' : 'transparent',
                        borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                        transition: 'all 0.15s',
                        textDecoration: 'none',
                        display: 'block',
                    }), children: label }, to))) }), _jsxs("div", { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }, children: [acStatus && acStatus.clients > 0 && (_jsxs("span", { className: "tag", children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients, " ON TRACK"] })), _jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--text-muted)' }, children: [_jsx("span", { className: `dot ${isConnected ? 'dot-green' : 'dot-grey'}` }), isConnected ? 'LIVE' : 'CONNECTING'] })] })] }));
}
