import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveStore } from '../../store/liveStore';
import { useDriverTheme } from '../../hooks/useDriverTheme';
export default function NavBar() {
    const { isConnected, acStatus } = useLiveStore();
    const { drivers, selected, selectDriver } = useDriverTheme();
    const [pickerOpen, setPickerOpen] = useState(false);
    const navigate = useNavigate();
    const pickerRef = useRef(null);
    // Close picker on outside click
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
    return (_jsxs("header", { style: {
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 54,
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }, children: [_jsx("div", { style: {
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: accentColor,
                    transition: 'background 0.4s',
                } }), _jsxs("span", { style: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, marginRight: 24, letterSpacing: '0.06em', userSelect: 'none' }, children: [_jsx("span", { className: "chrome", children: "LAP" }), _jsx("span", { style: { color: 'var(--accent)', transition: 'color 0.4s' }, children: "TRACKER" }), _jsx("span", { style: { color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }, children: "9000" })] }), _jsx("nav", { style: { display: 'flex', gap: 2 }, children: [
                    { to: '/live', label: 'Live', end: false },
                    { to: '/history', label: 'History', end: false },
                    { to: '/leaderboard', label: 'Leaderboard', end: false },
                    { to: '/drivers', label: 'Drivers', end: false },
                ].map(({ to, label, end }) => (_jsx(NavLink, { to: to, end: end, style: ({ isActive }) => ({
                        padding: '6px 14px',
                        fontSize: 13, fontWeight: 600,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        borderBottom: isActive ? `2px solid var(--accent)` : '2px solid transparent',
                        transition: 'color 0.15s',
                        textDecoration: 'none',
                        display: 'block',
                    }), children: label }, to))) }), _jsxs("div", { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }, children: [acStatus && acStatus.clients > 0 && (_jsxs("span", { className: "tag", children: [_jsx("span", { className: "dot dot-red" }), acStatus.clients, " ON TRACK"] })), _jsxs("div", { ref: pickerRef, style: { position: 'relative', display: 'flex', alignItems: 'center', gap: 0 }, children: [selected && (_jsx("button", { onClick: () => navigate(`/drivers/${encodeURIComponent(selected.name)}`), title: "Go to your profile", style: {
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 32, height: 32,
                                    background: `radial-gradient(circle at 35% 35%, ${selected.color}cc, ${selected.color}55)`,
                                    border: `1px solid ${selected.color}`,
                                    borderRight: 'none',
                                    borderRadius: 0, cursor: 'pointer',
                                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11, color: '#fff',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                                    transition: 'box-shadow 0.15s',
                                }, onMouseEnter: e => (e.currentTarget.style.boxShadow = `0 0 10px ${selected.color}88`), onMouseLeave: e => (e.currentTarget.style.boxShadow = 'none'), children: selected.name.slice(0, 2).toUpperCase() })), _jsxs("button", { onClick: () => setPickerOpen(o => !o), style: {
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '5px 10px',
                                    background: 'var(--bg-elevated)',
                                    border: `1px solid ${selected ? accentColor + '66' : 'var(--border-bright)'}`,
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    height: 32,
                                }, children: [selected ? (_jsx("span", { style: { fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }, children: selected.name.toUpperCase() })) : (_jsx("span", { style: { fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)' }, children: "WHO ARE YOU?" })), _jsx("span", { style: { fontSize: 8, color: 'var(--text-muted)' }, children: "\u25BC" })] }), pickerOpen && (_jsxs("div", { style: {
                                    position: 'absolute', right: 0, top: '100%', marginTop: 4,
                                    background: '#0f0f0f',
                                    border: '1px solid #2a2a2a',
                                    borderTop: `2px solid var(--accent)`,
                                    minWidth: 180, zIndex: 200,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                                }, children: [drivers.map(d => (_jsxs("button", { onClick: () => { selectDriver(d); setPickerOpen(false); }, style: {
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            width: '100%', padding: '10px 14px',
                                            background: selected?.name === d.name ? `${d.color}18` : 'transparent',
                                            borderBottom: '1px solid #1a1a1a',
                                            borderLeft: selected?.name === d.name ? `2px solid ${d.color}` : '2px solid transparent',
                                            cursor: 'pointer', textAlign: 'left',
                                            transition: 'background 0.1s',
                                        }, onMouseEnter: e => (e.currentTarget.style.background = `${d.color}18`), onMouseLeave: e => (e.currentTarget.style.background = selected?.name === d.name ? `${d.color}18` : 'transparent'), children: [_jsx("div", { style: {
                                                    width: 28, height: 28, borderRadius: 2, flexShrink: 0,
                                                    background: `radial-gradient(circle at 35% 35%, ${d.color}cc, ${d.color}55)`,
                                                    border: `1px solid ${d.color}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 11, color: '#fff',
                                                    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                                                }, children: d.name.slice(0, 2).toUpperCase() }), _jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-primary)' }, children: d.name }), d.tagline && (_jsx("div", { style: { fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }, children: d.tagline }))] }), selected?.name === d.name && (_jsx("span", { style: { marginLeft: 'auto', fontSize: 10, color: d.color }, children: "\u2713" }))] }, d.name))), selected && (_jsxs("div", { style: { borderTop: '1px solid #1a1a1a' }, children: [_jsxs("button", { onClick: () => { navigate(`/drivers/${encodeURIComponent(selected.name)}`); setPickerOpen(false); }, style: {
                                                    width: '100%', padding: '9px 14px', textAlign: 'left',
                                                    fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.08em',
                                                    color: 'var(--accent-hot)', cursor: 'pointer', background: 'transparent',
                                                    display: 'flex', alignItems: 'center', gap: 8,
                                                }, children: [_jsx("span", { style: { fontSize: 12 }, children: "\u270E" }), " EDIT MY PROFILE"] }), _jsx("button", { onClick: () => { selectDriver(null); setPickerOpen(false); }, style: {
                                                    width: '100%', padding: '8px 14px', textAlign: 'center',
                                                    fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.1em',
                                                    color: '#333', cursor: 'pointer', background: 'transparent',
                                                    borderTop: '1px solid #111',
                                                }, children: "RESET THEME" })] })), drivers.length === 0 && (_jsx("div", { style: { padding: '12px 14px', fontSize: 10, color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }, children: "NO DRIVERS YET" }))] }))] }), _jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--text-muted)' }, children: [_jsx("span", { className: `dot ${isConnected ? 'dot-green' : 'dot-grey'}` }), isConnected ? 'LIVE' : 'CONNECTING'] })] })] }));
}
