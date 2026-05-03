import { useEffect, useState } from 'react';
import { api, LeaderboardEntry, TrackSummary, formatLapTime, trackDisplayName } from '../../api/client';

export default function Leaderboard() {
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.tracks().then(t => { setTracks(t); if (t[0]) setSelectedTrack(t[0].track); });
  }, []);

  useEffect(() => {
    if (!selectedTrack) return;
    const params = new URLSearchParams({ track: selectedTrack });
    if (typeFilter) params.set('type', typeFilter);
    api.leaderboard('?' + params).then(setEntries);
  }, [selectedTrack, typeFilter]);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={selectedTrack}
          onChange={e => setSelectedTrack(e.target.value)}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 13, minWidth: 220 }}
        >
          {tracks.map(t => (
            <option key={t.track} value={t.track}>{trackDisplayName(t.track)} ({t.lap_count} laps)</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                background: typeFilter === type ? 'var(--accent)' : 'var(--bg-elevated)',
                color: typeFilter === type ? '#000' : 'var(--text-secondary)',
                border: '1px solid ' + (typeFilter === type ? 'var(--accent)' : 'var(--border)'),
              }}
            >
              {type || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="card">
        <table>
          <thead>
            <tr><th>Pos</th><th>Driver</th><th>Best Lap</th><th>S1</th><th>S2</th><th>Car</th><th>Date</th></tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No times recorded</td></tr>
            )}
            {entries.map((e, i) => (
              <tr key={e.driver_name}>
                <td style={{ fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {i === 0 ? '⚑' : i + 1}
                </td>
                <td style={{ fontWeight: 600 }}>{e.driver_name}</td>
                <td className="mono" style={{ fontWeight: 700, fontSize: 15, color: i === 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {formatLapTime(e.lap_time_ms)}
                </td>
                <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {e.split1_ms ? formatLapTime(e.split1_ms) : '—'}
                </td>
                <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {e.split2_ms ? formatLapTime(e.split2_ms) : '—'}
                </td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.car_model.replace(/_/g, ' ')}</td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(e.completed_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Track stats grid */}
      {selectedTrack && tracks.length > 0 && (() => {
        const t = tracks.find(t => t.track === selectedTrack);
        if (!t) return null;
        return (
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Total Laps', value: t.lap_count },
              { label: 'Track Record', value: formatLapTime(t.fastest_ms) },
              { label: 'Record Holder', value: t.fastest_driver },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: '12px 16px', flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{stat.label}</div>
                <div className={stat.label === 'Track Record' ? 'mono' : ''} style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
