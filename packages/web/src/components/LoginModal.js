import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useDriverTheme } from '../hooks/useDriverTheme';
export default function LoginModal({ onClose }) {
    const [drivers, setDrivers] = useState([]);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useDriverTheme();
    const navigate = useNavigate();
    useEffect(() => {
        api.allDrivers().then(d => setDrivers(d.filter(x => x.claimed)));
    }, []);
    const handleSubmit = async () => {
        if (!name) {
            setError('Select your driver');
            return;
        }
        if (!/^\d{4}$/.test(pin)) {
            setError('Enter your 4-digit PIN');
            return;
        }
        setLoading(true);
        setError('');
        const result = await api.verifyPin(name, pin);
        if (!result.ok) {
            setError('Incorrect PIN');
            setLoading(false);
            return;
        }
        const driver = drivers.find(d => d.name === name);
        login(name, driver?.color ?? '#cc0000');
        onClose();
        navigate(`/drivers/${encodeURIComponent(name)}`);
    };
    return (_jsx("div", { style: {
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
        }, onClick: e => { if (e.target === e.currentTarget)
            onClose(); }, children: _jsxs("div", { style: {
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderTop: '2px solid var(--accent)',
                borderRadius: 8,
                padding: '32px 28px',
                width: '100%', maxWidth: 360,
                boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
            }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("div", { style: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 6 }, children: "SIGN IN" }), _jsx("div", { style: { fontSize: 13, color: 'var(--text-muted)' }, children: "Select your driver and enter your PIN." })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }, children: "Driver" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsxs("select", { value: name, onChange: e => { setName(e.target.value); setError(''); }, style: { width: '100%', paddingRight: 32 }, children: [_jsx("option", { value: "", children: "Select your name..." }), drivers.map(d => (_jsx("option", { value: d.name, children: d.name }, d.name)))] }), _jsx("span", { style: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 10 }, children: "\u25BC" })] }), drivers.length === 0 && (_jsx("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }, children: "No claimed drivers yet \u2014 race first, then use \"This is me!\" on your lap." }))] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }, children: "PIN" }), _jsx("input", { type: "password", inputMode: "numeric", maxLength: 4, value: pin, onChange: e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }, onKeyDown: e => e.key === 'Enter' && handleSubmit(), placeholder: "\u2022\u2022\u2022\u2022", autoFocus: !!name, style: { width: '100%', fontSize: 22, letterSpacing: '0.3em', textAlign: 'center', padding: '10px' } })] })] }), error && (_jsx("div", { style: { fontSize: 12, color: 'var(--red)', marginBottom: 14, fontWeight: 500 }, children: error })), _jsx("button", { onClick: handleSubmit, disabled: loading, style: {
                        width: '100%', padding: '12px',
                        background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
                        color: loading ? 'var(--text-muted)' : '#fff',
                        border: 'none', borderRadius: 4,
                        fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
                        cursor: loading ? 'default' : 'pointer',
                    }, children: loading ? 'Signing in...' : 'Sign In →' }), _jsxs("div", { style: { marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }, children: ["New here? Race first \u2014 your name will appear in the lap feed with a ", _jsx("strong", { style: { color: 'var(--text-secondary)' }, children: "\"This is me!\"" }), " button."] })] }) }));
}
