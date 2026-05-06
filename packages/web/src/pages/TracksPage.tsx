import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, TrackSummary, formatLapTime, trackDisplayName } from '../api/client';

export default function TracksPage() {
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { api.tracks().then(setTracks); }, []);

  const filtered = tracks.filter(t =>
    trackDisplayName(t.track).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Tracks</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{tracks.length} tracks raced</div>
        </div>
        <input
          placeholder="Search tracks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', width: 200 }}
        />
      </div>

      {/* Track grid */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {filtered.map(t => (
            <div key={t.track} onClick={() => navigate(`/leaderboard?track=${encodeURIComponent(t.track)}`)}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '16px', cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 12px rgba(204,0,0,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.4)'; }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                {trackDisplayName(t.track)}
              </div>
              {t.track_config && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }}>{t.track_config}</div>}

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent-hot)', marginBottom: 4 }}>
                {t.fastest_ms ? formatLapTime(t.fastest_ms) : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{t.fastest_driver || '—'}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.lap_count} laps</span>
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
