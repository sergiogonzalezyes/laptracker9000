import { useEffect, useRef, useState } from 'react';
import { useLiveStore, LiveLap } from '../../store/liveStore';
import { formatLapTime } from '../../api/client';
import { useDriverTheme } from '../../hooks/useDriverTheme';
import ClaimModal from '../ClaimModal';

// Sector color: compare sector time to driver's personal best sector
function sectorColor(ms: number | null | undefined, bestMs: number): string {
  if (!ms || !bestMs || bestMs === Infinity) return 'var(--text-muted)';
  const pct = (ms - bestMs) / bestMs;
  if (pct <= 0.01) return 'var(--green)';
  if (pct <= 0.04) return '#ffcc00';
  if (pct <= 0.08) return '#ff8800';
  return 'var(--red)';
}

function lapTrend(laps: LiveLap[], idx: number): { sym: string; color: string } | null {
  if (idx < 2) return null;
  const [a, b, c] = [laps[idx - 2], laps[idx - 1], laps[idx]];
  if (!a.valid || !b.valid || !c.valid) return null;
  if (c.lapTimeMs < b.lapTimeMs && b.lapTimeMs < a.lapTimeMs) return { sym: '▲', color: 'var(--green)' };
  if (c.lapTimeMs > b.lapTimeMs && b.lapTimeMs > a.lapTimeMs) return { sym: '▼', color: 'var(--red)' };
  return { sym: '—', color: '#444' };
}

function formatDelta(ms: number, bestMs: number): string {
  if (ms === bestMs) return '⚑';
  const d = ms - bestMs;
  return `+${(d / 1000).toFixed(3)}`;
}

