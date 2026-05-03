import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../api/client';
import { useDriverTheme } from '../hooks/useDriverTheme';
export default function ClaimModal({ driverName, onClose, onClaimed }) {
    const [step, setStep] = useState('confirm');
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [color, setColor] = useState('#cc0000');
    const [tagline, setTagline] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const { selectDriver, drivers } = useDriverTheme();
    const handlePinNext = () => {
        if (!/^\d{4}$/.test(pin)) {
            setError('PIN must be 4 digits');
            return;
        }
        if (pin !== pinConfirm) {
            setError('PINs do not match');
            return;
        }
        setError('');
        setStep('customize');
    };
    const handleClaim = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await api.claimDriver(driverName, pin, color, tagline);
            if (!res.ok) {
                const body = await res.json();
                setError(body.error ?? 'Failed to claim');
                setSaving(false);
                return;
            }
            // Mark as claimed in localStorage
            const driver = drivers.find(d => d.name === driverName);
            selectDriver(driver ? { ...driver, color, claimed: 1 } : { name: driverName, color, tagline, claimed: 1, total_laps: 0, valid_laps: 0, best_lap_ms: null, track_count: 0 });
            onClaimed();
        }
        catch {
            setError('Network error');
        }
        setSaving(false);
    };
    const initials = driverName.slice(0, 2).toUpperCase();
    return (_jsx("div", { style: {
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
        }, onClick: e => { if (e.target === e.currentTarget)
            onClose(); }, children: _jsxs("div", { style: {
                background: 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
                border: '1px solid #2a2a2a',
                borderTop: `3px solid ${color}`,
                width: 420, padding: 32,
                position: 'relative',
                boxShadow: `0 0 60px ${color}22`,
            }, children: [_jsx("div", { style: { display: 'flex', gap: 4, marginBottom: 28 }, children: ['confirm', 'pin', 'customize'].map((s, i) => (_jsx("div", { style: {
                            flex: 1, height: 2,
                            background: step === s || (i === 0 && step !== 'confirm') || (i === 1 && step === 'customize')
                                ? color : '#222',
                            transition: 'background 0.3s',
                        } }, s))) }), step === 'confirm' && (_jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, letterSpacing: '0.08em', color, marginBottom: 8 }, children: "IS THIS YOU?" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }, children: [_jsx("div", { style: {
                                        width: 64, height: 64, borderRadius: 2,
                                        background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}55)`,
                                        border: `2px solid ${color}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: '#fff',
                                        boxShadow: `0 0 20px ${color}66`,
                                    }, children: initials }), _jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.05em' }, children: driverName.toUpperCase() }), _jsx("div", { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }, children: "Claiming this driver will let you customize your profile and track your personal stats." })] })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: () => setStep('pin'), style: {
                                        flex: 1, padding: '12px', fontFamily: 'var(--font-display)', fontSize: 12,
                                        fontWeight: 700, letterSpacing: '0.1em',
                                        background: `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                                        color: '#fff', border: 'none', cursor: 'pointer',
                                        boxShadow: `0 0 16px ${color}66`,
                                    }, children: "YES, THAT'S ME \u2192" }), _jsx("button", { onClick: onClose, style: {
                                        padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11,
                                        color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                                        border: '1px solid #333', cursor: 'pointer',
                                    }, children: "CANCEL" })] })] })), step === 'pin' && (_jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, letterSpacing: '0.08em', color, marginBottom: 8 }, children: "SET YOUR PIN" }), _jsx("div", { style: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }, children: "Choose a 4-digit PIN. You'll need it to update your profile later." }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 6 }, children: "4-DIGIT PIN" }), _jsx("input", { type: "password", inputMode: "numeric", maxLength: 4, value: pin, onChange: e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }, placeholder: "\u2022\u2022\u2022\u2022", style: { width: '100%', fontSize: 24, letterSpacing: '0.3em', textAlign: 'center', padding: '10px' }, autoFocus: true })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 6 }, children: "CONFIRM PIN" }), _jsx("input", { type: "password", inputMode: "numeric", maxLength: 4, value: pinConfirm, onChange: e => { setPinConfirm(e.target.value.replace(/\D/g, '')); setError(''); }, placeholder: "\u2022\u2022\u2022\u2022", onKeyDown: e => e.key === 'Enter' && handlePinNext(), style: { width: '100%', fontSize: 24, letterSpacing: '0.3em', textAlign: 'center', padding: '10px' } })] })] }), error && _jsx("div", { style: { color: 'var(--red)', fontSize: 11, fontFamily: 'var(--font-display)', marginBottom: 12, letterSpacing: '0.05em' }, children: error }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: handlePinNext, style: {
                                        flex: 1, padding: '12px', fontFamily: 'var(--font-display)', fontSize: 12,
                                        fontWeight: 700, letterSpacing: '0.1em',
                                        background: `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                                        color: '#fff', border: 'none', cursor: 'pointer',
                                    }, children: "NEXT \u2192" }), _jsx("button", { onClick: () => setStep('confirm'), style: {
                                        padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11,
                                        color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                                        border: '1px solid #333', cursor: 'pointer',
                                    }, children: "\u2190 BACK" })] })] })), step === 'customize' && (_jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, letterSpacing: '0.08em', color, marginBottom: 8 }, children: "MAKE IT YOURS" }), _jsx("div", { style: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }, children: "Pick a color \u2014 it'll theme the whole site when you're logged in." }), _jsxs("div", { style: {
                                display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
                                padding: 16, background: '#0a0a0a', border: `1px solid ${color}44`,
                                borderLeft: `3px solid ${color}`,
                            }, children: [_jsx("div", { style: {
                                        width: 52, height: 52, borderRadius: 2,
                                        background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}55)`,
                                        border: `2px solid ${color}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: '#fff',
                                        boxShadow: `0 0 16px ${color}66`, transition: 'all 0.2s',
                                    }, children: initials }), _jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color, transition: 'color 0.2s' }, children: driverName.toUpperCase() }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }, children: tagline || 'Enter your tagline below...' })] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 8 }, children: "YOUR COLOR" }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [['#cc0000', '#00aaff', '#00cc44', '#ff8800', '#aa00ff', '#ff006e', '#00cccc', '#ffffff'].map(c => (_jsx("div", { onClick: () => setColor(c), style: {
                                                        width: 32, height: 32, borderRadius: 2, cursor: 'pointer',
                                                        background: c, border: color === c ? `2px solid #fff` : '2px solid transparent',
                                                        boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                                                        transition: 'all 0.15s',
                                                    } }, c))), _jsx("input", { type: "color", value: color, onChange: e => setColor(e.target.value), style: { width: 32, height: 32, padding: 2, border: '1px solid #444', cursor: 'pointer', background: '#111', borderRadius: 2 } })] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 6 }, children: "TAGLINE (OPTIONAL)" }), _jsx("input", { type: "text", value: tagline, onChange: e => setTagline(e.target.value), placeholder: "Your racing motto...", maxLength: 60, style: { width: '100%' } })] })] }), error && _jsx("div", { style: { color: 'var(--red)', fontSize: 11, fontFamily: 'var(--font-display)', marginBottom: 12 }, children: error }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: handleClaim, disabled: saving, style: {
                                        flex: 1, padding: '12px', fontFamily: 'var(--font-display)', fontSize: 12,
                                        fontWeight: 700, letterSpacing: '0.1em',
                                        background: saving ? '#333' : `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                                        color: '#fff', border: 'none', cursor: saving ? 'default' : 'pointer',
                                        boxShadow: saving ? 'none' : `0 0 16px ${color}66`,
                                    }, children: saving ? 'CLAIMING...' : 'CLAIM MY PROFILE ✓' }), _jsx("button", { onClick: () => setStep('pin'), style: {
                                        padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11,
                                        color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                                        border: '1px solid #333', cursor: 'pointer',
                                    }, children: "\u2190 BACK" })] })] }))] }) }));
}
