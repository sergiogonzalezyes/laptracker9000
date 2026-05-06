import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, DriverProfile, formatLapTime, trackDisplayName } from '../api/client';
import { useDriverTheme } from '../hooks/useDriverTheme';
import { useIsMobile } from '../hooks/useBreakpoint';
import SessionProgressChart from '../components/charts/SessionProgressChart';

// ── Progression section with track + car selectors ───────────────────────────
function ProgressionSection({ driverName, trackBests, color }: {
  driverName: string;
  trackBests: { track: string; best_ms: number; car_model: string }[];
  color: string;
}) {
  const [selectedTrack, setSelectedTrack] = useState(trackBests[0]?.track ?? '');
  const [selectedCar, setSelectedCar] = useState('');
  const [sessions, setSessions] = useState<{ id: number; track: string; session_type: string; started_at: string; best_ms: number; best_car: string; lap_count: number }[]>([]);

  useEffect(() => {
    if (!selectedTrack) return;
    api.driverTrackHistory(driverName, selectedTrack).then(data => {
      setSessions(data);
      setSelectedCar(''); // reset car filter when track changes
    });
  }, [selectedTrack, driverName]);

  const cars = [...new Set(sessions.map(s => s.best_car).filter(Boolean))];
  const filtered = selectedCar ? sessions.filter(s => s.best_car === selectedCar) : sessions;

  if (filtered.length < 2) return null;

  return (
    <div className="card" style={{ padding: '14px 16px 10px' }}>
      {/* Header + selectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
          Progression
        </div>

        {/* Track selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedTrack}
            onChange={e => setSelectedTrack(e.target.value)}
            style={{ fontSize: 12, fontWeight: 600, paddingRight: 24, paddingLeft: 10, height: 28 }}
          >
            {trackBests.map(t => (
              <option key={t.track} value={t.track}>{trackDisplayName(t.track)}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 9 }}>▼</span>
        </div>

        {/* Car selector — only if multiple cars */}
        {cars.length > 1 && (
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCar}
              onChange={e => setSelectedCar(e.target.value)}
              style={{ fontSize: 12, paddingRight: 24, paddingLeft: 10, height: 28 }}
            >
              <option value="">All Cars</option>
              {cars.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 9 }}>▼</span>
          </div>
        )}

        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <SessionProgressChart sessions={filtered} height={130} accentColor={color} />
    </div>
  );
}

