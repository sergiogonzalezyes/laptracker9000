import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatLapTime } from '../api/client';
export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    useEffect(() => { api.allDrivers().then(setDrivers); }, []);
    if (drivers.length === 0)
        return (_jsx("div", { style: { textAlign: 'center', padding: '80px 0', color: '#222', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 12 }, children: "NO DRIVERS YET" }));
    return (_jsx("div", { children: _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 10 }, children: drivers.map(d => (_jsx(Link, { to: `/drivers/${encodeURIComponent(d.name)}`, style: { textDecoration: 'none' }, children: _jsxs("div", { style: {
                        background: 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
                        border: `1px solid #222`,
                        borderTop: `1px solid #333`,
                        borderLeft: `3px solid ${d.color || '#cc0000'}`,
                        borderRadius: 4,
                        padding: '16px 18px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.15s',
                        boxShadow: 'none',
                    }, onMouseEnter: e => {
                        const el = e.currentTarget;
                        el.style.boxShadow = `0 0 16px ${d.color || '#cc0000'}33`;
                        el.style.borderColor = d.color || '#cc0000';
                    }, onMouseLeave: e => {
                        const el = e.currentTarget;
                        el.style.boxShadow = 'none';
                        el.style.borderColor = '#222';
                        el.style.borderLeftColor = d.color || '#cc0000';
                    }, children: [_jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${d.color || '#cc0000'}, transparent)`, opacity: 0.5 } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }, children: [_jsx("div", { style: {
                                        width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                                        background: `radial-gradient(circle at 35% 35%, ${d.color || '#cc0000'}cc, ${d.color || '#cc0000'}55)`,
                                        border: `1px solid ${d.color || '#cc0000'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: '#fff',
                                        textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                                    }, children: d.name.slice(0, 2).toUpperCase() }), _jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.05em', color: 'var(--text-primary)' }, children: d.name }), d.tagline && (_jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }, children: d.tagline }))] })] }), _jsx("div", { style: { display: 'flex', gap: 1 }, children: [
                                { label: 'LAPS', value: String(d.total_laps) },
                                { label: 'TRACKS', value: String(d.track_count) },
                                { label: 'BEST', value: d.best_lap_ms ? formatLapTime(d.best_lap_ms) : '—' },
                            ].map(s => (_jsxs("div", { style: { flex: 1, padding: '6px 8px', background: '#0a0a0a', border: '1px solid #181818', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 3 }, children: s.label }), _jsx("div", { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--chrome-light)' }, children: s.value })] }, s.label))) })] }) }, d.name))) }) }));
}
