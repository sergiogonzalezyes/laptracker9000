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
  bestS3: number | null;
  lapCount: number;
  validCount: number;
}

function calcDriverStats(laps: Lap[]): DriverStats {
  const valid = laps.filter(l => l.valid === 1);
  if (valid.length === 0) return { best: null, avg: null, theoreticalBest: null, stdDev: null, bestS1: null, bestS2: null, bestS3: null, lapCount: laps.length, validCount: 0 };

  const times = valid.map(l => l.lap_time_ms);
  const best = Math.min(...times);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const stdDev = times.length > 1
    ? Math.sqrt(times.map(t => (t - avg) ** 2).reduce((a, b) => a + b, 0) / times.length)
    : null;

  const s1s = valid.filter(l => l.split1_ms).map(l => l.split1_ms!);
  const s2s = valid.filter(l => l.split2_ms).map(l => l.split2_ms!);
  const s3s = valid.filter(l => l.split3_ms).map(l => l.split3_ms!);
  const bestS1 = s1s.length ? Math.min(...s1s) : null;
  const bestS2 = s2s.length ? Math.min(...s2s) : null;
  const bestS3 = s3s.length ? Math.min(...s3s) : null;
  const theoreticalBest = bestS1 && bestS2 ? bestS1 + bestS2 + (bestS3 ?? 0) : null;

  return { best, avg, theoreticalBest, stdDev, bestS1, bestS2, bestS3, lapCount: laps.length, validCount: valid.length };
}

