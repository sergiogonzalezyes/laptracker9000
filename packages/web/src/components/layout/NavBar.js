import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
import { useDriverTheme } from '../../hooks/useDriverTheme';
import { useIsMobile } from '../../hooks/useBreakpoint';
import LoginModal from '../LoginModal';
const NAV_LINKS = [
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/drivers', label: 'Drivers' },
    { to: '/tracks', label: 'Tracks' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/stats', label: 'Stats' },
];
export default function NavBar() {
    const { isConnected, acStatus } = useLiveStore();
    const { me, logout } = useDriverTheme();
    const [showLogin, setShowLogin] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const accentColor = me?.color ?? '#cc0000';
    return (_jsxs(_Fragment, { children: [showLogin && _jsx(LoginModal, { onClose: () => setShowLogin(false) }), _jsxs("header", { style: {
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky', top: 0, zIndex: 100,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }, children: [_jsx("div", { style: { height: 2, background: accentColor, transition: 'background 0.4s' } }), isMobile ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }, children: [_jsxs("span", { onClick: () => navigate('/live'), style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: '0.05em', userSelect: 'none', marginRight: 'auto', cursor: 'pointer' }, children: [_jsx("span", { className: "chrome", children: "Lap" }), _jsx("span", { style: { color: accentColor }, children: "Tracker" }), _jsx("span", { style: { color: 'var(--text-muted)', fontSize: 10 }, children: "9000" })] }), acStatus && acStatus.clients > 0 && (_jsxs("span", { style: { fontSize: 10, color: 'var(--accent-hot)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }, children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients] })), _jsx(AccountWidget, { me: me, onLogin: () => setShowLogin(true), onLogout: logout, navigate: navigate, showAccountMenu: showAccountMenu, setShowAccountMenu: setShowAccountMenu, accentColor: accentColor }), _jsx(LiveDot, { isConnected: isConnected })] }), _jsx("nav", { style: { display: 'flex', borderTop: '1px solid var(--border)', overflowX: 'auto' }, children: NAV_LINKS.map(({ to, label }) => (_jsx(NavLink, { to: to, style: ({ isActive }) => ({
                                        padding: '9px 14px', fontSize: 11, fontWeight: 600,
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                        borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                                        whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0,
                                    }), children: label }, to))) })] })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', height: 52, padding: '0 28px', gap: 0 }, children: [_jsxs("span", { onClick: () => navigate('/live'), style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, letterSpacing: '0.06em', userSelect: 'none', cursor: 'pointer', marginRight: 32, whiteSpace: 'nowrap' }, children: [_jsx("span", { className: "chrome", children: "Lap" }), _jsx("span", { style: { color: accentColor, transition: 'color 0.4s' }, children: "Tracker" }), _jsx("span", { style: { color: 'var(--text-muted)', fontSize: 11, marginLeft: 2 }, children: "9000" })] }), _jsx("nav", { style: { display: 'flex', gap: 0, flex: 1 }, children: NAV_LINKS.map(({ to, label }) => (_jsx(NavLink, { to: to, style: ({ isActive }) => ({
                                        padding: '0 16px', height: 52, display: 'flex', alignItems: 'center',
                                        fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                        borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                                        transition: 'color 0.15s', textDecoration: 'none',
                                        textTransform: 'uppercase',
                                    }), children: label }, to))) }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }, children: [acStatus && acStatus.clients > 0 && (_jsxs("span", { className: "tag", style: { fontSize: 11 }, children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients, " on track"] })), _jsx(LiveDot, { isConnected: isConnected }), _jsx(AccountWidget, { me: me, onLogin: () => setShowLogin(true), onLogout: logout, navigate: navigate, showAccountMenu: showAccountMenu, setShowAccountMenu: setShowAccountMenu, accentColor: accentColor })] })] }))] })] }));
}
// ── Sub-components ────────────────────────────────────────────────────────────
function LiveDot({ isConnected }) {
    return (_jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }, children: [_jsx("span", { className: `dot ${isConnected ? 'dot-green' : 'dot-grey'}` }), isConnected ? 'Live' : ''] }));
}
function AccountWidget({ me, onLogin, onLogout, navigate, showAccountMenu, setShowAccountMenu, accentColor }) {
    if (!me) {
        return (_jsx("button", { onClick: onLogin, style: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }, onMouseEnter: e => (e.currentTarget.style.color = 'var(--text-primary)'), onMouseLeave: e => (e.currentTarget.style.color = 'var(--text-muted)'), children: "Sign in" }));
    }
    return (_jsxs("div", { style: { position: 'relative' }, children: [_jsx("button", { onClick: () => setShowAccountMenu(!showAccountMenu), style: {
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
                }, children: _jsx("div", { style: {
                        width: 30, height: 30, borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 35%, ${me.color}cc, ${me.color}55)`,
                        border: `2px solid ${me.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 10, color: '#fff',
                    }, children: me.name.slice(0, 2).toUpperCase() }) }), showAccountMenu && (_jsxs(_Fragment, { children: [_jsx("div", { style: { position: 'fixed', inset: 0, zIndex: 199 }, onClick: () => setShowAccountMenu(false) }), _jsxs("div", { style: {
                            position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            borderTop: `2px solid ${me.color}`, borderRadius: 8,
                            minWidth: 160, zIndex: 200, overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        }, children: [_jsxs("div", { style: { padding: '12px 14px', borderBottom: '1px solid var(--border)' }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }, children: me.name }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }, children: "Signed in" })] }), _jsx("button", { onClick: () => { navigate(`/drivers/${encodeURIComponent(me.name)}`); setShowAccountMenu(false); }, style: { display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', background: 'transparent', borderBottom: '1px solid var(--border)' }, onMouseEnter: e => (e.currentTarget.style.background = 'var(--bg-elevated)'), onMouseLeave: e => (e.currentTarget.style.background = 'transparent'), children: "My Profile" }), _jsx("button", { onClick: () => { onLogout(); setShowAccountMenu(false); }, style: { display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent' }, onMouseEnter: e => (e.currentTarget.style.background = 'var(--bg-elevated)'), onMouseLeave: e => (e.currentTarget.style.background = 'transparent'), children: "Sign out" })] })] }))] }));
}
