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

  const currentTrack = tracks.find(t => t.track === selectedTrack);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedTrack}
            onChange={e => setSelectedTrack(e.target.value)}
            style={{ minWidth: 240, paddingRight: 32 }}
          >
            {tracks.map(t => (
              <option key={t.track} value={t.track}>{trackDisplayName(t.track)} ({t.lap_count} laps)</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 10 }}>▼</span>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {['', 'PRACTICE', 'QUALIFY', 'RACE'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              style={{
                padding: '6px 14px',
                fontFamily: 'var(--font-display)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                background: typeFilter === type
                  ? 'linear-gradient(180deg, #aa0000 0%, #770000 100%)'
                  : 'var(--bg-elevated)',
                color: typeFilter === type ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${typeFilter === type ? '#cc0000' : 'var(--border-chrome)'}`,
                borderRadius: 0,
                boxShadow: typeFilter === type ? '0 0 10px rgba(204,0,0,0.3)' : 'none',
                clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
              }}
            >
              {type || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {currentTrack && (
        <div style={{ display: 'flex', gap: 1, marginBottom: 16 }}>
          {[
            { label: 'Total Laps', value: String(currentTrack.lap_count) },
            { label: 'Track Record', value: formatLapTime(currentTrack.fastest_ms), mono: true, highlight: true },
            { label: 'Record Holder', value: currentTrack.fastest_driver },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #111 0%, #0b0b0b 100%)',
              border: '1px solid #222',
              borderTop: '1px solid #333',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.4 }} />
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', marginBottom: 6 }}>
                {stat.label.toUpperCase()}
              </div>
              <div style={{
                fontFamily: stat.mono ? 'var(--font-display)' : 'var(--font-sans)',
                fontWeight: 800,
                fontSize: stat.highlight ? 20 : 16,
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
              <th style={{ width: 48 }}>Pos</th>
              <th>Driver</th>
              <th>Best Lap</th>
              <th>S1</th>
              <th>S2</th>
              <th>Car</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#222', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 11 }}>
                  NO TIMES RECORDED
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={e.driver_name} style={{
                background: i === 0 ? 'linear-gradient(90deg, rgba(204,0,0,0.08) 0%, transparent 100%)' : 'transparent',
                borderLeft: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
                <td style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: i === 0 ? 18 : 13,
                  color: i === 0 ? 'var(--accent-hot)' : 'var(--text-muted)',
                  textShadow: i === 0 ? '0 0 10px rgba(255,32,32,0.5)' : 'none',
                }}>
                  {i === 0 ? '⚑' : i + 1}
                </td>
                <td style={{ fontWeight: 700, fontSize: 14, color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {e.driver_name}
                </td>
                <td style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 15,
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
                <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {e.car_model.replace(/_/g, ' ')}
                </td>
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
