import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Session, Lap, formatLapTime, trackDisplayName } from '../../api/client';
import { useIsMobile } from '../../hooks/useBreakpoint';
import LapTimeChart from '../charts/LapTimeChart';

function sectorColor(ms: number | null, bestMs: number | null): string {
  if (!ms || !bestMs) return 'var(--text-muted)';
  const pct = (ms - bestMs) / bestMs;
  if (pct <= 0.01) return 'var(--green)';
  if (pct <= 0.04) return '#ffcc00';
  if (pct <= 0.08) return '#ff8800';
  return 'var(--red)';
}

function formatDelta(ms: number, bestMs: number): string {
  if (ms === bestMs) return '⚑ BEST';
  return `+${((ms - bestMs) / 1000).toFixed(3)}`;
}

function lapTrend(laps: Lap[], idx: number): { sym: string; color: string } | null {
  if (idx < 2) return null;
  const [a, b, c] = [laps[idx - 2], laps[idx - 1], laps[idx]];
  if (!a.valid || !b.valid || !c.valid) return null;
  if (c.lap_time_ms < b.lap_time_ms && b.lap_time_ms < a.lap_time_ms) return { sym: '▲', color: 'var(--green)' };
  if (c.lap_time_ms > b.lap_time_ms && b.lap_time_ms > a.lap_time_ms) return { sym: '▼', color: 'var(--red)' };
  return { sym: '—', color: '#444' };
}

interface DriverStats {
  best: number | null;
  avg: number | null;
  theoreticalBest: number | null;
  stdDev: number | null;
  bestS1: number | null;
  bestS2: number | null;
  lapCount: number;
  validCount: number;
}

