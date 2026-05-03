import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, DriverSummary } from '../api/client';
import { useDriverTheme } from '../hooks/useDriverTheme';

interface Props { onClose: () => void; }

export default function LoginModal({ onClose }: Props) {
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
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
    if (!name) { setError('Select your driver'); return; }
    if (!/^\d{4}$/.test(pin)) { setError('Enter your 4-digit PIN'); return; }
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderTop: '2px solid var(--accent)',
        borderRadius: 8,
        padding: '32px 28px',
        width: '100%', maxWidth: 360,
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 6 }}>
            SIGN IN
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Select your driver and enter your PIN.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {/* Driver select */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Driver</div>
            <div style={{ position: 'relative' }}>
              <select
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                style={{ width: '100%', paddingRight: 32 }}
              >
                <option value="">Select your name...</option>
                {drivers.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 10 }}>▼</span>
            </div>
            {drivers.length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                No claimed drivers yet — race first, then use "This is me!" on your lap.
              </div>
            )}
          </div>

          {/* PIN */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>PIN</div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••"
              autoFocus={!!name}
              style={{ width: '100%', fontSize: 22, letterSpacing: '0.3em', textAlign: 'center', padding: '10px' }}
            />
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 14, fontWeight: 500 }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : '#fff',
            border: 'none', borderRadius: 4,
            fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          New here? Race first — your name will appear in the lap feed with a <strong style={{ color: 'var(--text-secondary)' }}>"This is me!"</strong> button.
        </div>
      </div>
    </div>
  );
}