export default function LapFeed({ filterDriver }: { filterDriver?: string | null }) {
  const { recentLaps } = useLiveStore();
  const { selected, drivers, markClaimed } = useDriverTheme();
  const [claimTarget, setClaimTarget] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const now = Date.now();

  // Set of unclaimed driver names
  const unclaimedNames = new Set(drivers.filter(d => !d.claimed).map(d => d.name));

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [recentLaps.length]);

  const laps = filterDriver ? recentLaps.filter(l => l.driverName === filterDriver) : recentLaps;

  // Per-driver best sectors
  const driverBestS1 = new Map<string, number>();
  const driverBestS2 = new Map<string, number>();
  for (const l of laps) {
    if (!l.valid) continue;
    if (l.split1Ms) driverBestS1.set(l.driverName, Math.min(driverBestS1.get(l.driverName) ?? Infinity, l.split1Ms));
    if (l.split2Ms) driverBestS2.set(l.driverName, Math.min(driverBestS2.get(l.driverName) ?? Infinity, l.split2Ms));
  }

  // Session best lap
  const sessionBestMs = Math.min(...laps.filter(l => l.valid).map(l => l.lapTimeMs).filter(Boolean), Infinity);

  // Stats
  const validLaps = laps.filter(l => l.valid);
  const avgMs = validLaps.length ? validLaps.reduce((s, l) => s + l.lapTimeMs, 0) / validLaps.length : 0;
  const bestS1 = Math.min(...laps.filter(l => l.valid && l.split1Ms).map(l => l.split1Ms!), Infinity);
  const bestS2 = Math.min(...laps.filter(l => l.valid && l.split2Ms).map(l => l.split2Ms!), Infinity);
  const theoreticalBest = bestS1 !== Infinity && bestS2 !== Infinity ? bestS1 + bestS2 : null;
  const stdDev = validLaps.length > 1
    ? Math.sqrt(validLaps.map(l => (l.lapTimeMs - avgMs) ** 2).reduce((a, b) => a + b, 0) / validLaps.length)
    : null;

  if (laps.length === 0) return (
    <div style={{ padding: '50px 16px', textAlign: 'center', color: '#1e1e1e', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 12 }}>
      NO LAPS YET
    </div>
  );

  const displayLaps = laps.slice(0, 40);

  return (
    <>
    {claimTarget && (
      <ClaimModal
        driverName={claimTarget}
        onClose={() => setClaimTarget(null)}
        onClaimed={() => {
          setClaimTarget(null);
          const d = drivers.find(x => x.name === claimTarget);
          if (d) markClaimed(d.name, d.color);
        }}
      />
    )}
    <div>
      {/* Stats bar */}
      {validLaps.length > 0 && (
        <div style={{ display: 'flex', gap: 1, borderBottom: '1px solid var(--border)' }}>
          {[
            { label: 'BEST',        value: formatLapTime(sessionBestMs),                    highlight: true },
            { label: 'AVERAGE',     value: avgMs ? formatLapTime(Math.round(avgMs)) : '—',  highlight: false },
            { label: 'THEORY BEST', value: theoreticalBest ? formatLapTime(theoreticalBest) : '—', highlight: false },
            { label: 'CONSISTENCY', value: stdDev ? `±${(stdDev / 1000).toFixed(2)}s` : '—', highlight: false },
            { label: 'VALID LAPS',  value: `${validLaps.length} / ${laps.length}`,          highlight: false },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: '10px 12px', borderRight: '1px solid var(--border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              {s.highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.5 }} />}
              <div style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: s.highlight ? 'var(--accent-hot)' : 'var(--chrome-light)', letterSpacing: '0.03em' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lap table */}
      <div ref={topRef} />
      <div className="table-scroll">
      <table style={{ minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ width: 20 }}></th>
            <th style={{ width: 28 }}>#</th>
            <th>DRIVER</th>
            <th>TIME</th>
            <th>DELTA</th>
            <th>S1</th>
            <th>S2</th>
            <th>CAR</th>
          </tr>
        </thead>
        <tbody>
          {displayLaps.map((lap, idx) => {
            const isNew = now - lap.timestamp < 2000;
            const pulseClass = isNew && lap.isPB ? 'lap-pulse' : isNew ? 'lap-new' : '';
            const timeClass = !lap.valid ? 'lap-invalid' : lap.isPB ? 'lap-pb' : lap.isSessionBest ? 'lap-session' : '';
            const trend = lapTrend(displayLaps, idx);
            const bestS1 = driverBestS1.get(lap.driverName) ?? Infinity;
            const bestS2 = driverBestS2.get(lap.driverName) ?? Infinity;

            return (
              <tr key={lap.id} className={pulseClass}>
                <td style={{ width: 20, padding: '10px 4px' }}>
                  {trend && <span style={{ fontSize: 9, color: trend.color, fontWeight: 700 }}>{trend.sym}</span>}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                  {lap.lapNumber || '—'}
                </td>
                <td style={{ fontWeight: 600, fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {lap.driverName}
                    {!selected && unclaimedNames.has(lap.driverName) && (
                      <button
                        onClick={() => setClaimTarget(lap.driverName)}
                        style={{
                          fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 700,
                          letterSpacing: '0.08em', padding: '2px 7px',
                          background: 'rgba(204,0,0,0.15)', color: 'var(--accent-hot)',
                          border: '1px solid #440000', borderRadius: 0, cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        THIS IS ME!
                      </button>
                    )}
                  </span>
                </td>
                <td className={timeClass} style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
                  {formatLapTime(lap.lapTimeMs)}
                </td>
                <td style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: !lap.valid ? 'var(--text-muted)' : lap.lapTimeMs === sessionBestMs ? 'var(--accent-hot)' : '#888',
                  fontWeight: lap.lapTimeMs === sessionBestMs ? 700 : 400,
                }}>
                  {lap.valid ? formatDelta(lap.lapTimeMs, sessionBestMs) : '—'}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split1Ms, bestS1) }}>
                  {lap.split1Ms ? formatLapTime(lap.split1Ms) : '—'}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: sectorColor(lap.split2Ms, bestS2) }}>
                  {lap.split2Ms ? formatLapTime(lap.split2Ms) : '—'}
                </td>
                <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {lap.carModel.replace(/_/g, ' ')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
    </>
  );
}
