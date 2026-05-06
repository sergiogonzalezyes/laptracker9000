import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, DriverSummary, formatLapTime } from '../api/client';

const PER_PAGE = 12;

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => { api.allDrivers().then(setDrivers); }, []);

  if (drivers.length === 0) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>
      No drivers yet — race first and claim your profile.
    </div>
  );

  const totalPages = Math.ceil(drivers.length / PER_PAGE);
  const pageDrivers = drivers.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 10 }}>
        {pageDrivers.map(d => (
          <Link key={d.name} to={`/drivers/${encodeURIComponent(d.name)}`} style={{ textDecoration: 'none' }}>
            <div style={{
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
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.boxShadow = `0 0 16px ${d.color || '#cc0000'}33`;
              el.style.borderColor = d.color || '#cc0000';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.boxShadow = 'none';
              el.style.borderColor = '#222';
              el.style.borderLeftColor = d.color || '#cc0000';
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${d.color || '#cc0000'}, transparent)`, opacity: 0.5 }} />

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                  background: `radial-gradient(circle at 35% 35%, ${d.color || '#cc0000'}cc, ${d.color || '#cc0000'}55)`,
                  border: `1px solid ${d.color || '#cc0000'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: '#fff',
                  textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                }}>
                  {d.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                    {d.name}
                  </div>
                  {d.tagline && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>
                      {d.tagline}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 1 }}>
                {[
                  { label: 'LAPS',   value: String(d.total_laps) },
                  { label: 'TRACKS', value: String(d.track_count) },
                  { label: 'BEST',   value: d.best_lap_ms ? formatLapTime(d.best_lap_ms) : '—' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, padding: '6px 8px', background: '#0a0a0a', border: '1px solid #181818', textAlign: 'center' }}>
                    <div style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--chrome-light)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, background: 'var(--bg-elevated)', color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, cursor: page === 0 ? 'default' : 'pointer' }}>
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{ width: 28, height: 28, fontSize: 12, fontWeight: 600, background: i === page ? 'var(--accent)' : 'var(--bg-elevated)', color: i === page ? '#fff' : 'var(--text-muted)', border: `1px solid ${i === page ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 6, cursor: 'pointer' }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, background: 'var(--bg-elevated)', color: page === totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, cursor: page === totalPages - 1 ? 'default' : 'pointer' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
