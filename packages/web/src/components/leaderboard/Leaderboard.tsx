import { useEffect, useState, useCallback } from 'react';
import { api, LeaderboardEntry, TrackSummary, formatLapTime, trackDisplayName } from '../../api/client';

type SortKey = 'lap_time_ms' | 'driver_name' | 'car_model' | 'completed_at';
type SortDir = 'asc' | 'desc';

function SortHeader({ label, col, sort, dir, onSort }: {
  label: string; col: SortKey; sort: SortKey; dir: SortDir; onSort: (c: SortKey) => void;
}) {
  const active = sort === col;
  return (
    <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
      <span style={{ color: active ? 'var(--accent-hot)' : 'var(--text-muted)' }}>{label}</span>
      {' '}
      <span style={{ fontSize: 9, color: active ? 'var(--accent-hot)' : '#333' }}>
        {active ? (dir === 'asc' ? '▲' : '▼') : '▲▼'}
      </span>
    </th>
  );
}

function TrackCard({ track, selected, onClick }: { track: TrackSummary; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '14px 16px',
        background: selected
          ? 'linear-gradient(135deg, #1a0000 0%, #0f0000 100%)'
          : 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
        border: `1px solid ${selected ? '#880000' : '#222'}`,
        borderTop: `1px solid ${selected ? '#cc0000' : '#333'}`,
        borderLeft: `3px solid ${selected ? 'var(--accent)' : '#1a1a1a'}`,
        borderRadius: 4,
        transition: 'all 0.15s',
        boxShadow: selected ? '0 0 16px rgba(204,0,0,0.2)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 160,
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
      )}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
        marginBottom: 8,
        lineHeight: 1.3,
      }}>
        {trackDisplayName(track.track).toUpperCase()}
        {track.track_config && (
          <span style={{ display: 'block', fontSize: 9, color: 'var(--text-muted)', fontWeight: 400 }}>
            {track.track_config}
          </span>
        )}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 17,
        fontWeight: 800,
        color: selected ? 'var(--accent-hot)' : 'var(--chrome-light)',
        textShadow: selected ? '0 0 12px rgba(255,32,32,0.4)' : 'none',
        letterSpacing: '0.03em',
        marginBottom: 4,
      }}>
        {track.fastest_ms ? formatLapTime(track.fastest_ms) : '—'}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
        {track.fastest_driver || '—'}
      </div>
      <div style={{ marginTop: 6, fontSize: 9, color: selected ? '#660000' : '#222', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
        {track.lap_count} LAPS
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sort, setSort] = useState<SortKey>('lap_time_ms');
  const [dir, setDir] = useState<SortDir>('asc');

  useEffect(() => {
    api.tracks().then(t => { setTracks(t); if (t[0]) setSelectedTrack(t[0].track); });
  }, []);

  useEffect(() => {
    if (!selectedTrack) return;
    const params = new URLSearchParams({ track: selectedTrack });
    if (typeFilter) params.set('type', typeFilter);
    api.leaderboard('?' + params).then(setEntries);
  }, [selectedTrack, typeFilter]);

  // Keyboard: left/right arrow to navigate tracks
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const idx = tracks.findIndex(t => t.track === selectedTrack);
      if (e.key === 'ArrowLeft'  && idx > 0)               setSelectedTrack(tracks[idx - 1].track);
      if (e.key === 'ArrowRight' && idx < tracks.length - 1) setSelectedTrack(tracks[idx + 1].track);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tracks, selectedTrack]);

  const handleSort = useCallback((col: SortKey) => {
    if (sort === col) setDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setDir('asc'); }
  }, [sort]);

  const sorted = [...entries].sort((a, b) => {
    let av: string | number = a[sort] ?? '';
    let bv: string | number = b[sort] ?? '';
    if (sort === 'completed_at') { av = new Date(av as string).getTime(); bv = new Date(bv as string).getTime(); }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return dir === 'asc' ? cmp : -cmp;
  });

  const currentTrack = tracks.find(t => t.track === selectedTrack);

  return (
    <div>
      {/* Track card grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {tracks.map(t => (
          <TrackCard key={t.track} track={t} selected={t.track === selectedTrack} onClick={() => setSelectedTrack(t.track)} />
        ))}
      </div>

      {/* Type filter + hint */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (
            <button key={type} onClick={() => setTypeFilter(type)} style={{
              padding: '5px 12px',
              fontFamily: 'var(--font-display)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              background: typeFilter === type ? 'linear-gradient(180deg, #aa0000, #770000)' : 'var(--bg-elevated)',
              color: typeFilter === type ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${typeFilter === type ? '#cc0000' : 'var(--border-chrome)'}`,
              borderRadius: 0,
              boxShadow: typeFilter === type ? '0 0 10px rgba(204,0,0,0.3)' : 'none',
              clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
            }}>
              {type || 'ALL'}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#333', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
          ← → TO NAVIGATE TRACKS
        </span>
      </div>

      {/* Stats bar */}
      {currentTrack && (
        <div style={{ display: 'flex', gap: 1, marginBottom: 16 }}>
          {[
            { label: 'Total Laps',    value: String(currentTrack.lap_count),              mono: false, highlight: false },
            { label: 'Track Record',  value: formatLapTime(currentTrack.fastest_ms),      mono: true,  highlight: true  },
            { label: 'Record Holder', value: currentTrack.fastest_driver || '—',          mono: false, highlight: false },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1, padding: '12px 16px',
              background: 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
              border: '1px solid #222', borderTop: '1px solid #333',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.4 }} />
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', marginBottom: 6 }}>
                {stat.label.toUpperCase()}
              </div>
              <div style={{
                fontFamily: stat.mono ? 'var(--font-display)' : 'var(--font-sans)',
                fontWeight: 800, fontSize: stat.highlight ? 20 : 16,
                color: stat.highlight ? 'var(--accent-hot)' : 'var(--text-primary)',
                textShadow: stat.highlight ? '0 0 14px rgba(255,32,32,0.4)' : 'none',
                letterSpacing: stat.mono ? '0.05em' : '0',
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard table */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width: 48 }}>POS</th>
              <SortHeader label="DRIVER"   col="driver_name"  sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader label="BEST LAP" col="lap_time_ms"  sort={sort} dir={dir} onSort={handleSort} />
              <th>S1</th><th>S2</th>
              <SortHeader label="CAR"      col="car_model"    sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader label="DATE"     col="completed_at" sort={sort} dir={dir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#222', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 11 }}>
                NO TIMES RECORDED
              </td></tr>
            )}
            {sorted.map((e, i) => (
              <tr key={e.driver_name + i} style={{
                background: i === 0 ? 'linear-gradient(90deg, rgba(204,0,0,0.08) 0%, transparent 100%)' : 'transparent',
                borderLeft: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
                <td style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: i === 0 ? 18 : 13,
                  color: i === 0 ? 'var(--accent-hot)' : 'var(--text-muted)',
                  textShadow: i === 0 ? '0 0 10px rgba(255,32,32,0.5)' : 'none',
                }}>
                  {i === 0 ? '⚑' : i + 1}
                </td>
                <td>
                  <a href={`/drivers/${encodeURIComponent(e.driver_name)}`} style={{
                    fontWeight: 700, fontSize: 14,
                    color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={ev => (ev.currentTarget.style.color = 'var(--accent-hot)')}
                  onMouseLeave={ev => (ev.currentTarget.style.color = i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)')}>
                    {e.driver_name}
                  </a>
                </td>
                <td style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
                  color: i === 0 ? 'var(--accent-hot)' : 'var(--chrome-light)',
                  textShadow: i === 0 ? '0 0 12px rgba(255,32,32,0.4)' : 'none',
                  letterSpacing: '0.03em',
                }}>
                  {formatLapTime(e.lap_time_ms)}
                </td>
                <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {e.split1_ms ? formatLapTime(e.split1_ms) : '—'}
                </td>
                <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {e.split2_ms ? formatLapTime(e.split2_ms) : '—'}
                </td>
                <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{e.car_model.replace(/_/g, ' ')}</td>
                <td style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(e.completed_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
