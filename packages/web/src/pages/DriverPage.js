import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatLapTime, trackDisplayName } from '../api/client';
import { useDriverTheme } from '../hooks/useDriverTheme';
import { useIsMobile } from '../hooks/useBreakpoint';
import SessionProgressChart from '../components/charts/SessionProgressChart';
// ── Progression section with track + car selectors ───────────────────────────
function ProgressionSection({ driverName, trackBests, color }) {
    const [selectedTrack, setSelectedTrack] = useState(trackBests[0]?.track ?? '');
    const [selectedCar, setSelectedCar] = useState('');
    const [sessions, setSessions] = useState([]);
    useEffect(() => {
        if (!selectedTrack)
            return;
        api.driverTrackHistory(driverName, selectedTrack).then(data => {
            setSessions(data);
            setSelectedCar(''); // reset car filter when track changes
        });
    }, [selectedTrack, driverName]);
    const cars = [...new Set(sessions.map(s => s.best_car).filter(Boolean))];
    const filtered = selectedCar ? sessions.filter(s => s.best_car === selectedCar) : sessions;
    if (filtered.length < 2)
        return null;
    return (_jsxs("div", { className: "card", style: { padding: '14px 16px 10px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }, children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }, children: "Progression" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("select", { value: selectedTrack, onChange: e => setSelectedTrack(e.target.value), style: { fontSize: 12, fontWeight: 600, paddingRight: 24, paddingLeft: 10, height: 28 }, children: trackBests.map(t => (_jsx("option", { value: t.track, children: trackDisplayName(t.track) }, t.track))) }), _jsx("span", { style: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 9 }, children: "\u25BC" })] }), cars.length > 1 && (_jsxs("div", { style: { position: 'relative' }, children: [_jsxs("select", { value: selectedCar, onChange: e => setSelectedCar(e.target.value), style: { fontSize: 12, paddingRight: 24, paddingLeft: 10, height: 28 }, children: [_jsx("option", { value: "", children: "All Cars" }), cars.map(c => (_jsx("option", { value: c, children: c.replace(/_/g, ' ') }, c)))] }), _jsx("span", { style: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 9 }, children: "\u25BC" })] })), _jsxs("span", { style: { fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }, children: [filtered.length, " session", filtered.length !== 1 ? 's' : ''] })] }), _jsx(SessionProgressChart, { sessions: filtered, height: 110, accentColor: color })] }));
}
export default function DriverPage() {
    const { name } = useParams();
    const { me, refreshColor } = useDriverTheme();
    const [profile, setProfile] = useState(null);
    const [color, setColor] = useState('#cc0000');
    const [tagline, setTagline] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [notFound, setNotFound] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const decodedName = name ? decodeURIComponent(name) : '';
    const isMyProfile = me?.name === decodedName && me?.claimed;
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
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }, children: [showEditModal && (_jsx("div", { style: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }, onClick: e => { if (e.target === e.currentTarget)
                    setShowEditModal(false); }, children: _jsxs("div", { style: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderTop: `3px solid ${color}`, borderRadius: 10, padding: '28px 24px', width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }, children: [_jsx("div", { style: { fontSize: 16, fontWeight: 700, color: color, marginBottom: 20 }, children: "Edit Profile" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }, children: "Color" }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [['#cc0000', '#00aaff', '#00cc44', '#ff8800', '#aa00ff', '#ff006e', '#00cccc', '#ffffff'].map(c => (_jsx("div", { onClick: () => setColor(c), style: { width: 28, height: 28, borderRadius: 4, cursor: 'pointer', background: c, border: color === c ? '2px solid #fff' : '2px solid transparent', boxShadow: color === c ? `0 0 8px ${c}` : 'none' } }, c))), _jsx("input", { type: "color", value: color, onChange: e => setColor(e.target.value), style: { width: 28, height: 28, padding: 2, border: '1px solid #444', cursor: 'pointer', background: '#111', borderRadius: 4 } })] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }, children: "Tagline" }), _jsx("input", { type: "text", value: tagline, onChange: e => setTagline(e.target.value), placeholder: "Your racing motto...", maxLength: 60, style: { width: '100%' } })] }), (showPin || saving) ? (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }, children: "PIN" }), _jsx("input", { type: "password", inputMode: "numeric", maxLength: 4, value: pin, onChange: e => { setPin(e.target.value.replace(/\D/g, '')); setSaveError(''); }, onKeyDown: e => e.key === 'Enter' && handleSave(), placeholder: "\u2022\u2022\u2022\u2022", style: { width: '100%', textAlign: 'center', letterSpacing: '0.3em', fontSize: 20 }, autoFocus: true }), saveError && _jsx("div", { style: { fontSize: 11, color: 'var(--red)', marginTop: 6 }, children: saveError })] })) : null] }), _jsxs("div", { style: { display: 'flex', gap: 8, marginTop: 20 }, children: [_jsx("button", { onClick: showPin ? handleSave : () => setShowPin(true), disabled: saving, style: { flex: 1, padding: '10px', fontSize: 13, fontWeight: 700, background: saving ? '#333' : color, color: '#fff', border: 'none', borderRadius: 6, cursor: saving ? 'default' : 'pointer' }, children: saving ? 'Saving...' : saved ? '✓ Saved' : showPin ? 'Confirm' : 'Save Changes' }), _jsx("button", { onClick: () => { setShowEditModal(false); setShowPin(false); setPin(''); setSaveError(''); }, style: { padding: '10px 16px', fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }, children: "Cancel" })] })] }) })), _jsxs("div", { style: {
                    flexShrink: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${color}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    boxShadow: `0 2px 12px rgba(0,0,0,0.3)`,
                }, children: [_jsx("div", { style: {
                            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                            background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}55)`,
                            border: `2px solid ${color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: '#fff',
                        }, children: profile.name.slice(0, 2).toUpperCase() }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontSize: 18, fontWeight: 800, color, letterSpacing: '0.03em', lineHeight: 1.2 }, children: profile.name }), profile.tagline && (_jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: profile.tagline }))] }), _jsx("div", { style: { display: 'flex', gap: 20, flexShrink: 0 }, children: [
                            { label: 'Laps', value: String(stats.total_laps) },
                            { label: 'Tracks', value: String(stats.track_count) },
                            { label: 'Best', value: stats.best_lap_ms ? formatLapTime(stats.best_lap_ms) : '—' },
                        ].map(s => (_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 2 }, children: s.label }), _jsx("div", { style: { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }, children: s.value })] }, s.label))) }), isMyProfile && (_jsx("button", { onClick: () => setShowEditModal(true), style: {
                            padding: '7px 14px', fontSize: 12, fontWeight: 600,
                            background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                            border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
                        }, onMouseEnter: e => { (e.currentTarget.style.borderColor = color); (e.currentTarget.style.color = color); }, onMouseLeave: e => { (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.color = 'var(--text-secondary)'); }, children: "Edit" }))] }), trackBests.length > 0 && (_jsx("div", { style: { flexShrink: 0 }, children: _jsx(ProgressionSection, { driverName: decodedName, trackBests: trackBests, color: color }) })), _jsxs("div", { style: { flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', minHeight: 0 }, children: [_jsx("div", { className: "section-label", style: { flexShrink: 0 }, children: "Track Records" }), _jsx("div", { className: "card", style: { flex: 1, minHeight: 0, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', overflowY: 'auto' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "TRACK" }), _jsx("th", { children: "BEST TIME" }), _jsx("th", { children: "CAR" })] }) }), _jsxs("tbody", { children: [trackBests.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 3, style: { textAlign: 'center', padding: 24, color: '#222', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em' }, children: "NO VALID LAPS" }) })), trackBests.map((t, i) => (_jsxs("tr", { style: { borderLeft: i === 0 ? `2px solid ${color}` : '2px solid transparent' }, children: [_jsx("td", { style: { fontWeight: 600, fontSize: 13 }, children: trackDisplayName(t.track) }), _jsx("td", { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: i === 0 ? color : 'var(--chrome-light)' }, children: formatLapTime(t.best_ms) }), _jsx("td", { style: { fontSize: 10, color: 'var(--text-muted)' }, children: t.car_model.replace(/_/g, ' ') })] }, t.track)))] })] }) }) })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', minHeight: 0 }, children: [_jsx("div", { className: "section-label", style: { flexShrink: 0 }, children: "Recent Sessions" }), _jsx("div", { className: "card", style: { flex: 1, minHeight: 0, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', overflowY: 'auto' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "TRACK" }), _jsx("th", { children: "TYPE" }), _jsx("th", { children: "BEST" }), _jsx("th", { children: "LAPS" })] }) }), _jsxs("tbody", { children: [recentSessions.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, style: { textAlign: 'center', padding: 24, color: '#222', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em' }, children: "NO SESSIONS" }) })), recentSessions.map(s => (_jsxs("tr", { children: [_jsx("td", { children: _jsx(Link, { to: `/history/${s.id}`, style: { fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none' }, onMouseEnter: e => (e.currentTarget.style.color = color), onMouseLeave: e => (e.currentTarget.style.color = 'var(--text-secondary)'), children: trackDisplayName(s.track) }) }), _jsx("td", { children: _jsx("span", { className: `badge badge-${s.session_type.toLowerCase()}`, children: s.session_type }) }), _jsx("td", { style: { fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--chrome-light)' }, children: s.best_ms ? formatLapTime(s.best_ms) : '—' }), _jsx("td", { style: { fontSize: 11, color: 'var(--text-muted)' }, children: s.lap_count })] }, s.id)))] })] }) }) })] })] })] }));
}
