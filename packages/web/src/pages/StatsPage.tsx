import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatLapTime, trackDisplayName } from '../api/client';

type Stats = Awaited<ReturnType<typeof api.stats>>;

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, color: accent ? 'var(--accent-hot)' : 'var(--text-primary)', letterSpacing: '0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const navigate = useNavigate();

  useEffect(() => { api.stats().then(setStats); }, []);

  if (!stats) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      Loading stats...
    </div>
  );

  const { totals, fastestLap, mostActiveDriver, mostRacedTrack, sessionTypes, topDrivers } = stats;
  const practiceCount = sessionTypes.find(s => s.session_type === 'PRACTICE')?.count ?? 0;
  const qualifyCount  = sessionTypes.find(s => s.session_type === 'QUALIFY')?.count ?? 0;
  const raceCount     = sessionTypes.find(s => s.session_type === 'RACE')?.count ?? 0;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      {/* Page header */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Stats</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>All-time statistics across all drivers and tracks</div>
      </div>

      {/* Hero stat grid */}
      <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        <StatCard label="Total Laps"     value={totals.total_laps.toLocaleString()} />
        <StatCard label="Valid Laps"     value={totals.valid_laps.toLocaleString()} sub={`${Math.round(totals.valid_laps / totals.total_laps * 100)}% clean`} />
        <StatCard label="Drivers"        value={String(totals.total_drivers)} />
        <StatCard label="Tracks"         value={String(totals.total_tracks)} />
        <StatCard label="Sessions"       value={totals.total_sessions.toLocaleString()} />
      </div>

      {/* Highlights row */}
      <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {fastestLap && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Fastest Lap Ever</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: 'var(--accent-hot)', marginBottom: 4 }}>{formatLapTime(fastestLap.lap_time_ms)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{fastestLap.driver_name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{trackDisplayName(fastestLap.track)} · {fastestLap.car_model.replace(/_/g, ' ')}</div>
          </div>
        )}

        {mostActiveDriver && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${mostActiveDriver.color}`, borderRadius: 10, padding: '16px 18px', cursor: 'pointer' }}
            onClick={() => navigate(`/drivers/${encodeURIComponent(mostActiveDriver.name)}`)}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Most Active Driver</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: mostActiveDriver.color, marginBottom: 4 }}>{mostActiveDriver.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mostActiveDriver.lap_count.toLocaleString()} laps driven</div>
          </div>
        )}

        {mostRacedTrack && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--green)', borderRadius: 10, padding: '16px 18px', cursor: 'pointer' }}
            onClick={() => navigate(`/leaderboard?track=${encodeURIComponent(mostRacedTrack.track)}`)}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Most Raced Track</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{trackDisplayName(mostRacedTrack.track)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mostRacedTrack.lap_count.toLocaleString()} laps</div>
          </div>
        )}

        {/* Session type breakdown */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Session Types</div>
          {[
            { label: 'Practice', count: practiceCount, color: '#666' },
            { label: 'Qualify',  count: qualifyCount,  color: 'var(--yellow)' },
            { label: 'Race',     count: raceCount,     color: 'var(--accent-hot)' },
          ].map(({ label, count, color }) => {
            const total = practiceCount + qualifyCount + raceCount;
            const pct = total ? Math.round(count / total * 100) : 0;
            return (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{count}</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top drivers table */}
      <div className="card" style={{ flexShrink: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Driver Rankings</div>
        </div>
        <div className="table-scroll">
          <table style={{ minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ width: 48 }}>Rank</th>
                <th>Driver</th>
                <th>Total Laps</th>
                <th>Tracks</th>
                <th>Best Lap</th>
              </tr>
            </thead>
            <tbody>
              {(topDrivers as any[]).map((d, i) => (
                <tr key={d.name} style={{ cursor: 'pointer' }} onClick={() => navigate(`/drivers/${encodeURIComponent(d.name)}`)}>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: i === 0 ? 20 : 13, fontWeight: 700, color: i === 0 ? '#e8b000' : 'var(--text-muted)' }}>
                    {i === 0 ? '1' : i + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{d.total_laps.toLocaleString()}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.track_count}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: i === 0 ? '#e8b000' : 'var(--text-primary)', fontWeight: i === 0 ? 700 : 400 }}>
                    {d.best_lap_ms ? formatLapTime(d.best_lap_ms) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
