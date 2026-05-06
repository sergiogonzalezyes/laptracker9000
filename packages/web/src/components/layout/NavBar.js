import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
import { useDriverTheme } from '../../hooks/useDriverTheme';
import { useIsMobile } from '../../hooks/useBreakpoint';
import LoginModal from '../LoginModal';
const NAV_LINKS = [
    { to: '/live', label: 'Live' },
    { to: '/history', label: 'History' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/drivers', label: 'Drivers' },
];
export default function NavBar() {
    const { isConnected, acStatus } = useLiveStore();
    const { me, logout } = useDriverTheme();
    const [showLogin, setShowLogin] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const accentColor = me?.color ?? '#cc0000';
    const AccountWidget = (_jsx("div", { style: { position: 'relative' }, children: me ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setShowAccountMenu(o => !o), style: {
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', padding: '4px 6px', borderRadius: 4,
                    }, children: [_jsx("div", { style: {
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: `radial-gradient(circle at 35% 35%, ${me.color}cc, ${me.color}55)`,
                                border: `2px solid ${me.color}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11,
                                color: '#fff',
                            }, children: me.name.slice(0, 2).toUpperCase() }), !isMobile && (_jsx("span", { style: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }, children: me.name }))] }), showAccountMenu && (_jsxs(_Fragment, { children: [_jsx("div", { style: { position: 'fixed', inset: 0, zIndex: 199 }, onClick: () => setShowAccountMenu(false) }), _jsxs("div", { style: {
                                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                borderTop: `2px solid ${me.color}`,
                                borderRadius: 6, minWidth: 180, zIndex: 200,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                                overflow: 'hidden',
                            }, children: [_jsxs("div", { style: { padding: '14px 16px', borderBottom: '1px solid var(--border)' }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }, children: me.name }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }, children: "Signed in" })] }), _jsx("button", { onClick: () => { navigate(`/drivers/${encodeURIComponent(me.name)}`); setShowAccountMenu(false); }, style: {
                                        display: 'block', width: '100%', padding: '11px 16px',
                                        textAlign: 'left', fontSize: 13, fontWeight: 500,
                                        color: 'var(--text-primary)', cursor: 'pointer',
                                        background: 'transparent', borderBottom: '1px solid var(--border)',
                                    }, onMouseEnter: e => (e.currentTarget.style.background = 'var(--bg-elevated)'), onMouseLeave: e => (e.currentTarget.style.background = 'transparent'), children: "My Profile" }), _jsx("button", { onClick: () => { logout(); setShowAccountMenu(false); }, style: {
                                        display: 'block', width: '100%', padding: '11px 16px',
                                        textAlign: 'left', fontSize: 13, color: 'var(--text-muted)',
                                        cursor: 'pointer', background: 'transparent',
                                    }, onMouseEnter: e => (e.currentTarget.style.background = 'var(--bg-elevated)'), onMouseLeave: e => (e.currentTarget.style.background = 'transparent'), children: "Sign out" })] })] }))] })) : (_jsx("button", { onClick: () => setShowLogin(true), style: {
                fontSize: 13, fontWeight: 600,
                color: 'var(--text-muted)',
                background: 'transparent', border: 'none',
                cursor: 'pointer', padding: '4px 8px',
                borderRadius: 4,
            }, onMouseEnter: e => (e.currentTarget.style.color = 'var(--text-primary)'), onMouseLeave: e => (e.currentTarget.style.color = 'var(--text-muted)'), children: "Sign in" })) }));
    const LiveIndicator = (_jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }, children: [_jsx("span", { className: `dot ${isConnected ? 'dot-green' : 'dot-grey'}` }), !isMobile && (isConnected ? 'Live' : 'Connecting')] }));
    return (_jsxs(_Fragment, { children: [showLogin && _jsx(LoginModal, { onClose: () => setShowLogin(false) }), _jsxs("header", { style: {
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky', top: 0, zIndex: 100,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }, children: [_jsx("div", { style: { height: 2, background: accentColor, transition: 'background 0.4s' } }), isMobile ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }, children: [_jsxs("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: '0.05em', userSelect: 'none', marginRight: 'auto' }, children: [_jsx("span", { className: "chrome", children: "LAP" }), _jsx("span", { style: { color: 'var(--accent)' }, children: "TRACKER" })] }), acStatus && acStatus.clients > 0 && (_jsxs("span", { style: { fontSize: 10, color: 'var(--accent-hot)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }, children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients] })), AccountWidget, LiveIndicator] }), _jsx("nav", { style: { display: 'flex', borderTop: '1px solid var(--border)', overflowX: 'auto' }, children: NAV_LINKS.map(({ to, label }) => (_jsx(NavLink, { to: to, style: ({ isActive }) => ({
                                        padding: '10px 16px', fontSize: 12, fontWeight: 600,
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                        borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                                        whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0,
                                    }), children: label }, to))) })] })) : (
                    /* Desktop single row */
                    _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '0 32px', height: 54 }, children: [_jsxs("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, marginRight: 24, letterSpacing: '0.06em', userSelect: 'none' }, children: [_jsx("span", { className: "chrome", children: "LAP" }), _jsx("span", { style: { color: 'var(--accent)', transition: 'color 0.4s' }, children: "TRACKER" }), _jsx("span", { style: { color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }, children: "9000" })] }), _jsx("nav", { style: { display: 'flex', gap: 2 }, children: NAV_LINKS.map(({ to, label }) => (_jsx(NavLink, { to: to, style: ({ isActive }) => ({
                                        padding: '6px 14px', fontSize: 13, fontWeight: 600,
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                        borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                                        transition: 'color 0.15s', textDecoration: 'none', display: 'block',
                                    }), children: label }, to))) }), _jsxs("div", { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }, children: [acStatus && acStatus.clients > 0 && (_jsxs("span", { className: "tag", children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients, " on track"] })), AccountWidget, LiveIndicator] })] }))] })] }));
}
