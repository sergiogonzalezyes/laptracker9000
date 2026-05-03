import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatLapTime, trackDisplayName } from '../api/client';
import { useDriverTheme } from '../hooks/useDriverTheme';
import { useIsMobile } from '../hooks/useBreakpoint';
export default function DriverPage() {
    const { name } = useParams();
    const { selected, refreshColor } = useDriverTheme();
    const [profile, setProfile] = useState(null);
    const [color, setColor] = useState('#cc0000');
    const [tagline, setTagline] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [notFound, setNotFound] = useState(false);
    const decodedName = name ? decodeURIComponent(name) : '';
    const isMyProfile = selected?.name === decodedName && selected?.claimed;
    const isMobile = useIsMobile();
    useEffect(() => {
        if (!name)
            return;
        api.driverProfile(decodedName)
            .then(p => {
            setProfile(p);
            setColor(p.color || '#cc0000');
            setTagline(p.tagline || '');
        })
            .catch(() => setNotFound(true));
    }, [name]);
    const handleSave = async () => {
        if (!name)
            return;
        if (!pin || !/^\d{4}$/.test(pin)) {
            setSaveError('Enter your 4-digit PIN');
            setShowPin(true);
            return;
        }
        setSaving(true);
        setSaveError('');
        const res = await api.updateDriverProfile(decodedName, pin, color, tagline);
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setSaveError(body.error ?? 'Incorrect PIN');
            setSaving(false);
            return;
        }
        setSaving(false);
        setSaved(true);
        setPin('');
        setShowPin(false);
        setTimeout(() => setSaved(false), 2000);
        refreshColor(decodedName, color);
        api.driverProfile(decodedName).then(setProfile);
    };
    if (notFound)
        return (_jsxs("div", { style: { textAlign: 'center', padding: '80px 0' }, children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 14, color: '#333', letterSpacing: '0.15em' }, children: "DRIVER NOT FOUND" }), _jsx(Link, { to: "/leaderboard", style: { color: 'var(--accent)', fontSize: 12, marginTop: 12, display: 'block' }, children: "\u2190 Back to Leaderboard" })] }));
    if (!profile)
        return (_jsx("div", { style: { textAlign: 'center', padding: '80px 0', color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 11 }, children: "LOADING..." }));
    const { stats, favCar, trackBests, recentSessions } = profile;
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsxs("div", { style: {
                    background: 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
                    border: '1px solid #222',
                    borderTop: `3px solid ${color}`,
                    borderRadius: 4,
                    padding: '24px 28px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 20,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 0 40px ${color}22`,
                }, children: [_jsx("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)` } }), _jsxs("div", { style: { position: 'relative', flexShrink: 0 }, children: [_jsx("div", { style: {
                                    width: 72, height: 72,
                                    background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}66)`,
                                    borderRadius: 2,
                                    border: `2px solid ${color}`,
                                    boxShadow: `0 0 20px ${color}88`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22,
                                    color: '#fff',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                }, children: profile.name.slice(0, 2).toUpperCase() }), _jsx("input", { type: "color", value: color, onChange: e => setColor(e.target.value), title: "Pick your driver color", style: {
                                    position: 'absolute', bottom: -6, right: -6,
                                    width: 24, height: 24,
                                    border: '1px solid #444',
                                    borderRadius: 2, cursor: 'pointer',
                                    padding: 0, background: 'none',
                                } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 28, fontWeight: 900,
                                    letterSpacing: '0.05em',
                                    color: color,
                                    textShadow: `0 0 20px ${color}88`,
                                    marginBottom: 6,
                                }, children: profile.name.toUpperCase() }), _jsx("input", { type: "text", value: tagline, onChange: e => setTagline(e.target.value), placeholder: "Enter your tagline...", maxLength: 60, style: { width: '100%', maxWidth: 380, fontSize: 13, color: 'var(--text-secondary)', background: 'transparent', border: 'none', borderBottom: '1px solid #333', borderRadius: 0, padding: '4px 0', outline: 'none' }, onFocus: e => (e.target.style.borderBottomColor = color), onBlur: e => (e.target.style.borderBottomColor = '#333') }), isMyProfile && (_jsxs("div", { style: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }, children: [(showPin || saving) && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { type: "password", inputMode: "numeric", maxLength: 4, value: pin, onChange: e => { setPin(e.target.value.replace(/\D/g, '')); setSaveError(''); }, placeholder: "PIN", onKeyDown: e => e.key === 'Enter' && handleSave(), style: { width: 80, textAlign: 'center', letterSpacing: '0.2em', fontSize: 16, padding: '5px 8px' }, autoFocus: true }), saveError && _jsx("span", { style: { fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-display)' }, children: saveError })] })), _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [_jsx("button", { onClick: showPin ? handleSave : () => setShowPin(true), disabled: saving, style: {
                                                    fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
                                                    letterSpacing: '0.1em', padding: '6px 16px',
                                                    background: saving ? '#333' : `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                                                    color: '#fff', border: 'none', borderRadius: 0,
                                                    clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
                                                    cursor: saving ? 'default' : 'pointer',
                                                    boxShadow: saving ? 'none' : `0 0 12px ${color}66`,
                                                }, children: saving ? 'SAVING...' : saved ? '✓ SAVED' : showPin ? 'CONFIRM SAVE' : 'SAVE PROFILE' }), !showPin && (_jsx("span", { style: { fontSize: 10, color: '#333', fontFamily: 'var(--font-display)' }, children: "Click the color swatch to change" }))] })] })), !isMyProfile && profile?.claimed && (_jsx("div", { style: { marginTop: 12, fontSize: 10, color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }, children: "SELECT THIS DRIVER FROM THE MENU TO EDIT" }))] }), _jsx("div", { style: { display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap' }, children: [
                            { label: 'LAPS', value: String(stats.total_laps) },
                            { label: 'TRACKS', value: String(stats.track_count) },
                            { label: 'BEST', value: stats.best_lap_ms ? formatLapTime(stats.best_lap_ms) : '—', mono: true },
                        ].map(s => (_jsxs("div", { style: { padding: '8px 16px', background: '#0a0a0a', border: '1px solid #1a1a1a', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 4 }, children: s.label }), _jsx("div", { style: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--chrome-light)', letterSpacing: '0.03em' }, children: s.value })] }, s.label))) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }, children: [_jsxs("div", { children: [_jsx("div", { className: "section-label", children: "Track Records" }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "TRACK" }), _jsx("th", { children: "BEST TIME" }), _jsx("th", { children: "CAR" })] }) }), _jsxs("tbody", { children: [trackBests.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 3, style: { textAlign: 'center', padding: 24, color: '#222', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em' }, children: "NO VALID LAPS" }) })), trackBests.map((t, i) => (_jsxs("tr", { style: { borderLeft: i === 0 ? `2px solid ${color}` : '2px solid transparent' }, children: [_jsx("td", { style: { fontWeight: 600, fontSize: 13 }, children: trackDisplayName(t.track) }), _jsx("td", { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: i === 0 ? color : 'var(--chrome-light)' }, children: formatLapTime(t.best_ms) }), _jsx("td", { style: { fontSize: 10, color: 'var(--text-muted)' }, children: t.car_model.replace(/_/g, ' ') })] }, t.track)))] })] }) })] }), _jsxs("div", { children: [_jsx("div", { className: "section-label", children: "Recent Sessions" }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "TRACK" }), _jsx("th", { children: "TYPE" }), _jsx("th", { children: "BEST" }), _jsx("th", { children: "LAPS" })] }) }), _jsxs("tbody", { children: [recentSessions.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, style: { textAlign: 'center', padding: 24, color: '#222', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em' }, children: "NO SESSIONS" }) })), recentSessions.map(s => (_jsxs("tr", { children: [_jsx("td", { children: _jsx(Link, { to: `/history/${s.id}`, style: { fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none' }, onMouseEnter: e => (e.currentTarget.style.color = color), onMouseLeave: e => (e.currentTarget.style.color = 'var(--text-secondary)'), children: trackDisplayName(s.track) }) }), _jsx("td", { children: _jsx("span", { className: `badge badge-${s.session_type.toLowerCase()}`, children: s.session_type }) }), _jsx("td", { style: { fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--chrome-light)' }, children: s.best_ms ? formatLapTime(s.best_ms) : '—' }), _jsx("td", { style: { fontSize: 11, color: 'var(--text-muted)' }, children: s.lap_count })] }, s.id)))] })] }) })] })] }), favCar && (_jsxs("div", { style: { textAlign: 'center', fontSize: 11, color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }, children: ["FAVORITE CAR: ", _jsx("span", { style: { color: 'var(--text-muted)' }, children: favCar.replace(/_/g, ' ').toUpperCase() })] }))] }));
}