export default function DriverPage() {
  const { name } = useParams<{ name: string }>();
  const { me, refreshColor } = useDriverTheme();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [color, setColor] = useState('#cc0000');
  const [tagline, setTagline] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const decodedName = name ? decodeURIComponent(name) : '';
  const isMyProfile = me?.name === decodedName && me?.claimed;
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!name) return;
    api.driverProfile(decodedName)
      .then(p => {
        setProfile(p);
        setColor(p.color || '#cc0000');
        setTagline(p.tagline || '');
      })
      .catch(() => setNotFound(true));
  }, [name]);

  const handleSave = async () => {
    if (!name) return;
    if (!pin || !/^\d{4}$/.test(pin)) { setSaveError('Enter your 4-digit PIN'); setShowPin(true); return; }
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

  if (notFound) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: '#333', letterSpacing: '0.15em' }}>DRIVER NOT FOUND</div>
      <Link to="/leaderboard" style={{ color: 'var(--accent)', fontSize: 12, marginTop: 12, display: 'block' }}>← Back to Leaderboard</Link>
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 11 }}>
      LOADING...
    </div>
  );

  const { stats, favCar, trackBests, recentSessions } = profile;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
      {/* Header card — fixed height */}
      <div style={{
        flexShrink: 0,
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
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />

        {/* Color swatch + picker */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 72, height: 72,
            background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}66)`,
            borderRadius: 2,
            border: `2px solid ${color}`,
            boxShadow: `0 0 20px ${color}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22,
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}>
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            title="Pick your driver color"
            style={{
              position: 'absolute', bottom: -6, right: -6,
              width: 24, height: 24,
              border: '1px solid #444',
              borderRadius: 2, cursor: 'pointer',
              padding: 0, background: 'none',
            }}
          />
        </div>

        {/* Name + tagline */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 900,
            letterSpacing: '0.05em',
            color: color,
            textShadow: `0 0 20px ${color}88`,
            marginBottom: 6,
          }}>
            {profile.name.toUpperCase()}
          </div>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="Enter your tagline..."
            maxLength={60}
            style={{ width: '100%', maxWidth: 380, fontSize: 13, color: 'var(--text-secondary)', background: 'transparent', border: 'none', borderBottom: '1px solid #333', borderRadius: 0, padding: '4px 0', outline: 'none' }}
            onFocus={e => (e.target.style.borderBottomColor = color)}
            onBlur={e => (e.target.style.borderBottomColor = '#333')}
          />
          {isMyProfile && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(showPin || saving) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setSaveError(''); }}
                    placeholder="PIN"
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    style={{ width: 80, textAlign: 'center', letterSpacing: '0.2em', fontSize: 16, padding: '5px 8px' }}
                    autoFocus
                  />
                  {saveError && <span style={{ fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-display)' }}>{saveError}</span>}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={showPin ? handleSave : () => setShowPin(true)}
                  disabled={saving}
                  style={{
                    fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.1em', padding: '6px 16px',
                    background: saving ? '#333' : `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                    color: '#fff', border: 'none', borderRadius: 0,
                    clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
                    cursor: saving ? 'default' : 'pointer',
                    boxShadow: saving ? 'none' : `0 0 12px ${color}66`,
                  }}>
                  {saving ? 'SAVING...' : saved ? '✓ SAVED' : showPin ? 'CONFIRM SAVE' : 'SAVE PROFILE'}
                </button>
                {!showPin && (
                  <span style={{ fontSize: 10, color: '#333', fontFamily: 'var(--font-display)' }}>
                    Click the color swatch to change
                  </span>
                )}
              </div>
            </div>
          )}
          {!isMyProfile && profile?.claimed && (
            <div style={{ marginTop: 12, fontSize: 10, color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
              SELECT THIS DRIVER FROM THE MENU TO EDIT
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap' }}>
          {[
            { label: 'LAPS',   value: String(stats.total_laps) },
            { label: 'TRACKS', value: String(stats.track_count) },
            { label: 'BEST',   value: stats.best_lap_ms ? formatLapTime(stats.best_lap_ms) : '—', mono: true },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px 16px', background: '#0a0a0a', border: '1px solid #1a1a1a', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--chrome-light)', letterSpacing: '0.03em' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session progression chart — fixed height */}
      {trackBests.length > 0 && (
        <div style={{ flexShrink: 0 }}>
          <ProgressionSection driverName={decodedName} trackBests={trackBests} color={color} />
        </div>
      )}

      {/* Bottom grid — fills remaining space */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        {/* Track bests */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="section-label" style={{ flexShrink: 0 }}>Track Records</div>
          <div className="card" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div style={{ height: '100%', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr><th>TRACK</th><th>BEST TIME</th><th>CAR</th></tr>
              </thead>
              <tbody>
                {trackBests.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: '#222', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em' }}>NO VALID LAPS</td></tr>
                )}
                {trackBests.map((t, i) => (
                  <tr key={t.track} style={{ borderLeft: i === 0 ? `2px solid ${color}` : '2px solid transparent' }}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{trackDisplayName(t.track)}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: i === 0 ? color : 'var(--chrome-light)' }}>
                      {formatLapTime(t.best_ms)}
                    </td>
                    <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.car_model.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="section-label" style={{ flexShrink: 0 }}>Recent Sessions</div>
          <div className="card" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div style={{ height: '100%', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr><th>TRACK</th><th>TYPE</th><th>BEST</th><th>LAPS</th></tr>
              </thead>
              <tbody>
                {recentSessions.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#222', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em' }}>NO SESSIONS</td></tr>
                )}
                {recentSessions.map(s => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/history/${s.id}`} style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = color)}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                        {trackDisplayName(s.track)}
                      </Link>
                    </td>
                    <td><span className={`badge badge-${s.session_type.toLowerCase()}`}>{s.session_type}</span></td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--chrome-light)' }}>
                      {s.best_ms ? formatLapTime(s.best_ms) : '—'}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.lap_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
