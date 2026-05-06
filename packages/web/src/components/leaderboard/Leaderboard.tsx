import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { api, LeaderboardEntry, TrackSummary, formatLapTime, trackDisplayName } from '../../api/client';

type SortKey = 'lap_time_ms' | 'driver_name' | 'car_model' | 'completed_at';
type SortDir = 'asc' | 'desc';

function SortTh({ label, col, sort, dir, onSort, style }: {
  label: string; col: SortKey; sort: SortKey; dir: SortDir;
  onSort: (c: SortKey) => void; style?: React.CSSProperties;
}) {
  const active = sort === col;
  return (
    <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none', ...style }}>
      <span style={{ color: active ? 'var(--accent-hot)' : undefined }}>{label}</span>
      <span style={{ marginLeft: 4, fontSize: 9, color: active ? 'var(--accent-hot)' : '#2a2a2a' }}>
        {active ? (dir === 'asc' ? '▲' : '▼') : '▼'}
      </span>
    </th>
  );
}

function TrackCard({ track, selected, onClick }: { track: TrackSummary; selected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      padding: '14px 16px',
      background: selected ? '#120006' : 'var(--bg-surface)',
      border: `1px solid ${selected ? '#440000' : 'var(--border)'}`,
      borderLeft: `3px solid ${selected ? 'var(--accent)' : 'transparent'}`,
      borderRadius: 10,
      transition: 'all 0.12s',
      boxShadow: selected
        ? '0 2px 8px rgba(204,0,0,0.15), 0 4px 16px rgba(0,0,0,0.3)'
        : '0 1px 3px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 110,
    }}>
      <div style={{
        fontSize: 12, fontWeight: 600,
        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
        lineHeight: 1.35,
      }}>
        {trackDisplayName(track.track)}
        {track.track_config && (
          <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>
            {track.track_config}
          </span>
        )}
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 17, fontWeight: 700,
          color: selected ? 'var(--accent-hot)' : 'var(--text-primary)',
          marginBottom: 2, marginTop: 8,
        }}>
          {track.fastest_ms ? formatLapTime(track.fastest_ms) : '—'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {track.fastest_driver || '—'}
        </div>
        <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)' }}>
          {track.lap_count} laps
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sort, setSort] = useState<SortKey>('lap_time_ms');
  const [dir, setDir] = useState<SortDir>('asc');
  const [trackPage, setTrackPage] = useState(0);
  const navigate = useNavigate();
  const TRACKS_PER_PAGE = 12;

  useEffect(() => {
    api.tracks().then(t => { setTracks(t); if (t[0]) setSelectedTrack(t[0].track); });
  }, []);

  useEffect(() => {
    if (!selectedTrack) return;
    const p = new URLSearchParams({ track: selectedTrack });
    if (typeFilter) p.set('type', typeFilter);
    api.leaderboard('?' + p).then(setEntries);
  }, [selectedTrack, typeFilter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const idx = tracks.findIndex(t => t.track === selectedTrack);
      if (e.key === 'ArrowLeft' && idx > 0) {
        const prev = tracks[idx - 1];
        setSelectedTrack(prev.track);
        setTrackPage(Math.floor((idx - 1) / TRACKS_PER_PAGE));
      }
      if (e.key === 'ArrowRight' && idx < tracks.length - 1) {
        const next = tracks[idx + 1];
        setSelectedTrack(next.track);
        setTrackPage(Math.floor((idx + 1) / TRACKS_PER_PAGE));
      }
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

  const leaderMs = sorted[0]?.lap_time_ms ?? 0;
  const currentTrack = tracks.find(t => t.track === selectedTrack);
  const isMobile = useIsMobile();

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Track grid — paginated */}
      {(() => {
        const totalPages = Math.ceil(tracks.length / TRACKS_PER_PAGE);
        const pageTracks = tracks.slice(trackPage * TRACKS_PER_PAGE, (trackPage + 1) * TRACKS_PER_PAGE);
        return (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(2, 1fr)'
                : 'repeat(auto-fill, minmax(175px, 1fr))',
              gap: 8,
              marginBottom: 12,
            }}>
              {pageTracks.map(t => (
                <TrackCard key={t.track} track={t} selected={t.track === selectedTrack} onClick={() => setSelectedTrack(t.track)} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setTrackPage(p => Math.max(0, p - 1))}
                  disabled={trackPage === 0}
                  style={{
                    padding: '5px 12px', fontSize: 12, fontWeight: 600,
                    background: 'var(--bg-elevated)',
                    color: trackPage === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    cursor: trackPage === 0 ? 'default' : 'pointer',
                  }}
                >← Prev</button>

                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setTrackPage(i)} style={{
                      width: 28, height: 28, fontSize: 12, fontWeight: 600,
                      background: i === trackPage ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: i === trackPage ? '#fff' : 'var(--text-muted)',
                      border: `1px solid ${i === trackPage ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 6, cursor: 'pointer',
                    }}>
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setTrackPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={trackPage === totalPages - 1}
                  style={{
                    padding: '5px 12px', fontSize: 12, fontWeight: 600,
                    background: 'var(--bg-elevated)',
                    color: trackPage === totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    cursor: trackPage === totalPages - 1 ? 'default' : 'pointer',
                  }}
                >Next →</button>

                <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  {tracks.length} tracks
                </span>
              </div>
            )}
          </>
        );
      })()}

      {/* Type filter + nav hint */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }}>
        {['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (
          <button key={type} onClick={() => setTypeFilter(type)} style={{
            fontSize: 12, fontWeight: 600, padding: '5px 14px',
            background: typeFilter === type ? 'var(--accent-dim)' : 'transparent',
            color: typeFilter === type ? 'var(--accent-hot)' : 'var(--text-muted)',
            border: `1px solid ${typeFilter === type ? '#440000' : 'var(--border)'}`,
            borderRadius: 3,
          }}>
            {type || 'All'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          ← → navigate tracks
        </span>
      </div>

      {/* Stats strip */}
      {currentTrack && (
        <div style={{ display: 'flex', gap: 24, marginBottom: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          {[
            { label: 'Track Record', value: formatLapTime(currentTrack.fastest_ms), big: true },
            { label: 'Record Holder', value: currentTrack.fastest_driver || '—', big: false },
            { label: 'Total Laps', value: String(currentTrack.lap_count), big: false },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: s.big ? 'var(--font-mono)' : 'var(--font-sans)',
                fontSize: s.big ? 22 : 16,
                fontWeight: 700,
                color: s.big ? 'var(--accent-hot)' : 'var(--text-primary)',
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard table — fills remaining height */}
      <div className="card" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', overflowY: 'auto', overflowX: 'auto' }}>
        <table style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ width: 64, textAlign: 'center' }}>POS</th>
              <SortTh label="Driver"   col="driver_name"  sort={sort} dir={dir} onSort={handleSort} />
              <SortTh label="Best Lap" col="lap_time_ms"  sort={sort} dir={dir} onSort={handleSort} />
              <th>Gap</th>
              <th>S1</th>
              <th>S2</th>
              <th>S3</th>
              <SortTh label="Car"  col="car_model"    sort={sort} dir={dir} onSort={handleSort} />
              <SortTh label="Date" col="completed_at" sort={sort} dir={dir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: 13 }}>
                No times recorded
              </td></tr>
            )}
            {sorted.map((e, i) => {
              const isFirst = i === 0;
              const gap = e.lap_time_ms - leaderMs;
              return (
                <tr key={e.driver_name + i} style={{
                  background: isFirst ? 'rgba(204,0,0,0.04)' : undefined,
                  borderLeft: isFirst ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                  {/* Position */}
                  <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: isFirst ? 26 : 16,
                      fontWeight: 900,
                      color: isFirst ? 'var(--accent)' : 'var(--text-muted)',
                      lineHeight: 1,
                    }}>
                      {isFirst ? '1' : i + 1}
                    </span>
                  </td>

                  {/* Driver */}
                  <td style={{ padding: '14px 20px' }}>
                    <a
                      onClick={() => navigate(`/drivers/${encodeURIComponent(e.driver_name)}`)}
                      style={{
                        fontSize: 16, fontWeight: 700,
                        color: isFirst ? 'var(--text-primary)' : 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={ev => (ev.currentTarget.style.color = 'var(--accent-hot)')}
                      onMouseLeave={ev => (ev.currentTarget.style.color = 'var(--text-primary)')}
                    >
                      {e.driver_name}
                    </a>
                  </td>

                  {/* Time */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 20, fontWeight: 700,
                      color: isFirst ? 'var(--accent-hot)' : 'var(--text-primary)',
                      letterSpacing: '0.02em',
                    }}>
                      {formatLapTime(e.lap_time_ms)}
                    </span>
                  </td>

                  {/* Gap */}
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                    {isFirst ? '—' : `+${((gap) / 1000).toFixed(3)}`}
                  </td>

                  {/* S1 */}
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                    {e.split1_ms ? formatLapTime(e.split1_ms) : '—'}
                  </td>

                  {/* S2 */}
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                    {e.split2_ms ? formatLapTime(e.split2_ms) : '—'}
                  </td>

                  {/* S3 */}
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                    {e.split3_ms ? formatLapTime(e.split3_ms) : '—'}
                  </td>

                  {/* Car */}
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {e.car_model.replace(/_/g, ' ')}
                  </td>

                  {/* Date */}
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {new Date(e.completed_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

