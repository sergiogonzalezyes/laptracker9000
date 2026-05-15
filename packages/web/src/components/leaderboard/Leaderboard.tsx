import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { api, LeaderboardEntry, TrackSummary, formatLapTime, trackDisplayName } from '../../api/client';

type SortKey = 'lap_time_ms' | 'driver_name' | 'car_model' | 'completed_at';
type SortDir = 'asc' | 'desc';

const TRACKS_PER_PAGE = 6;

function SortTh({ label, col, sort, dir, onSort, style }: {
  label: string; col: SortKey; sort: SortKey; dir: SortDir;
  onSort: (c: SortKey) => void; style?: React.CSSProperties;
}) {
  const active = sort === col;
  return (
    <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none', ...style }}>
      <span style={{ color: active ? 'var(--accent-hot)' : undefined }}>{label}</span>
      <span style={{ marginLeft: 4, fontSize: 8, color: active ? 'var(--accent-hot)' : '#2a2a2a' }}>
        {active ? (dir === 'asc' ? '▲' : '▼') : '▼'}
      </span>
    </th>
  );
}

export default function Leaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [trackPage, setTrackPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sort, setSort] = useState<SortKey>('lap_time_ms');
  const [dir, setDir] = useState<SortDir>('asc');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const didInit = useRef(false);

  useEffect(() => {
    api.tracks().then(t => {
      setTracks(t);
      if (didInit.current) return;
      didInit.current = true;
      const urlTrack = searchParams.get('track');
      const idx = urlTrack ? t.findIndex(x => x.track === urlTrack) : -1;
      const initial = idx >= 0 ? urlTrack! : (t[0]?.track ?? '');
      setSelectedTrack(initial);
      if (idx >= 0) setTrackPage(Math.floor(idx / TRACKS_PER_PAGE));
    });
  }, []);

  const selectTrack = useCallback((track: string) => {
    setSelectedTrack(track);
    setSearchParams({ track }, { replace: true });
  }, [setSearchParams]);

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
        const next = tracks[idx - 1].track;
        selectTrack(next);
        setTrackPage(Math.floor((idx - 1) / TRACKS_PER_PAGE));
      }
      if (e.key === 'ArrowRight' && idx < tracks.length - 1) {
        const next = tracks[idx + 1].track;
        selectTrack(next);
        setTrackPage(Math.floor((idx + 1) / TRACKS_PER_PAGE));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tracks, selectedTrack, selectTrack]);

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
  const leaderMs = sorted[0]?.lap_time_ms ?? 0;

  // Best sectors across all entries
  const bestS1 = Math.min(...entries.filter(e => e.split1_ms).map(e => e.split1_ms!));
  const bestS2 = Math.min(...entries.filter(e => e.split2_ms).map(e => e.split2_ms!));
  const bestS3 = Math.min(...entries.filter(e => e.split3_ms).map(e => e.split3_ms!));

  const totalPages = Math.ceil(tracks.length / TRACKS_PER_PAGE);
  const visibleTracks = tracks.slice(trackPage * TRACKS_PER_PAGE, (trackPage + 1) * TRACKS_PER_PAGE);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Track selector — paginated strip */}
      <div style={{ flexShrink: 0, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Select Track
          </div>
          {totalPages > 1 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {trackPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setTrackPage(p => Math.max(0, p - 1))}
                disabled={trackPage === 0}
                style={{ padding: '3px 10px', fontSize: 12, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: trackPage === 0 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: trackPage === 0 ? 'default' : 'pointer' }}
              >‹</button>
              <button
                onClick={() => setTrackPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={trackPage === totalPages - 1}
                style={{ padding: '3px 10px', fontSize: 12, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: trackPage === totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: trackPage === totalPages - 1 ? 'default' : 'pointer' }}
              >›</button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {visibleTracks.map(t => {
            const isSelected = t.track === selectedTrack;
            return (
              <div key={t.track} onClick={() => selectTrack(t.track)} style={{
                flex: 1, cursor: 'pointer',
                padding: '10px 14px',
                background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8,
                minWidth: 0,
                transition: 'all 0.12s',
                boxShadow: isSelected ? `0 0 12px rgba(204,0,0,0.2)` : 'none',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {trackDisplayName(t.track)}
                </div>
                {t.track_config && <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.track_config}</div>}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: isSelected ? 'var(--accent-hot)' : 'var(--text-primary)', marginBottom: 2 }}>
                  {t.fastest_ms ? formatLapTime(t.fastest_ms) : '—'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.fastest_driver || '—'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected track detail banner */}
      {currentTrack && (
        <div style={{
          flexShrink: 0,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {trackDisplayName(currentTrack.track)}
            </div>
            {currentTrack.track_config && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{currentTrack.track_config}</div>}
          </div>
          {[
            { label: 'Best Lap',      value: formatLapTime(currentTrack.fastest_ms), mono: true, accent: true },
            { label: 'Record Holder', value: currentTrack.fastest_driver || '—',     mono: false, accent: false },
            { label: 'Total Laps',    value: String(currentTrack.lap_count),         mono: false, accent: false },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: s.mono ? 22 : 16, fontWeight: 700, color: s.accent ? 'var(--accent-hot)' : 'var(--text-primary)' }}>
                {s.value}
              </div>
            </div>
          ))}

          {/* Session type filter */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (
              <button key={type} onClick={() => setTypeFilter(type)} style={{
                padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                background: typeFilter === type ? 'var(--accent)' : 'var(--bg-elevated)',
                color: typeFilter === type ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${typeFilter === type ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}>
                {type || 'All'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="card" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', overflowY: 'auto', overflowX: 'auto' }}>
          <table style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ width: 56, textAlign: 'center' }}>Pos</th>
                <SortTh label="Driver"   col="driver_name"  sort={sort} dir={dir} onSort={handleSort} />
                <SortTh label="Best Lap" col="lap_time_ms"  sort={sort} dir={dir} onSort={handleSort} />
                <th style={{ width: 80 }}>Gap</th>
                <th>S1</th><th>S2</th><th>S3</th>
                <SortTh label="Car"  col="car_model"    sort={sort} dir={dir} onSort={handleSort} />
                <SortTh label="Date" col="completed_at" sort={sort} dir={dir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: 13 }}>
                  No times recorded for this track
                </td></tr>
              )}
              {sorted.map((e, i) => {
                const isFirst = i === 0;
                const gap = e.lap_time_ms - leaderMs;
                const s1color = e.split1_ms && e.split1_ms === bestS1 ? '#a855f7' : 'var(--text-muted)';
                const s2color = e.split2_ms && e.split2_ms === bestS2 ? '#a855f7' : 'var(--text-muted)';
                const s3color = e.split3_ms && e.split3_ms === bestS3 ? '#a855f7' : 'var(--text-muted)';

                return (
                  <tr key={e.driver_name + i} style={{
                    background: isFirst ? 'rgba(232,176,0,0.04)' : undefined,
                    borderLeft: isFirst ? '3px solid #e8b000' : '3px solid transparent',
                  }}>
                    {/* Position */}
                    <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                      {isFirst ? (
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: '#e8b000', lineHeight: 1 }}>1</span>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</span>
                      )}
                    </td>

                    {/* Driver */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isFirst && <span style={{ fontSize: 14 }}>👑</span>}
                        <a onClick={() => navigate(`/drivers/${encodeURIComponent(e.driver_name)}`)} style={{
                          fontSize: 15, fontWeight: isFirst ? 700 : 600,
                          color: isFirst ? 'var(--text-primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={ev => (ev.currentTarget.style.color = 'var(--accent-hot)')}
                        onMouseLeave={ev => (ev.currentTarget.style.color = 'var(--text-primary)')}>
                          {e.driver_name}
                        </a>
                      </div>
                    </td>

                    {/* Time */}
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: isFirst ? 22 : 17, fontWeight: 700,
                        color: isFirst ? '#e8b000' : 'var(--text-primary)',
                      }}>
                        {formatLapTime(e.lap_time_ms)}
                      </span>
                    </td>

                    {/* Gap */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                      {isFirst ? '—' : `+${(gap / 1000).toFixed(3)}`}
                    </td>

                    {/* Sectors */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: s1color, fontWeight: e.split1_ms === bestS1 ? 700 : 400 }}>
                      {e.split1_ms ? formatLapTime(e.split1_ms) : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: s2color, fontWeight: e.split2_ms === bestS2 ? 700 : 400 }}>
                      {e.split2_ms ? formatLapTime(e.split2_ms) : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: s3color, fontWeight: e.split3_ms === bestS3 ? 700 : 400 }}>
                      {e.split3_ms ? formatLapTime(e.split3_ms) : '—'}
                    </td>

                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.car_model.replace(/_/g, ' ')}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
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
