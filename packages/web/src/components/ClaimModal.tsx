import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useDriverTheme } from '../hooks/useDriverTheme';

interface Props {
  driverName: string;
  onClose: () => void;
  onClaimed: (color: string) => void;
}

type Step = 'confirm' | 'pin' | 'customize';

export default function ClaimModal({ driverName, onClose, onClaimed }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('confirm');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [color, setColor] = useState('#cc0000');
  const [tagline, setTagline] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { login } = useDriverTheme();

  const handlePinNext = () => {
    if (!/^\d{4}$/.test(pin)) { setError('PIN must be 4 digits'); return; }
    if (pin !== pinConfirm) { setError('PINs do not match'); return; }
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
      login(driverName, color);
      onClaimed(color);
      navigate(`/drivers/${encodeURIComponent(driverName)}`);
    } catch {
      setError('Network error');
    }
    setSaving(false);
  };

  const initials = driverName.slice(0, 2).toUpperCase();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
        border: '1px solid #2a2a2a',
        borderTop: `3px solid ${color}`,
        width: 420, padding: 32,
        position: 'relative',
        boxShadow: `0 0 60px ${color}22`,
      }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          {(['confirm', 'pin', 'customize'] as Step[]).map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 2,
              background: step === s || (i === 0 && step !== 'confirm') || (i === 1 && step === 'customize')
                ? color : '#222',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, letterSpacing: '0.08em', color, marginBottom: 8 }}>
              IS THIS YOU?
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 2,
                background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}55)`,
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: '#fff',
                boxShadow: `0 0 20px ${color}66`,
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                  {driverName.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Claiming this driver will let you customize your profile and track your personal stats.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep('pin')} style={{
                flex: 1, padding: '12px', fontFamily: 'var(--font-display)', fontSize: 12,
                fontWeight: 700, letterSpacing: '0.1em',
                background: `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                color: '#fff', border: 'none', cursor: 'pointer',
                boxShadow: `0 0 16px ${color}66`,
              }}>
                YES, THAT'S ME →
              </button>
              <button onClick={onClose} style={{
                padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11,
                color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                border: '1px solid #333', cursor: 'pointer',
              }}>
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Step: PIN */}
        {step === 'pin' && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, letterSpacing: '0.08em', color, marginBottom: 8 }}>
              SET YOUR PIN
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
              Choose a 4-digit PIN. You'll need it to update your profile later.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 6 }}>
                  4-DIGIT PIN
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="••••"
                  style={{ width: '100%', fontSize: 24, letterSpacing: '0.3em', textAlign: 'center', padding: '10px' }}
                  autoFocus
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 6 }}>
                  CONFIRM PIN
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinConfirm}
                  onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="••••"
                  onKeyDown={e => e.key === 'Enter' && handlePinNext()}
                  style={{ width: '100%', fontSize: 24, letterSpacing: '0.3em', textAlign: 'center', padding: '10px' }}
                />
              </div>
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: 11, fontFamily: 'var(--font-display)', marginBottom: 12, letterSpacing: '0.05em' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handlePinNext} style={{
                flex: 1, padding: '12px', fontFamily: 'var(--font-display)', fontSize: 12,
                fontWeight: 700, letterSpacing: '0.1em',
                background: `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                color: '#fff', border: 'none', cursor: 'pointer',
              }}>
                NEXT →
              </button>
              <button onClick={() => setStep('confirm')} style={{
                padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11,
                color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                border: '1px solid #333', cursor: 'pointer',
              }}>
                ← BACK
              </button>
            </div>
          </div>
        )}

        {/* Step: Customize */}
        {step === 'customize' && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, letterSpacing: '0.08em', color, marginBottom: 8 }}>
              MAKE IT YOURS
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
              Pick a color — it'll theme the whole site when you're logged in.
            </div>

            {/* Preview */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
              padding: 16, background: '#0a0a0a', border: `1px solid ${color}44`,
              borderLeft: `3px solid ${color}`,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 2,
                background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}55)`,
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: '#fff',
                boxShadow: `0 0 16px ${color}66`, transition: 'all 0.2s',
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color, transition: 'color 0.2s' }}>
                  {driverName.toUpperCase()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tagline || 'Enter your tagline below...'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 8 }}>
                  YOUR COLOR
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['#cc0000','#00aaff','#00cc44','#ff8800','#aa00ff','#ff006e','#00cccc','#ffffff'].map(c => (
                    <div key={c} onClick={() => setColor(c)} style={{
                      width: 32, height: 32, borderRadius: 2, cursor: 'pointer',
                      background: c, border: color === c ? `2px solid #fff` : '2px solid transparent',
                      boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                      transition: 'all 0.15s',
                    }} />
                  ))}
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    style={{ width: 32, height: 32, padding: 2, border: '1px solid #444', cursor: 'pointer', background: '#111', borderRadius: 2 }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 6 }}>
                  TAGLINE (OPTIONAL)
                </div>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="Your racing motto..."
                  maxLength={60}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: 11, fontFamily: 'var(--font-display)', marginBottom: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleClaim} disabled={saving} style={{
                flex: 1, padding: '12px', fontFamily: 'var(--font-display)', fontSize: 12,
                fontWeight: 700, letterSpacing: '0.1em',
                background: saving ? '#333' : `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                color: '#fff', border: 'none', cursor: saving ? 'default' : 'pointer',
                boxShadow: saving ? 'none' : `0 0 16px ${color}66`,
              }}>
                {saving ? 'CLAIMING...' : 'CLAIM MY PROFILE ✓'}
              </button>
              <button onClick={() => setStep('pin')} style={{
                padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 11,
                color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                border: '1px solid #333', cursor: 'pointer',
              }}>
                ← BACK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