function calcDriverStats(laps: Lap[]): DriverStats {
  const valid = laps.filter(l => l.valid === 1);
  if (valid.length === 0) return { best: null, avg: null, theoreticalBest: null, stdDev: null, bestS1: null, bestS2: null, lapCount: laps.length, validCount: 0 };

  const times = valid.map(l => l.lap_time_ms);
  const best = Math.min(...times);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const stdDev = times.length > 1
    ? Math.sqrt(times.map(t => (t - avg) ** 2).reduce((a, b) => a + b, 0) / times.length)
    : null;

  const s1s = valid.filter(l => l.split1_ms).map(l => l.split1_ms!);
  const s2s = valid.filter(l => l.split2_ms).map(l => l.split2_ms!);
  const bestS1 = s1s.length ? Math.min(...s1s) : null;
  const bestS2 = s2s.length ? Math.min(...s2s) : null;
  const theoreticalBest = bestS1 && bestS2 ? bestS1 + bestS2 : null;

  return { best, avg, theoreticalBest, stdDev, bestS1, bestS2, lapCount: laps.length, validCount: valid.length };
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ flex: 1, padding: '10px 12px', borderRight: '1px solid #1a1a1a', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.5 }} />}
      <div style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: highlight ? 'var(--accent-hot)' : 'var(--chrome-light)', letterSpacing: '0.02em' }}>
        {value}
      </div>
    </div>
  );
}

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<(Session & { laps: Lap[] }) | null>(null);
  const [focusDriver, setFocusDriver] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (id) api.session(parseInt(id, 10)).then(s => {
      setSession(s);
      // Default to first driver if only one
      const names = [...new Set(s.laps.map(l => l.driver_name))];
      if (names.length === 1) setFocusDriver(names[0]);
    });
  }, [id]);

  if (!session) return <div style={{ color: 'var(--text-muted)', padding: 40, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', fontSize: 11 }}>LOADING...</div>;

  // Group by driver
  const byDriver = new Map<string, Lap[]>();
  for (const lap of session.laps) {
    const arr = byDriver.get(lap.driver_name) ?? [];
    arr.push(lap);
    byDriver.set(lap.driver_name, arr);
  }

  const standings = [...byDriver.entries()].map(([name, laps]) => {
    const stats = calcDriverStats(laps);
    return { name, laps, stats };
  }).sort((a, b) => (a.stats.best ?? Infinity) - (b.stats.best ?? Infinity));

  const leaderBest = standings[0]?.stats.best ?? null;

  // Focus driver data
  const focusLaps = focusDriver ? (byDriver.get(focusDriver) ?? session.laps) : session.laps;
  const focusStats = calcDriverStats(focusLaps);
  const sessionBestMs = Math.min(...session.laps.filter(l => l.valid === 1).map(l => l.lap_time_ms), Infinity);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/history" style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>← HISTORY</Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <span className={`badge badge-${session.session_type.toLowerCase()}`}>{session.session_type}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '0.05em' }}>
          {trackDisplayName(session.track).toUpperCase()}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          {new Date(session.started_at).toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: 16 }}>
        {/* Standings sidebar */}
        <div>
          <div className="section-label">Standings</div>
          <div className="card">
            {standings.map((s, i) => {
              const gap = s.stats.best && leaderBest ? s.stats.best - leaderBest : null;
              return (
                <div
                  key={s.name}
                  onClick={() => setFocusDriver(focusDriver === s.name ? null : s.name)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: i < standings.length - 1 ? '1px solid #1a1a1a' : 'none',
                    borderLeft: focusDriver === s.name ? '2px solid var(--accent)' : '2px solid transparent',
                    background: focusDriver === s.name ? 'rgba(204,0,0,0.05)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: i === 0 ? 16 : 12, color: i === 0 ? 'var(--accent-hot)' : 'var(--text-muted)' }}>
                        {i === 0 ? '⚑' : `P${i + 1}`}
                      </span>
                      <Link to={`/drivers/${encodeURIComponent(s.name)}`}
                        onClick={e => e.stopPropagation()}
                        style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-hot)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}>
                        {s.name}
                      </Link>
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: i === 0 ? 'var(--accent-hot)' : 'var(--chrome-light)' }}>
                      {s.stats.best ? formatLapTime(s.stats.best) : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                    <span>{s.stats.lapCount} laps</span>
                    {gap && gap > 0 ? (
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#555' }}>+{(gap / 1000).toFixed(3)}</span>
                    ) : null}
                  </div>
                  {/* Mini stats */}
                  {s.stats.stdDev && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 8, fontSize: 9, color: '#444', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                      <span>AVG {formatLapTime(Math.round(s.stats.avg!))}</span>
                      <span>±{(s.stats.stdDev / 1000).toFixed(2)}s</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lap table */}
        <div>
          <div className="section-label">
            {focusDriver ? focusDriver.toUpperCase() : `ALL LAPS`}
            <span style={{ marginLeft: 8, fontSize: 9, color: '#333' }}>({focusLaps.length} laps{focusDriver ? ' · click driver to deselect' : ''})</span>
          </div>

          {/* Lap time chart */}
          {focusStats.validCount >= 2 && (
            <div className="card" style={{ marginBottom: 8, padding: '12px 16px 8px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Lap Time Progression
              </div>
              <LapTimeChart
                laps={focusLaps.map(l => ({
                  lapNumber: l.lap_number,
                  lapTimeMs: l.lap_time_ms,
                  valid: l.valid === 1,
                }))}
                height={140}
              />
            </div>
          )}

          {/* Stats bar */}
          {focusStats.validCount > 0 && (
            <div className="card" style={{ display: 'flex', marginBottom: 8, padding: 0, overflow: 'hidden' }}>
              <StatCell label="BEST"        value={focusStats.best ? formatLapTime(focusStats.best) : '—'} highlight />
              <StatCell label="AVERAGE"     value={focusStats.avg ? formatLapTime(Math.round(focusStats.avg)) : '—'} />
              <StatCell label="THEORY BEST" value={focusStats.theoreticalBest ? formatLapTime(focusStats.theoreticalBest) : '—'} />
              <StatCell label="CONSISTENCY" value={focusStats.stdDev ? `±${(focusStats.stdDev / 1000).toFixed(2)}s` : '—'} />
              <StatCell label="VALID / TOTAL" value={`${focusStats.validCount} / ${focusStats.lapCount}`} />
            </div>
          )}

          <div className="card">
            <div className="table-scroll">
            <table style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={{ width: 20 }}></th>
                  <th>#</th>
                  <th>DRIVER</th>
                  <th>TIME</th>
                  <th>DELTA</th>
                  <th>S1</th>
                  <th>S2</th>
                  <th>CAR</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {focusLaps.map((lap, idx) => {
                  const trend = lapTrend(focusLaps, idx);
                  const driverLaps = byDriver.get(lap.driver_name) ?? [];
                  const driverStats = calcDriverStats(driverLaps);
                  const isSessionBest = lap.valid === 1 && lap.lap_time_ms === sessionBestMs;

                  return (
                    <tr key={lap.id} style={{
                      background: isSessionBest ? 'linear-gradient(90deg, rgba(204,0,0,0.06) 0%, transparent 100%)' : 'transparent',
                      borderLeft: isSessionBest ? '2px solid var(--accent)' : '2px solid transparent',
                    }}>
                      <td style={{ width: 20, padding: '10px 4px', textAlign: 'center' }}>
                        {trend && <span style={{ fontSize: 9, color: trend.color, fontWeight: 700 }}>{trend.sym}</span>}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)' }}>{lap.lap_number}</td>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/drivers/${encodeURIComponent(lap.driver_name)}`} style={{ color: 'inherit', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-hot)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}>
                          {lap.driver_name}
                        </Link>
                      </td>
                      <td style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                        color: lap.valid === 0 ? 'var(--red)' : isSessionBest ? 'var(--accent-hot)' : 'var(--chrome-light)',
                        opacity: lap.valid === 0 ? 0.6 : 1,
                      }}>
                        {formatLapTime(lap.lap_time_ms)}
                      </td>
                      <td style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: !lap.valid ? 'var(--text-muted)' : isSessionBest ? 'var(--accent-hot)' : '#666',
                        fontWeight: isSessionBest ? 700 : 400,
                      }}>
                        {lap.valid === 1 ? formatDelta(lap.lap_time_ms, sessionBestMs) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split1_ms, driverStats.bestS1) }}>
                        {lap.split1_ms ? formatLapTime(lap.split1_ms) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split2_ms, driverStats.bestS2) }}>
                        {lap.split2_ms ? formatLapTime(lap.split2_ms) : '—'}
                      </td>
                      <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{lap.car_model.replace(/_/g, ' ')}</td>
                      <td style={{ fontSize: 10 }}>
                        {lap.valid === 0
                          ? <span style={{ color: 'var(--red)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>✗ {lap.cuts}c</span>
                          : isSessionBest
                          ? <span style={{ color: 'var(--accent-hot)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>⚑</span>
                          : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
