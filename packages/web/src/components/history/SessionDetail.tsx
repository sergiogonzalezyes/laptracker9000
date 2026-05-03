import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Session, Lap, formatLapTime, trackDisplayName } from '../../api/client';

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<(Session & { laps: Lap[] }) | null>(null);

  useEffect(() => {
    if (id) api.session(parseInt(id, 10)).then(setSession);
  }, [id]);

  if (!session) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>;

  const validLaps = session.laps.filter(l => l.valid === 1);
  const bestMs = validLaps.length ? Math.min(...validLaps.map(l => l.lap_time_ms)) : null;

  // Group by driver for standings
  const byDriver = new Map<string, Lap[]>();
  for (const lap of session.laps) {
    const arr = byDriver.get(lap.driver_name) ?? [];
    arr.push(lap);
    byDriver.set(lap.driver_name, arr);
  }
  const standings = [...byDriver.entries()].map(([name, laps]) => {
    const best = laps.filter(l => l.valid === 1).reduce((a, b) => a.lap_time_ms < b.lap_time_ms ? a : b, laps[0]);
    return { name, best, totalLaps: laps.length };
  }).sort((a, b) => (a.best?.valid === 1 ? a.best.lap_time_ms : Infinity) - (b.best?.valid === 1 ? b.best.lap_time_ms : Infinity));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/history" style={{ color: 'var(--text-muted)', fontSize: 13 }}>← History</Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 24 }}>
        <span className={`badge badge-${session.session_type.toLowerCase()}`}>{session.session_type}</span>
        <h1 style={{ fontWeight: 700, fontSize: 22 }}>{trackDisplayName(session.track)}</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {new Date(session.started_at).toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Standings sidebar */}
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Standings</h3>
          <div className="card">
            {standings.map((s, i) => (
              <div key={s.name} style={{ padding: '10px 14px', borderBottom: i < standings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: 8, fontSize: 12 }}>P{i + 1}</span>
                    <Link to={`/drivers/${encodeURIComponent(s.name)}`} style={{ color: 'inherit', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-hot)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}>
                      {s.name}
                    </Link>
                  </span>
                  <span className="mono" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-primary)', fontWeight: 700 }}>
                    {s.best?.valid === 1 ? formatLapTime(s.best.lap_time_ms) : '—'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  {s.totalLaps} laps · {s.best?.car_model?.replace(/_/g, ' ') ?? ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lap table */}
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            All Laps ({session.laps.length})
          </h3>
          <div className="card">
            <table>
              <thead>
                <tr><th>#</th><th>Driver</th><th>Time</th><th>S1</th><th>S2</th><th>Car</th><th>Status</th></tr>
              </thead>
              <tbody>
                {session.laps.map(lap => (
                  <tr key={lap.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{lap.lap_number}</td>
                    <td style={{ fontWeight: 500 }}>
                      <Link to={`/drivers/${encodeURIComponent(lap.driver_name)}`} style={{ color: 'inherit', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-hot)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}>
                        {lap.driver_name}
                      </Link>
                    </td>
                    <td className={`mono ${lap.valid === 1 ? (lap.lap_time_ms === bestMs ? 'lap-session' : '') : 'lap-invalid'}`}
                        style={{ fontWeight: 700, fontSize: 14 }}>
                      {formatLapTime(lap.lap_time_ms)}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {lap.split1_ms ? formatLapTime(lap.split1_ms) : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {lap.split2_ms ? formatLapTime(lap.split2_ms) : '—'}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lap.car_model.replace(/_/g, ' ')}</td>
                    <td>
                      {lap.valid === 0 ? <span style={{ color: 'var(--red)', fontSize: 11 }}>✗ {lap.cuts}c</span>
                        : lap.lap_time_ms === bestMs ? <span style={{ color: 'var(--accent)', fontSize: 11 }}>⚑ Best</span>
                        : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
