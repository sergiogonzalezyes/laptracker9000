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

      <SessionProgressChart sessions={filtered} height={110} accentColor={color} />
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

  const [showEditModal, setShowEditModal] = useState(false);
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
      {/* Compact header banner */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderTop: `3px solid ${color}`, borderRadius: 10, padding: '28px 24px', width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: color, marginBottom: 20 }}>Edit Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Color</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['#cc0000','#00aaff','#00cc44','#ff8800','#aa00ff','#ff006e','#00cccc','#ffffff'].map(c => (
                    <div key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: 4, cursor: 'pointer', background: c, border: color === c ? '2px solid #fff' : '2px solid transparent', boxShadow: color === c ? `0 0 8px ${c}` : 'none' }} />
                  ))}
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 28, height: 28, padding: 2, border: '1px solid #444', cursor: 'pointer', background: '#111', borderRadius: 4 }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tagline</div>
                <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Your racing motto..." maxLength={60} style={{ width: '100%' }} />
              </div>
              {(showPin || saving) ? (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>PIN</div>
                  <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setSaveError(''); }} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="••••" style={{ width: '100%', textAlign: 'center', letterSpacing: '0.3em', fontSize: 20 }} autoFocus />
                  {saveError && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{saveError}</div>}
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={showPin ? handleSave : () => setShowPin(true)} disabled={saving} style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 700, background: saving ? '#333' : color, color: '#fff', border: 'none', borderRadius: 6, cursor: saving ? 'default' : 'pointer' }}>
                {saving ? 'Saving...' : saved ? '✓ Saved' : showPin ? 'Confirm' : 'Save Changes'}
              </button>
              <button onClick={() => { setShowEditModal(false); setShowPin(false); setPin(''); setSaveError(''); }} style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        flexShrink: 0,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${color}`,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: `0 2px 12px rgba(0,0,0,0.3)`,
      }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}55)`,
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: '#fff',
        }}>
          {profile.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Name + tagline */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '0.03em', lineHeight: 1.2 }}>
            {profile.name}
          </div>
          {profile.tagline && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.tagline}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
          {[
            { label: 'Laps',   value: String(stats.total_laps) },
            { label: 'Tracks', value: String(stats.track_count) },
            { label: 'Best',   value: stats.best_lap_ms ? formatLapTime(stats.best_lap_ms) : '—' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Edit button — only for own profile */}
        {isMyProfile && (
          <button onClick={() => setShowEditModal(true)} style={{
            padding: '7px 14px', fontSize: 12, fontWeight: 600,
            background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget.style.borderColor = color); (e.currentTarget.style.color = color); }}
          onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.color = 'var(--text-secondary)'); }}>
            Edit
          </button>
        )}
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
