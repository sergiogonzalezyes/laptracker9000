import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
import { useDriverTheme } from '../../hooks/useDriverTheme';
import { useIsMobile } from '../../hooks/useBreakpoint';
const NAV_LINKS = [
    { to: '/live', label: 'Live' },
    { to: '/history', label: 'History' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/drivers', label: 'Drivers' },
];
export default function NavBar() {
    const { isConnected, acStatus } = useLiveStore();
    const { drivers, selected, selectDriver } = useDriverTheme();
    const [pickerOpen, setPickerOpen] = useState(false);
    const navigate = useNavigate();
    const pickerRef = useRef(null);
    const isMobile = useIsMobile();
    useEffect(() => {
        const handler = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const accentColor = selected?.color ?? '#cc0000';
    // ── Picker dropdown (shared between mobile + desktop) ───────────────────
    const PickerDropdown = pickerOpen ? (_jsxs("div", { style: {
            position: 'absolute', right: 0, top: '100%', marginTop: 4,
            background: '#0f0f0f', border: '1px solid #2a2a2a',
            borderTop: `2px solid var(--accent)`,
            minWidth: 190, zIndex: 300,
            boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
        }, children: [drivers.map(d => (_jsxs("button", { onClick: () => { selectDriver(d); setPickerOpen(false); }, style: {
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '11px 14px',
                    background: selected?.name === d.name ? `${d.color}18` : 'transparent',
                    borderBottom: '1px solid #1a1a1a',
                    borderLeft: selected?.name === d.name ? `2px solid ${d.color}` : '2px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                }, onMouseEnter: e => (e.currentTarget.style.background = `${d.color}18`), onMouseLeave: e => (e.currentTarget.style.background = selected?.name === d.name ? `${d.color}18` : 'transparent'), children: [_jsx("div", { style: {
                            width: 30, height: 30, borderRadius: 3, flexShrink: 0,
                            background: `radial-gradient(circle at 35% 35%, ${d.color}cc, ${d.color}55)`,
                            border: `1px solid ${d.color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11, color: '#fff',
                        }, children: d.name.slice(0, 2).toUpperCase() }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: d.name }), d.tagline && (_jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }, children: d.tagline }))] }), selected?.name === d.name && _jsx("span", { style: { fontSize: 12, color: d.color }, children: "\u2713" })] }, d.name))), selected && (_jsxs("div", { style: { borderTop: '1px solid #1a1a1a' }, children: [_jsx("button", { onClick: () => { navigate(`/drivers/${encodeURIComponent(selected.name)}`); setPickerOpen(false); }, style: { width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--accent-hot)', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: 8 }, children: "\u270E Edit My Profile" }), _jsx("button", { onClick: () => { selectDriver(null); setPickerOpen(false); }, style: { width: '100%', padding: '8px 14px', textAlign: 'center', fontSize: 11, color: '#444', cursor: 'pointer', background: 'transparent', borderTop: '1px solid #111' }, children: "Reset Theme" })] })), drivers.length === 0 && (_jsx("div", { style: { padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }, children: "No drivers yet" }))] })) : null;
    // ── Driver avatar button ─────────────────────────────────────────────────
    const AvatarBtn = selected ? (_jsx("button", { onClick: () => navigate(`/drivers/${encodeURIComponent(selected.name)}`), style: {
            width: 32, height: 32, borderRadius: 3,
            background: `radial-gradient(circle at 35% 35%, ${selected.color}cc, ${selected.color}55)`,
            border: `1px solid ${selected.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11, color: '#fff',
            flexShrink: 0, cursor: 'pointer',
        }, children: selected.name.slice(0, 2).toUpperCase() })) : null;
    // ── Live dot ─────────────────────────────────────────────────────────────
    const LiveDot = (_jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }, children: [_jsx("span", { className: `dot ${isConnected ? 'dot-green' : 'dot-grey'}` }), isMobile ? '' : (isConnected ? 'Live' : 'Connecting')] }));
    if (isMobile) {
        return (_jsxs("header", { style: {
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0, zIndex: 100,
            }, children: [_jsx("div", { style: { height: 2, background: accentColor, transition: 'background 0.4s' } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }, children: [_jsxs("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: '0.05em', userSelect: 'none', marginRight: 'auto' }, children: [_jsx("span", { className: "chrome", children: "LAP" }), _jsx("span", { style: { color: 'var(--accent)' }, children: "TRACKER" })] }), acStatus && acStatus.clients > 0 && (_jsxs("span", { style: { fontSize: 10, color: 'var(--accent-hot)', fontWeight: 600 }, children: [_jsx("span", { className: "dot dot-red", style: { marginRight: 4 } }), acStatus.clients] })), _jsxs("div", { ref: pickerRef, style: { position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }, children: [AvatarBtn, _jsxs("button", { onClick: () => setPickerOpen(o => !o), style: {
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '5px 10px', height: 32,
                                        background: 'var(--bg-elevated)',
                                        border: `1px solid ${selected ? accentColor + '66' : 'var(--border-bright)'}`,
                                        borderRadius: 3, cursor: 'pointer',
                                    }, children: [selected ? (_jsx("span", { style: { fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: selected.name })) : (_jsx("span", { style: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }, children: "Who?" })), _jsx("span", { style: { fontSize: 8, color: 'var(--text-muted)' }, children: "\u25BC" })] }), PickerDropdown] }), LiveDot] }), _jsx("nav", { style: { display: 'flex', borderTop: '1px solid var(--border)', overflowX: 'auto' }, children: NAV_LINKS.map(({ to, label }) => (_jsx(NavLink, { to: to, style: ({ isActive }) => ({
                            padding: '10px 16px', fontSize: 12, fontWeight: 600,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                            borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                            whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0,
                        }), children: label }, to))) })] }));
    }
    // ── Desktop ──────────────────────────────────────────────────────────────
    return (_jsxs("header", { style: {
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '0 32px',
            display: 'flex', alignItems: 'center', gap: 8,
            height: 54, position: 'sticky', top: 0, zIndex: 100,
        }, children: [_jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, transition: 'background 0.4s' } }), _jsxs("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, marginRight: 24, letterSpacing: '0.06em', userSelect: 'none' }, children: [_jsx("span", { className: "chrome", children: "LAP" }), _jsx("span", { style: { color: 'var(--accent)', transition: 'color 0.4s' }, children: "TRACKER" }), _jsx("span", { style: { color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }, children: "9000" })] }), _jsx("nav", { style: { display: 'flex', gap: 2 }, children: NAV_LINKS.map(({ to, label }) => (_jsx(NavLink, { to: to, style: ({ isActive }) => ({
                        padding: '6px 14px', fontSize: 13, fontWeight: 600,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                        transition: 'color 0.15s', textDecoration: 'none', display: 'block',
                    }), children: label }, to))) }), _jsxs("div", { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }, children: [acStatus && acStatus.clients > 0 && (_jsxs("span", { className: "tag", children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients, " on track"] })), _jsxs("div", { ref: pickerRef, style: { position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }, children: [AvatarBtn, _jsxs("button", { onClick: () => setPickerOpen(o => !o), style: {
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', height: 32,
                                    background: 'var(--bg-elevated)',
                                    border: `1px solid ${selected ? accentColor + '66' : 'var(--border-bright)'}`,
                                    borderRadius: 3, cursor: 'pointer',
                                }, children: [selected ? (_jsx("span", { style: { fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }, children: selected.name })) : (_jsx("span", { style: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }, children: "Who are you?" })), _jsx("span", { style: { fontSize: 8, color: 'var(--text-muted)' }, children: "\u25BC" })] }), PickerDropdown] }), LiveDot] })] }));
}