// ── Head-to-Head component ───────────────────────────────────────────────────
function HeadToHead({ standings, isMobile }: {
  standings: { name: string; laps: Lap[]; stats: DriverStats }[];
  isMobile: boolean;
}) {
  const [p1idx, setP1idx] = useState(0);
  const [p2idx, setP2idx] = useState(1);

  const p1 = standings[p1idx];
  const p2 = standings[p2idx];
  if (!p1 || !p2) return null;

  // Shared laps: both drivers did the same lap number
  const p1ByLap = new Map(p1.laps.map(l => [l.lap_number, l]));
  const p2ByLap = new Map(p2.laps.map(l => [l.lap_number, l]));
  const allLapNums = [...new Set([...p1ByLap.keys(), ...p2ByLap.keys()])].sort((a, b) => a - b);
  const sharedLaps = allLapNums.filter(n => p1ByLap.has(n) && p2ByLap.has(n) && p1ByLap.get(n)!.valid === 1 && p2ByLap.get(n)!.valid === 1);

  const p1Wins = sharedLaps.filter(n => p1ByLap.get(n)!.lap_time_ms < p2ByLap.get(n)!.lap_time_ms).length;
  const p2Wins = sharedLaps.length - p1Wins;

  const p1Best = p1.stats.best;
  const p2Best = p2.stats.best;
  const gap = p1Best && p2Best ? Math.abs(p1Best - p2Best) : null;
  const faster = p1Best && p2Best ? (p1Best <= p2Best ? p1.name : p2.name) : null;

  return (
    <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        Head to Head
        {/* Driver selectors if 3+ */}
        {standings.length > 2 && (
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <select value={p1idx} onChange={e => setP1idx(+e.target.value)} style={{ fontSize: 11, padding: '3px 8px', height: 26 }}>
              {standings.map((s, i) => i !== p2idx && <option key={i} value={i}>{s.name}</option>)}
            </select>
            <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>vs</span>
            <select value={p2idx} onChange={e => setP2idx(+e.target.value)} style={{ fontSize: 11, padding: '3px 8px', height: 26 }}>
              {standings.map((s, i) => i !== p1idx && <option key={i} value={i}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: sharedLaps.length > 0 ? 16 : 0 }}>
        {/* P1 */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <Link to={`/drivers/${encodeURIComponent(p1.name)}`} style={{ fontSize: 16, fontWeight: 700, color: p1.name === faster ? 'var(--accent-hot)' : 'var(--text-primary)', textDecoration: 'none' }}>
            {p1.name}
          </Link>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: p1.name === faster ? 'var(--accent-hot)' : 'var(--text-primary)', marginTop: 4 }}>
            {p1Best ? formatLapTime(p1Best) : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p1.stats.lapCount} laps</div>
        </div>

        {/* Middle: gap + shared lap wins */}
        <div style={{ textAlign: 'center', padding: '0 20px', flexShrink: 0 }}>
          {gap && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
              {`+${(gap / 1000).toFixed(3)}`}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>vs</div>
          {sharedLaps.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              <span style={{ color: p1Wins > p2Wins ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }}>{p1Wins}</span>
              <span style={{ margin: '0 4px' }}>–</span>
              <span style={{ color: p2Wins > p1Wins ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }}>{p2Wins}</span>
              <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>shared laps</div>
            </div>
          )}
        </div>

        {/* P2 */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <Link to={`/drivers/${encodeURIComponent(p2.name)}`} style={{ fontSize: 16, fontWeight: 700, color: p2.name === faster ? 'var(--accent-hot)' : 'var(--text-primary)', textDecoration: 'none' }}>
            {p2.name}
          </Link>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: p2.name === faster ? 'var(--accent-hot)' : 'var(--text-primary)', marginTop: 4 }}>
            {p2Best ? formatLapTime(p2Best) : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p2.stats.lapCount} laps</div>
        </div>
      </div>

      {/* Lap-by-lap shared laps */}
      {sharedLaps.length > 0 && (
        <div className="table-scroll">
          <table style={{ minWidth: 380 }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>LAP</th>
                <th>{p1.name}</th>
                <th style={{ width: 80, textAlign: 'center' }}>GAP</th>
                <th style={{ textAlign: 'right' }}>{p2.name}</th>
              </tr>
            </thead>
            <tbody>
              {sharedLaps.map(n => {
                const l1 = p1ByLap.get(n)!;
                const l2 = p2ByLap.get(n)!;
                const d = l1.lap_time_ms - l2.lap_time_ms;
                const p1faster = d < 0;
                return (
                  <tr key={n}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{n}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: p1faster ? 700 : 400, color: p1faster ? 'var(--green)' : 'var(--text-secondary)' }}>
                      {formatLapTime(l1.lap_time_ms)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                      {d === 0 ? 'dead heat' : `${p1faster ? '' : '+'}${(d / 1000).toFixed(3)}`}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: !p1faster ? 700 : 400, color: !p1faster ? 'var(--green)' : 'var(--text-secondary)', textAlign: 'right' }}>
                      {formatLapTime(l2.lap_time_ms)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sharedLaps.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
          No shared valid lap numbers in this session
        </div>
      )}
    </div>
  );
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
  const driverNames = standings.map(s => s.name);

  // Focus driver data
  const focusLaps = focusDriver ? (byDriver.get(focusDriver) ?? session.laps) : session.laps;
  const focusStats = calcDriverStats(focusLaps);
  const sessionBestMs = Math.min(...session.laps.filter(l => l.valid === 1).map(l => l.lap_time_ms), Infinity);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header row */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/sessions" style={{ color: 'var(--text-muted)', fontSize: 12 }}>← Sessions</Link>
        <span className={`badge badge-${session.session_type.toLowerCase()}`}>{session.session_type}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '0.05em' }}>
          {trackDisplayName(session.track).toUpperCase()}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          {new Date(session.started_at).toLocaleString()}
        </span>
      </div>

      {/* Head-to-Head — only when 2+ drivers, scrolls internally */}
      {driverNames.length >= 2 && (
        <div style={{ flexShrink: 0, maxHeight: 260, overflowY: 'auto' }}>
          <HeadToHead standings={standings} isMobile={isMobile} />
        </div>
      )}

      {/* Main grid — fills remaining height */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr', gap: 12 }}>
        {/* Standings sidebar — scrollable */}
        <div style={{ minHeight: 0, overflowY: 'auto' }}>
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

        {/* Lap table column — flex column, table fills remaining */}
        <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="section-label" style={{ flexShrink: 0 }}>
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

          <div className="card" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div style={{ height: '100%', overflowY: 'auto', overflowX: 'auto' }}>
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
                  <th>S3</th>
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
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split3_ms, driverStats.bestS3) }}>
                        {lap.split3_ms ? formatLapTime(lap.split3_ms) : '—'}
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
